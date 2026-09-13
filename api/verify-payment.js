const crypto = require("crypto");
const Razorpay = require("razorpay");
const {
    authenticateShiprocket,
    createShiprocketOrder,
    getShipmentTracking
} = require("../lib/shiprocket");
const {
    getProductShippingMetadata
} = require("../lib/product-shipping");

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
        "city",
        "state",
        "pincode",
        "country"
    ];

    const result = {};

    for (const field of fields) {
        if (
            typeof shipping[field] !== "string" ||
            !shipping[field].trim()
        ) {
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
            quantity,
            price
        };
    });

    return items.every(Boolean) ? items : null;
}

function buildShiprocketOrder(orderId, paymentId, shipping, cart) {
    const missingMetadata = [];
    const orderItems = [];
    let totalWeight = 0;
    let length = 0;
    let breadth = 0;
    let height = 0;
    let subtotal = 0;

    for (const item of cart) {
        const metadata = getProductShippingMetadata(item.id);

        if (
            !metadata ||
            !metadata.sku ||
            !Number.isFinite(metadata.weight) ||
            metadata.weight <= 0 ||
            !Number.isFinite(metadata.length) ||
            metadata.length <= 0 ||
            !Number.isFinite(metadata.breadth) ||
            metadata.breadth <= 0 ||
            !Number.isFinite(metadata.height) ||
            metadata.height <= 0
        ) {
            missingMetadata.push(item.id);
            continue;
        }

        subtotal += item.price * item.quantity;
        totalWeight += metadata.weight * item.quantity;
        length = Math.max(length, metadata.length);
        breadth = Math.max(breadth, metadata.breadth);
        height = Math.max(height, metadata.height);

        orderItems.push({
            name: item.name,
            sku: metadata.sku,
            units: String(item.quantity),
            selling_price: item.price.toFixed(2),
            discount: "0",
            tax: "0",
            hsn: metadata.hsn || ""
        });
    }

    if (missingMetadata.length) {
        return {
            missingMetadata,
            order: null
        };
    }

    const orderReference =
        `terra-${orderId}`
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .slice(0, 40);

    const billingName = shipping.name.trim().split(/\s+/);
    const billingCustomerName = billingName.shift();
    const billingLastName = billingName.join(" ");

    return {
        missingMetadata: [],
        order: {
            order_id: orderReference,
            order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
            pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
            comment: "Razorpay payment verified",
            billing_customer_name: billingCustomerName,
            billing_last_name: billingLastName,
            billing_address: shipping.address,
            billing_address_2: "",
            billing_city: shipping.city,
            billing_pincode: shipping.pincode,
            billing_state: shipping.state,
            billing_country: shipping.country,
            billing_email: shipping.email,
            billing_phone: shipping.phone,
            billing_alternate_phone: "",
            shipping_is_billing: true,
            shipping_customer_name: shipping.name,
            shipping_last_name: billingLastName,
            shipping_address: shipping.address,
            shipping_address_2: "",
            shipping_city: shipping.city,
            shipping_pincode: shipping.pincode,
            shipping_country: shipping.country,
            shipping_state: shipping.state,
            shipping_email: shipping.email,
            shipping_phone: shipping.phone,
            order_items: orderItems,
            payment_method: "Prepaid",
            shipping_charges: "0",
            giftwrap_charges: "0",
            transaction_charges: "0",
            total_discount: "0",
            sub_total: subtotal.toFixed(2),
            length: String(length),
            breadth: String(breadth),
            height: String(height),
            weight: totalWeight.toFixed(3),
            ewaybill_no: "",
            customer_gstin: "",
            invoice_number: orderReference,
            order_type: "ESSENTIALS"
        }
    };
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
            (total, item) =>
                total + item.price * item.quantity,
            0
        ) * 100
    );

    if (razorpayOrder.amount !== cartTotalInPaise) {
        return sendJson(response, 400, {
            error: "Payment amount does not match the cart"
        });
    }

    if (!process.env.SHIPROCKET_PICKUP_LOCATION) {
        return sendJson(response, 200, {
            success: true,
            payment_verified: true,
            shipment: {
                status: "pending_configuration",
                message: "Payment verified; Shiprocket pickup location is not configured"
            }
        });
    }

    const shipmentOrder = buildShiprocketOrder(
        orderId,
        paymentId,
        normalisedShipping,
        validatedCart
    );

    if (shipmentOrder.missingMetadata.length) {
        return sendJson(response, 200, {
            success: true,
            payment_verified: true,
            shipment: {
                status: "pending_configuration",
                message: "Payment verified; product shipping metadata is incomplete",
                missing_products: shipmentOrder.missingMetadata
            }
        });
    }

    try {
        const token = await authenticateShiprocket();
        const createdOrder = await createShiprocketOrder(
            shipmentOrder.order,
            token
        );
        const shipmentId = createdOrder.shipment_id;
        let tracking = null;

        if (shipmentId) {
            try {
                tracking = await getShipmentTracking(
                    shipmentId,
                    token
                );
            } catch (error) {
                tracking = {
                    status: "pending"
                };
            }
        }

        return sendJson(response, 200, {
            success: true,
            payment_verified: true,
            shipment: {
                status: "created",
                order_id: createdOrder.order_id || shipmentOrder.order.order_id,
                shipment_id: shipmentId || null,
                tracking
            }
        });
    } catch (error) {
        return sendJson(response, 200, {
            success: true,
            payment_verified: true,
            shipment: {
                status: "pending",
                message: "Payment verified; shipment creation will be retried",
                recoverable: true
            }
        });
    }

};
