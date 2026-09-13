const Razorpay = require("razorpay");

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

    const amount = body && body.amount;

    if (
        !Number.isSafeInteger(amount) ||
        amount < 100
    ) {
        return sendJson(response, 400, {
            error: "Amount must be at least 100 paise"
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
            amount,
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
