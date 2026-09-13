const PRODUCT_SHIPPING_METADATA = Object.freeze({
    // Add real values per product before enabling Shiprocket order creation.
    // Example: "single-bed-1": { sku: "single-bed-1", weight: 1.2, length: 30, breadth: 25, height: 8 }
});

function getProductShippingMetadata(productId) {
    return PRODUCT_SHIPPING_METADATA[productId] || null;
}

module.exports = {
    getProductShippingMetadata
};
