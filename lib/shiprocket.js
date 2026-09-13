const SHIPROCKET_BASE_URL =
    "https://apiv2.shiprocket.in/v1/external";

async function parseResponse(response) {
    const text = await response.text();
    let data;

    try {
        data = JSON.parse(text);
    } catch (error) {
        throw new Error("Shiprocket returned an invalid response");
    }

    if (!response.ok) {
        const error = new Error(
            data.message ||
            data.error ||
            "Shiprocket request failed"
        );
        error.statusCode = response.status;
        throw error;
    }

    return data;
}

async function shiprocketRequest(path, options = {}) {
    const response = await fetch(
        `${SHIPROCKET_BASE_URL}${path}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    return parseResponse(response);
}

async function authenticateShiprocket() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        const error = new Error("Shiprocket is not configured");
        error.statusCode = 500;
        throw error;
    }

    const response = await shiprocketRequest(
        "/auth/login",
        {
            method: "POST",
            body: JSON.stringify({ email, password })
        }
    );

    if (!response.token) {
        const error = new Error("Shiprocket authentication failed");
        error.statusCode = 502;
        throw error;
    }

    return response.token;
}

async function createShiprocketOrder(order, token) {
    return shiprocketRequest(
        "/orders/create/adhoc",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(order)
        }
    );
}

async function getShipmentTracking(shipmentId, token) {
    return shiprocketRequest(
        `/courier/track/shipment/${encodeURIComponent(shipmentId)}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

module.exports = {
    authenticateShiprocket,
    createShiprocketOrder,
    getShipmentTracking
};
