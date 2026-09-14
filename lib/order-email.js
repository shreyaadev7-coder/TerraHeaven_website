const { Resend } = require("resend");

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatRupees(amountInPaise) {
    return `₹${(amountInPaise / 100).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function renderRows(items) {
    return items.map(item => {
        const itemTotal = item.price * item.quantity;
        const notes = Object.values(item.selections || {})
            .filter(Boolean)
            .join(" • ");

        return `
            <tr>
                <td style="padding:8px;border-bottom:1px solid #e8e5df">
                    ${escapeHtml(item.name)}
                    ${item.sku ? `<br><small>SKU: ${escapeHtml(item.sku)}</small>` : ""}
                    ${notes ? `<br><small>Options: ${escapeHtml(notes)}</small>` : ""}
                </td>
                <td style="padding:8px;border-bottom:1px solid #e8e5df;text-align:center">
                    ${item.quantity}
                </td>
                <td style="padding:8px;border-bottom:1px solid #e8e5df;text-align:right">
                    ${formatRupees(item.price * 100)}
                </td>
                <td style="padding:8px;border-bottom:1px solid #e8e5df;text-align:right">
                    ${formatRupees(itemTotal * 100)}
                </td>
            </tr>`;
    }).join("");
}

function renderCustomizationNotes(items) {
    const notes = items.flatMap(item =>
        Object.entries(item.selections || {})
            .filter(([, value]) => value)
            .map(([label, value]) => `${item.name}: ${label} - ${value}`)
    );

    return notes.length
        ? notes.map(note => `<li>${escapeHtml(note)}</li>`).join("")
        : "<li>No customization or gift notes provided.</li>";
}

function buildOrderEmail(order) {
    const shipping = order.shipping;
    const items = order.items;
    const subtotalInPaise = items.reduce(
        (sum, item) => sum + item.price * item.quantity * 100,
        0
    );
    const shippingInPaise = order.shippingChargeInPaise || 0;
    const finalInPaise = order.razorpayAmountInPaise;

    return `
        <div style="font-family:Arial,sans-serif;color:#2c2b29;max-width:760px;margin:auto">
            <h1 style="font-weight:400">New Terra Haven Order – ${escapeHtml(order.orderId)}</h1>

            <h2>CUSTOMER</h2>
            <p><strong>Name:</strong> ${escapeHtml(shipping.name)}<br>
            <strong>Email:</strong> ${escapeHtml(shipping.email)}<br>
            <strong>Phone:</strong> ${escapeHtml(shipping.phone)}</p>

            <h2>SHIPPING ADDRESS</h2>
            <p>${escapeHtml(shipping.address)}${shipping.apartment ? `<br>${escapeHtml(shipping.apartment)}` : ""}<br>
            ${escapeHtml(shipping.city)}, ${escapeHtml(shipping.state)}<br>
            ${escapeHtml(shipping.pincode)}, ${escapeHtml(shipping.country)}</p>

            <h2>ORDER</h2>
            <p><strong>Order ID:</strong> ${escapeHtml(order.orderId)}<br>
            <strong>Razorpay Order ID:</strong> ${escapeHtml(order.razorpayOrderId)}<br>
            <strong>Razorpay Payment ID:</strong> ${escapeHtml(order.razorpayPaymentId)}<br>
            <strong>Payment Status:</strong> ${escapeHtml(order.paymentStatus)}<br>
            <strong>Order Date/Time:</strong> ${escapeHtml(order.orderDate)}</p>

            <h2>ITEMS</h2>
            <table style="border-collapse:collapse;width:100%">
                <thead><tr>
                    <th style="padding:8px;text-align:left">Product</th>
                    <th style="padding:8px">Quantity</th>
                    <th style="padding:8px;text-align:right">Unit Price</th>
                    <th style="padding:8px;text-align:right">Total</th>
                </tr></thead>
                <tbody>${renderRows(items)}</tbody>
            </table>

            <h2>TOTAL</h2>
            <p><strong>Subtotal:</strong> ${formatRupees(subtotalInPaise)}<br>
            <strong>Delivery Charge:</strong> ${formatRupees(shippingInPaise)}<br>
            <strong>Final Paid Amount:</strong> ${formatRupees(finalInPaise)}</p>

            <h2>CUSTOMIZATION / NOTES</h2>
            <ul>${renderCustomizationNotes(items)}</ul>
        </div>`;
}

async function sendOrderNotification(order) {
    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.ORDER_NOTIFICATION_EMAIL;
    const sender = process.env.ORDER_EMAIL_FROM;

    if (!apiKey || !recipient || !sender) {
        const error = new Error("Order email is not configured");
        error.statusCode = 500;
        throw error;
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send(
        {
            from: sender,
            to: recipient,
            subject: `New Terra Haven Order – ${order.orderId}`,
            html: buildOrderEmail(order)
        },
        {
            idempotencyKey: `terra-order-${order.razorpayPaymentId}`
        }
    );

    if (result.error) {
        const error = new Error(result.error.message || "Order email failed");
        error.statusCode = 502;
        throw error;
    }

    return result.data;
}

module.exports = {
    sendOrderNotification
};
