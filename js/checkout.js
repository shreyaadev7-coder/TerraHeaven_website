document.addEventListener("DOMContentLoaded", () => {
    const CART_STORAGE_KEY = "terra-haven-cart";
    const SHIPPING_STORAGE_KEY = "terra-haven-shipping";
    const form = document.getElementById("shipping-form");
    const content = document.getElementById("checkout-content");
    const emptyState = document.getElementById("checkout-empty");
    const itemsElement = document.getElementById("checkout-items");
    const subtotalElement = document.getElementById("checkout-subtotal");
    const deliveryElement = document.getElementById("checkout-delivery");
    const totalElement = document.getElementById("checkout-total");
    const payButton = document.getElementById("pay-button");
    const messageElement = document.getElementById("checkout-message");
    let cart = [];
    let paymentInProgress = false;

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatPrice(price) {
        return "₹" + Number(price).toLocaleString("en-IN");
    }

    function readStorage(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        } catch (error) {
            return fallback;
        }
    }

    cart = readStorage(CART_STORAGE_KEY, []).filter(item =>
        item && item.product && item.product.id && Number(item.quantity) > 0
    );

    if (!cart.length) {
        content.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
    }

    const shippingDraft = readStorage(SHIPPING_STORAGE_KEY, {});
    Object.entries(shippingDraft).forEach(([name, value]) => {
        const field = form.elements[name];
        if (field) field.value = value;
    });

    function getOrderTotals() {
        return window.TERRA_ORDER_PRICING.getOrderTotals(
            cart.map(item => ({
                id: item.product.id,
                price: getCartItemPrice(item),
                quantity: item.quantity,
                selections: item.selections || {}
            }))
        );
    }

    function getCartItemPrice(item) {
        return window.TERRA_ORDER_PRICING.getProductPrice(
            item.product.id,
            item.selections || {}
        );
    }

    function getCheckoutCart() {
        return cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku || item.product.id,
            price: getCartItemPrice(item),
            quantity: Number(item.quantity),
            selections: item.selections || {}
        }));
    }

    function renderSummary() {
        itemsElement.innerHTML = cart.map(item => {
            const selections = Object.values(item.selections || {}).filter(Boolean).join(" • ");
            const itemTotal = Number(item.product.price) * Number(item.quantity);

            return `<div class="checkout-summary-item">
                <img src="${escapeHtml(item.product.images[0])}" alt="${escapeHtml(item.product.name)}">
                <div class="min-w-0 flex-1">
                    <div class="flex justify-between gap-3">
                        <h3 class="font-serif text-lg">${escapeHtml(item.product.name)}</h3>
                        <span class="text-sm">${formatPrice(itemTotal)}</span>
                    </div>
                    ${selections ? `<p class="text-xs text-charcoal/60 mt-1">${escapeHtml(selections)}</p>` : ""}
                    <p class="text-xs text-charcoal/60 mt-2">Qty ${item.quantity} · ${formatPrice(item.product.price)} each</p>
                </div>
            </div>`;
        }).join("");

        const totals = getOrderTotals();
        subtotalElement.textContent = formatPrice(totals.subtotal);
        deliveryElement.textContent = formatPrice(totals.delivery);
        totalElement.textContent = formatPrice(totals.total);
    }

    function setMessage(message, isError = false) {
        messageElement.textContent = message;
        messageElement.classList.remove("hidden", "text-clay", "text-red-600");
        messageElement.classList.add(isError ? "text-red-600" : "text-clay");
    }

    function validateShipping() {
        const shipping = Object.fromEntries(new FormData(form).entries());
        const errors = {};
        const requiredFields = ["name", "email", "phone", "address", "city", "state", "pincode", "country"];

        requiredFields.forEach(field => {
            if (!String(shipping[field] || "").trim()) errors[field] = "This field is required.";
        });

        if (shipping.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
            errors.email = "Enter a valid email address.";
        }
        if (shipping.phone && !/^[+\d][\d\s()-]{7,}$/.test(shipping.phone)) {
            errors.phone = "Enter a valid phone number.";
        }
        if (shipping.pincode && !/^\d{5,6}$/.test(shipping.pincode.trim())) {
            errors.pincode = "Enter a valid pincode.";
        }

        form.querySelectorAll("[data-error-for]").forEach(errorElement => {
            const field = errorElement.dataset.errorFor;
            const input = form.elements[field];
            errorElement.textContent = errors[field] || "";
            input?.setAttribute("aria-invalid", errors[field] ? "true" : "false");
        });

        return { shipping, valid: Object.keys(errors).length === 0 };
    }

    async function readPaymentResponse(response) {
        const responseText = await response.text();
        try {
            return JSON.parse(responseText);
        } catch (error) {
            throw new Error(responseText.trim().startsWith("<")
                ? "Payment API returned HTML instead of JSON. Confirm the site is deployed through Vercel with the /api functions enabled."
                : "Payment API returned an invalid response.");
        }
    }

    function resetPaymentButton() {
        paymentInProgress = false;
        payButton.disabled = false;
        payButton.textContent = "Pay with Razorpay";
    }

    async function startPayment() {
        if (paymentInProgress) return;

        const { shipping, valid } = validateShipping();
        if (!valid) {
            setMessage("Please correct the highlighted fields before payment.", true);
            form.querySelector('[aria-invalid="true"]')?.focus();
            return;
        }
        if (typeof window.Razorpay !== "function") {
            setMessage("Payment checkout is unavailable right now.", true);
            return;
        }

        localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
        const totals = getOrderTotals();
        if (!Number.isFinite(totals.total) || totals.total <= 0) {
            setMessage("The cart total is too low to process.", true);
            return;
        }

        paymentInProgress = true;
        payButton.disabled = true;
        payButton.textContent = "Preparing payment...";
        setMessage("Preparing secure payment...");

        try {
            const orderResponse = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart: getCheckoutCart() })
            });
            const orderData = await readPaymentResponse(orderResponse);
            if (!orderResponse.ok || !orderData.order_id) {
                throw new Error(orderData.error || "Unable to prepare payment");
            }

            const razorpay = new window.Razorpay({
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Terra Haven",
                description: "Terra Haven order",
                order_id: orderData.order_id,
                modal: {
                    ondismiss: () => {
                        if (paymentInProgress) {
                            setMessage("Payment cancelled.", true);
                            resetPaymentButton();
                        }
                    }
                },
                handler: async paymentResponse => {
                    setMessage("Verifying payment...");
                    try {
                        const verificationResponse = await fetch("/api/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...paymentResponse, shipping, cart: getCheckoutCart() })
                        });
                        const verificationData = await readPaymentResponse(verificationResponse);
                        if (!verificationResponse.ok || !verificationData.success) {
                            throw new Error(verificationData.error || "Payment verification failed");
                        }

                        localStorage.removeItem(CART_STORAGE_KEY);
                        localStorage.removeItem(SHIPPING_STORAGE_KEY);
                        setMessage(verificationData.notification?.status === "sent"
                            ? "Payment successful. Order details emailed."
                            : "Payment successful. Order notification is pending.");
                        payButton.textContent = "Order confirmed";
                    } catch (error) {
                        setMessage(error.message || "Payment verification failed.", true);
                        resetPaymentButton();
                    }
                }
            });

            razorpay.on("payment.failed", response => {
                setMessage(response.error?.description || "Payment failed. Please try again.", true);
                resetPaymentButton();
            });
            razorpay.open();
        } catch (error) {
            setMessage(error.message || "Unable to start payment. Please try again.", true);
            resetPaymentButton();
        }
    }

    form.addEventListener("input", () => {
        const shipping = Object.fromEntries(new FormData(form).entries());
        localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
    });
    payButton.addEventListener("click", startPayment);
    renderSummary();
});
