const Razorpay = require("razorpay");
const {
    PRODUCT_PRICES,
    getProductPrice,
    getOrderTotals
} = require("../lib/order-pricing");

function sendJson(response, statusCode, body) {
    response.status(statusCode).setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(body));
}

module.exports = async function createOrder(request, response) {
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

    const cart = body && body.cart;
    if (!Array.isArray(cart) || !cart.length) {
        return sendJson(response, 400, {
            error: "A non-empty cart is required"
        });
    }

    const validatedCart = cart.map(item => {
        const quantity = Number(item && item.quantity);
        const price = Number(item && item.price);
        const id = item && item.id;
        const selections = item && item.selections;

        if (
            typeof id !== "string" ||
            !Object.prototype.hasOwnProperty.call(PRODUCT_PRICES, id) ||
            !selections || typeof selections !== "object" ||
            price !== getProductPrice(id, selections) ||
            !Number.isSafeInteger(quantity) ||
            quantity <= 0
        ) return null;

        return { id, price, quantity, selections };
    });

    if (validatedCart.some(item => !item)) {
        return sendJson(response, 400, { error: "Cart items are invalid" });
    }

    const amountInRupees = getOrderTotals(validatedCart).total;

    const amountInPaise =
        Math.round(amountInRupees * 100);

    if (
        !Number.isSafeInteger(amountInPaise) ||
        amountInPaise < 100
    ) {
        return sendJson(response, 400, {
            error: "Amount must be at least ₹1"
        });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return sendJson(response, 500, { error: "Razorpay is not configured" });
    }

    try {
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `terra_${Date.now()}`
        });

        return sendJson(response, 200, {
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: keyId
        });
    } catch (error) {
        const statusCode =
            error && error.statusCode === 401
                ? 401
                : 500;

        return sendJson(response, statusCode, {
            error: "Unable to create Razorpay order"
        });
    }
};
