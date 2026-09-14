const { sendNewsletterSignup } = require("../lib/order-email");

function sendJson(response, statusCode, body) {
    response.status(statusCode).setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(body));
}

function getBody(request) {
    if (typeof request.body !== "string") return request.body || {};
    try {
        return JSON.parse(request.body);
    } catch (error) {
        return null;
    }
}

module.exports = async function newsletterSignup(request, response) {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        return sendJson(response, 405, { error: "Method not allowed" });
    }

    const body = getBody(request);
    const email = String(body?.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendJson(response, 400, { error: "Enter a valid email address" });
    }

    try {
        const result = await sendNewsletterSignup(email);
        return sendJson(response, 200, { success: true, id: result?.id || null });
    } catch (error) {
        return sendJson(response, 500, { error: "Unable to process signup" });
    }
};
