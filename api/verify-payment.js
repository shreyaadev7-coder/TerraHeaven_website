const crypto = require("crypto");
const Razorpay = require("razorpay");
const {
    sendOrderNotification
} = require("../lib/order-email");

function sendJson(response, statusCode, body) {
    response.status(statusCode).setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(body));
}

function normaliseShipping(shipping) {
    if (!shipping || typeof shipping !== "object") {
        return null;
    }

    const fields = [
        "name",
        "phone",
        "email",
        "address",
        "apartment",
        "city",
        "state",
        "pincode",
        "country"
    ];
    const result = {};

    for (const field of fields) {
        if (field === "apartment" && shipping[field] === undefined) {
            result[field] = "";
            continue;
        }

        if (typeof shipping[field] !== "string" || !shipping[field].trim()) {
            return null;
        }

        result[field] = shipping[field].trim();
    }

    return result;
}

function validateCart(cart) {
    if (!Array.isArray(cart) || !cart.length) {
        return null;
    }

    const items = cart.map(item => {
        const quantity = Number(item && item.quantity);
        const price = Number(item && item.price);
        const id = item && item.id;
        const name = item && item.name;

        if (
            typeof id !== "string" ||
            typeof name !== "string" ||
            !Number.isSafeInteger(quantity) ||
            quantity <= 0 ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            return null;
        }

        return {
            id,
            name,
            sku: typeof item.sku === "string" ? item.sku : id,
            quantity,
            price,
            selections: item.selections && typeof item.selections === "object"
                ? item.selections
                : {}
        };
    });

    return items.every(Boolean) ? items : null;
}

function getOrderDate() {
    return new Date().toISOString();
}

module.exports = async function verifyPayment(request, response) {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        return sendJson(response, 405, { error: "Method not allowed" });
    }

    let body = request.body;

    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch (error) {
            return sendJson(response, 400, { error: "Invalid JSON body" });
        }
    }

    const {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        shipping,
        cart
    } = body || {};

    if (
        typeof orderId !== "string" ||
        typeof paymentId !== "string" ||
        typeof signature !== "string" ||
        !orderId ||
        !paymentId ||
        !signature
    ) {
        return sendJson(response, 400, {
            error: "Missing payment verification fields"
        });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!keySecret || !keyId) {
        return sendJson(response, 500, { error: "Razorpay is not configured" });
    }

    const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(signature, "utf8");
    const isValid =
        expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
        return sendJson(response, 400, {
            error: "Payment signature verification failed"
        });
    }

    const normalisedShipping = normaliseShipping(shipping);
    const validatedCart = validateCart(cart);

    if (!normalisedShipping || !validatedCart) {
        return sendJson(response, 400, {
            error: "Shipping details and cart items are required"
        });
    }

    const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
    let razorpayOrder;

    try {
        razorpayOrder = await razorpay.orders.fetch(orderId);
    } catch (error) {
        return sendJson(response, 502, {
            error: "Unable to confirm Razorpay order"
        });
    }

    const cartTotalInPaise = Math.round(
        validatedCart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        ) * 100
    );

    if (razorpayOrder.amount !== cartTotalInPaise) {
        return sendJson(response, 400, {
            error: "Payment amount does not match the cart"
        });
    }

    const orderIdForEmail = `terra-${orderId}`
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .slice(0, 40);
    const emailOrder = {
        orderId: orderIdForEmail,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        paymentStatus: "Paid",
        orderDate: getOrderDate(),
        shipping: normalisedShipping,
        items: validatedCart,
        shippingChargeInPaise: 0,
        razorpayAmountInPaise: razorpayOrder.amount
    };

    try {
        const email = await sendOrderNotification(emailOrder);

        return sendJson(response, 200, {
            success: true,
            payment_verified: true,
            notification: {
                status: "sent",
                id: email && email.id ? email.id : null
            }
        });
    } catch (error) {
        return sendJson(response, 200, {
            success: true,
            payment_verified: true,
            notification: {
                status: "pending",
                message: "Payment verified, but the order notification could not be sent",
                recoverable: true
            }
        });
    }
};
