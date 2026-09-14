const DELIVERY_FEE = 50;

const PRODUCT_PRICES = Object.freeze({
    "double-bed-1": 1299,
    "single-bed-1": 499,
    "bedspread-1": 899,
    "bedspread-2": 899,
    "bedspread-3": 949,
    "bedspread-4": 949,
    "bedspread-6": 999,
    "bedspread-7": 1049,
    "bedspread-8": 1049,
    "bedspread-9": 1099,
    "bedspread-10": 1099,
    "cushion-1": 199,
    "cushion-2": 199,
    "cushion-3": 199,
    "cushion-4": 199,
    "cushion-5": 449,
    "bag-3": 199,
    "tote-1": 199,
    "oil-sesame": 235,
    "oil-groundnut": 168,
    "oil-coconut": 285,
    "quilt-1": 1199,
    "quilt-2": 1199,
    "quilt-3": 1199,
    "quilt-4": 1199
});

function getOrderTotals(items) {
    const subtotal = items.reduce((total, item) =>
        total + Number(item.price) * Number(item.quantity), 0
    );
    const delivery = items.length ? DELIVERY_FEE : 0;

    return { subtotal, delivery, total: subtotal + delivery };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { DELIVERY_FEE, PRODUCT_PRICES, getOrderTotals };
} else {
    window.TERRA_ORDER_PRICING = { DELIVERY_FEE, getOrderTotals };
}