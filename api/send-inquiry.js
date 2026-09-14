const { sendDesignInquiry } = require("../lib/order-email");

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

module.exports = async function sendInquiry(request, response) {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        return sendJson(response, 405, { error: "Method not allowed" });
    }

    const body = getBody(request);
    const email = String(body?.email || "").trim();
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();

    if (!body || !name || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendJson(response, 400, { error: "Name, phone, and a valid email are required" });
    }

    try {
        const result = await sendDesignInquiry({
            name,
            email,
            phone,
            bundle: String(body.preferredBundle || body.bundle || "Custom bundle").slice(0, 200),
            bundleTotal: Number(body.bundleTotal) || 0,
            items: Array.isArray(body.items) ? body.items.slice(0, 20) : [],
            customizationDetails: String(body.customizationDetails || "").slice(0, 2000),
            giftMessage: String(body.giftMessage || "").slice(0, 1000),
            additionalNotes: String(body.additionalNotes || "").slice(0, 2000)
        });
        return sendJson(response, 200, { success: true, id: result?.id || null });
    } catch (error) {
        return sendJson(response, 500, { error: "Unable to send inquiry" });
    }
};
