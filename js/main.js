/* =========================================================
   TERRA HAVEN
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   1. LOADER
   ========================================================= */

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {
        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.visibility = "hidden";
        }, 1000);
    }

});


/* =========================================================
   2. GSAP + LENIS
   ========================================================= */

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


/* =========================================================
   3. HERO PARALLAX
   ========================================================= */

if (document.querySelector("#hero-bg")) {

    gsap.to("#hero-bg", {

        yPercent: 30,

        ease: "none",

        scrollTrigger: {
            trigger: "#hero-bg",
            start: "top top",
            end: "bottom top",
            scrub: true
        }

    });

}


/* =========================================================
   4. TEXT REVEALS
   ========================================================= */

if (document.querySelector(".reveal-text-container")) {

    gsap.from(".reveal-image", {

        scrollTrigger: {
            trigger: ".reveal-text-container",
            start: "top 80%"
        },

        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"

    });


    gsap.from(".reveal-text", {

        scrollTrigger: {
            trigger: ".reveal-text-container",
            start: "top 80%"
        },

        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out"

    });

}


/* =========================================================
   5. HORIZONTAL CATEGORY SCROLL
   ========================================================= */

const horizontalSection =
    document.querySelector("#horizontal-scroll");

const horizontalTrack =
    document.querySelector("#horizontal-track");

if (horizontalSection && horizontalTrack) {

    const getScrollAmount = () =>
        -(horizontalTrack.scrollWidth - window.innerWidth + 100);

    const tween = gsap.to(horizontalTrack, {

        x: getScrollAmount,

        ease: "none"

    });

    ScrollTrigger.create({

        trigger: horizontalSection,

        start: "top top",

        end: () =>
            `+=${horizontalTrack.scrollWidth - window.innerWidth + 100}`,

        pin: true,

        animation: tween,

        scrub: 1,

        invalidateOnRefresh: true

    });

}


/* =========================================================
   6. PARALLAX BANNER
   ========================================================= */

if (document.querySelector("#parallax-banner")) {

    gsap.to("#parallax-banner", {

        yPercent: 20,

        ease: "none",

        scrollTrigger: {

            trigger: "#parallax-banner",

            start: "top bottom",

            end: "bottom top",

            scrub: true

        }

    });

}


/* =========================================================
   7. PRODUCT DATA
   =========================================================

   IMPORTANT:

   All product images below come from:

   assets/images/

   File names are case-sensitive.
*/


const products = [

    /* =====================================================
       BEDSPREADS
       ===================================================== */

    {
        id: "bedspread-1",
        category: "Bedspreads",
        name: "Earth-Toned Bedspread",
        description:
            "A timeless bedspread designed to bring warmth and texture into everyday spaces.",

        images: [
            "assets/images/bedspread-1.png"
        ],

        price: 2499,
        badge: "Best Seller",

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-2",
        category: "Bedspreads",
        name: "Natural Weave Bedspread",
        description:
            "A soft, earthy layer crafted for relaxed and elegant interiors.",

        images: [
            "assets/images/bedspread-2.png"
        ],

        price: 2699,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-3",
        category: "Bedspreads",
        name: "Clay Dune Bedspread",

        images: [
            "assets/images/bedspread-3.png"
        ],

        price: 2899,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-4",
        category: "Bedspreads",
        name: "Terra Textured Bedspread",

        images: [
            "assets/images/bedspread-4.png"
        ],

        price: 2999,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-5",
        category: "Bedspreads",
        name: "Haven Everyday Bedspread",

        images: [
            "assets/images/bedspread-5.png"
        ],

        price: 2799,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-6",
        category: "Bedspreads",
        name: "Sage Earth Bedspread",

        images: [
            "assets/images/bedspread-6.png"
        ],

        price: 2899,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-7",
        category: "Bedspreads",
        name: "Quiet Earth Bedspread",

        images: [
            "assets/images/bedspread-7.png"
        ],

        price: 3099,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-8",
        category: "Bedspreads",
        name: "Warm Sand Bedspread",

        images: [
            "assets/images/bedspread-8.png"
        ],

        price: 3199,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-9",
        category: "Bedspreads",
        name: "Organic Lines Bedspread",

        images: [
            "assets/images/bedspread-9.png"
        ],

        price: 3299,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    {
        id: "bedspread-10",
        category: "Bedspreads",
        name: "Heritage Bedspread",

        images: [
            "assets/images/bedspread-10.png"
        ],

        price: 3399,

        options: [
            {
                label: "Size",
                values: [
                    "Single",
                    "Double",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    /* =====================================================
       DOUBLE BED
       ===================================================== */

    {
        id: "double-bed-1",
        category: "Bedspreads",
        name: "Double Bed Collection",

        images: [
            "assets/images/Bed Double 1A.png",
            "assets/images/Bed Double 1B.png",
            "assets/images/Bed Double 1C.png"
        ],

        price: 3499,

        badge: "New",

        options: [
            {
                label: "Size",
                values: [
                    "Double Cot",
                    "Queen",
                    "King"
                ]
            }
        ]
    },


    /* =====================================================
       SINGLE BED
       ===================================================== */

    {
        id: "single-bs-1",
        category: "Bedspreads",
        name: "Single Bed Collection",

        images: [
            "assets/images/Single BS1.png",
            "assets/images/Single BS2.png"
        ],

        price: 2299,

        options: [
            {
                label: "Size",
                values: [
                    "Single"
                ]
            }
        ]
    },


    /* =====================================================
       CUSHIONS
       ===================================================== */

    {
        id: "cushion-1",
        category: "Cushions",
        name: "Terra Cushion 01",

        images: [
            "assets/images/Cushion 1A.jpeg",
            "assets/images/cushion 1B.jpeg"
        ],

        price: 799
    },


    {
        id: "cushion-2",
        category: "Cushions",
        name: "Terra Cushion 02",

        images: [
            "assets/images/cushion 2.jpeg",
            "assets/images/cushion 2B.jpeg"
        ],

        price: 849
    },


    {
        id: "cushion-3",
        category: "Cushions",
        name: "Terra Cushion 03",

        images: [
            "assets/images/cushion 3.jpeg"
        ],

        price: 899
    },


    {
        id: "cushion-4",
        category: "Cushions",
        name: "Terra Cushion 04",

        images: [
            "assets/images/cushion 4.jpeg"
        ],

        price: 899
    },


    {
        id: "cushion-5",
        category: "Cushions",
        name: "Terra Cushion 05",

        images: [
            "assets/images/cushion 5.jpeg",
            "assets/images/cushion 5A.jpeg"
        ],

        price: 949
    },


    /* =====================================================
       BAGS
       ===================================================== */

    {
        id: "bag-3",
        category: "Lifestyle Bags",
        name: "Terra Everyday Bag",

        images: [
            "assets/images/Bag 3A.png",
            "assets/images/Bag 3B.png"
        ],

        price: 1499
    },


    {
        id: "tote-1",
        category: "Lifestyle Bags",
        name: "The Haven Linen Tote",

        images: [
            "assets/images/Tote 1B.jpeg",
            "assets/images/Tote 1S.jpeg"
        ],

        price: 1399,

        badge: "Featured",

        options: [
            {
                label: "Size",
                values: [
                    "Small",
                    "Medium",
                    "Large"
                ]
            }
        ]
    },


    /* =====================================================
       OILS
       ===================================================== */

    {
        id: "oil-sesame",
        category: "Edible Cold-Pressed Oils",
        name: "Cold-Pressed Sesame Oil",

        images: [
            "assets/images/oil-sesame.png"
        ],

        price: 449,

        options: [
            {
                label: "Quantity",
                values: [
                    "500 ml",
                    "1 Litre"
                ]
            }
        ]
    },


    {
        id: "oil-groundnut",
        category: "Edible Cold-Pressed Oils",
        name: "Cold-Pressed Groundnut Oil",

        images: [
            "assets/images/oil-groundnut.png"
        ],

        price: 429,

        options: [
            {
                label: "Quantity",
                values: [
                    "500 ml",
                    "1 Litre"
                ]
            }
        ]
    },


    {
        id: "oil-coconut",
        category: "Edible Cold-Pressed Oils",
        name: "Cold-Pressed Coconut Oil",

        images: [
            "assets/images/oil-coconut.png"
        ],

        price: 479,

        options: [
            {
                label: "Quantity",
                values: [
                    "500 ml",
                    "1 Litre"
                ]
            }
        ]
    },


    /* =====================================================
       QUILTS
       ===================================================== */

    {
        id: "quilt-1",
        category: "Quilts",
        name: "Terra Quilt 01",

        images: [
            "assets/images/quilt-1.png"
        ],

        price: 3299
    },


    {
        id: "quilt-2",
        category: "Quilts",
        name: "Terra Quilt 02",

        images: [
            "assets/images/quilt-2.png",
            "assets/images/quilt-2b.png"
        ],

        price: 3499
    },


    {
        id: "quilt-3",
        category: "Quilts",
        name: "Terra Quilt 03",

        images: [
            "assets/images/quilt-3.png",
            "assets/images/quilt-3b.png"
        ],

        price: 3699
    },


    {
        id: "quilt-4",
        category: "Quilts",
        name: "Terra Quilt 04",

        images: [
            "assets/images/quilt-4.png",
            "assets/images/quilt-4b.png"
        ],

        price: 3899
    }

];


/* =========================================================
   8. CART
   ========================================================= */

let cart = [];


/* =========================================================
   9. FORMAT PRICE
   ========================================================= */

function formatPrice(price) {

    return "₹" + Number(price).toLocaleString("en-IN");

}


/* =========================================================
   10. PRODUCT GRID
   ========================================================= */

const productGrid =
    document.getElementById("product-grid");


function createProductCard(product) {

    const card = document.createElement("article");

    card.className =
        "product-card cursor-pointer group fade-up bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-500";


    card.innerHTML = `

        <div class="product-image-box relative">

            <img
                src="${product.images[0]}"
                alt="${product.name}"
                class="product-main-image w-full h-full object-cover"
            >

            ${
                product.badge
                ?
                `<div class="absolute top-3 left-3 bg-white px-2 py-1 text-[10px] uppercase tracking-widest text-charcoal">
                    ${product.badge}
                </div>`
                :
                ""
            }

            ${
                product.images.length > 1
                ?
                `<div class="image-count-badge">
                    ${product.images.length} Photos
                </div>`
                :
                ""
            }

            <div class="product-hover-button">

                <button
                    class="w-full bg-charcoal text-white py-3 text-xs tracking-widest uppercase hover:bg-clay transition-colors">
                    View Product
                </button>

            </div>

        </div>


        <div class="mt-4 flex flex-col text-center">

            <span class="text-[10px] uppercase tracking-[0.25em] text-clay mb-2">
                ${product.category}
            </span>

            <h3 class="font-serif text-lg text-charcoal group-hover:text-clay transition-colors">
                ${product.name}
            </h3>

            ${
                product.options
                ?
                `<p class="text-xs text-charcoal/50 mt-1">
                    ${product.options[0].values.join(" / ")}
                </p>`
                :
                ""
            }

            <span class="text-sm mt-3 font-medium text-charcoal">
                ${formatPrice(product.price)}
            </span>

        </div>

    `;


    card.addEventListener("click", () => {

        openProductModal(product);

    });


    return card;

}


function renderFeaturedProducts() {

    if (!productGrid) return;


    const featured = products.slice(0, 6);


    productGrid.innerHTML = "";


    featured.forEach(product => {

        productGrid.appendChild(
            createProductCard(product)
        );

    });

}


renderFeaturedProducts();


/* =========================================================
   11. PRODUCT MODAL
   ========================================================= */

const productModal =
    document.getElementById("product-modal");

const productModalContent =
    document.getElementById("product-modal-content");


let currentProduct = null;

let currentImageIndex = 0;

let currentSelections = {};


function openProductModal(product) {

    currentProduct = product;

    currentImageIndex = 0;

    currentSelections = {};


    if (!productModal || !productModalContent) return;


    productModal.classList.remove("hidden");


    document.body.classList.add("modal-open");


    renderProductModal();

}


function closeProductModal() {

    productModal.classList.add("hidden");

    document.body.classList.remove("modal-open");

}


function renderProductModal() {

    const product = currentProduct;


    const selectedImage =
        product.images[currentImageIndex];


    productModalContent.innerHTML = `

        <!-- IMAGE SIDE -->

        <div class="product-detail-gallery">

            <div class="product-large-image">

                <img
                    src="${selectedImage}"
                    alt="${product.name}"
                    id="modal-main-image"
                >

                ${
                    product.images.length > 1
                    ?
                    `

                    <button
                        id="product-prev"
                        class="gallery-arrow gallery-arrow-left">
                        ←
                    </button>

                    <button
                        id="product-next"
                        class="gallery-arrow gallery-arrow-right">
                        →
                    </button>

                    `
                    :
                    ""
                }

            </div>


            ${
                product.images.length > 1
                ?
                `
                <div class="product-thumbnails">

                    ${product.images.map((img, index) => `

                        <button
                            class="product-thumbnail ${
                                index === currentImageIndex
                                ? "active"
                                : ""
                            }"
                            data-index="${index}">

                            <img
                                src="${img}"
                                alt="${product.name} ${index + 1}"
                            >

                        </button>

                    `).join("")}

                </div>
                `
                :
                ""
            }

        </div>


        <!-- DETAILS SIDE -->

        <div class="product-detail-info">

            <span class="text-xs uppercase tracking-[0.3em] text-clay">
                ${product.category}
            </span>


            <h2 class="font-serif text-4xl md:text-5xl text-charcoal mt-3">
                ${product.name}
            </h2>


            <div class="mt-5 text-2xl font-medium text-charcoal">
                ${formatPrice(product.price)}
            </div>


            <p class="text-sm text-charcoal/60 leading-relaxed mt-6">
                ${
                    product.description ||
                    "Thoughtfully selected for the Terra Haven collection."
                }
            </p>


            ${
                product.options
                ?
                product.options.map((option, optionIndex) => `

                    <div class="mt-8">

                        <label class="text-xs uppercase tracking-widest text-charcoal font-medium block mb-3">
                            ${option.label}
                        </label>

                        <div class="flex flex-wrap gap-2">

                            ${option.values.map((value, valueIndex) => `

                                <button
                                    class="option-button ${
                                        valueIndex === 0
                                        ? "selected"
                                        : ""
                                    }"
                                    data-option="${optionIndex}"
                                    data-value="${value}">

                                    ${value}

                                </button>

                            `).join("")}

                        </div>

                    </div>

                `).join("")
                :
                ""
            }


            <div class="mt-8">

                <label class="text-xs uppercase tracking-widest text-charcoal font-medium block mb-3">
                    Quantity
                </label>

                <div class="quantity-control">

                    <button
                        id="quantity-minus">
                        −
                    </button>

                    <span id="product-quantity">
                        1
                    </span>

                    <button
                        id="quantity-plus">
                        +
                    </button>

                </div>

            </div>


            <button
                id="modal-add-to-cart"
                class="w-full mt-8 bg-charcoal text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-clay transition-colors">

                Add to Cart — ${formatPrice(product.price)}

            </button>


            <div class="mt-5 text-xs text-charcoal/50 leading-relaxed">

                ✓ Carefully selected for Terra Haven<br>

                ✓ Multiple product variants available<br>

                ✓ Secure checkout coming next

            </div>


        </div>

    `;


    setupProductModalEvents();

}


/* =========================================================
   12. PRODUCT MODAL EVENTS
   ========================================================= */

function setupProductModalEvents() {

    const product = currentProduct;


    /* Image thumbnails */

    document.querySelectorAll(".product-thumbnail")
        .forEach(button => {

            button.addEventListener("click", () => {

                currentImageIndex =
                    Number(button.dataset.index);

                renderProductModal();

            });

        });


    /* Previous */

    const prev =
        document.getElementById("product-prev");

    if (prev) {

        prev.addEventListener("click", (event) => {

            event.stopPropagation();

            currentImageIndex--;

            if (currentImageIndex < 0) {

                currentImageIndex =
                    product.images.length - 1;

            }

            renderProductModal();

        });

    }


    /* Next */

    const next =
        document.getElementById("product-next");

    if (next) {

        next.addEventListener("click", (event) => {

            event.stopPropagation();

            currentImageIndex++;

            if (
                currentImageIndex >= product.images.length
            ) {

                currentImageIndex = 0;

            }

            renderProductModal();

        });

    }


    /* Option buttons */

    document.querySelectorAll(".option-button")
        .forEach(button => {

            button.addEventListener("click", () => {

                const optionIndex =
                    button.dataset.option;

                document
                    .querySelectorAll(
                        `.option-button[data-option="${optionIndex}"]`
                    )
                    .forEach(btn =>
                        btn.classList.remove("selected")
                    );


                button.classList.add("selected");


                currentSelections[optionIndex] =
                    button.dataset.value;

            });

        });


    /* Quantity */

    let quantity = 1;


    const quantityText =
        document.getElementById("product-quantity");


    const minus =
        document.getElementById("quantity-minus");


    const plus =
        document.getElementById("quantity-plus");


    minus?.addEventListener("click", () => {

        if (quantity > 1) {

            quantity--;

            quantityText.textContent =
                quantity;

        }

    });


    plus?.addEventListener("click", () => {

        quantity++;

        quantityText.textContent =
            quantity;

    });


    /* Add to cart */

    document
        .getElementById("modal-add-to-cart")
        ?.addEventListener("click", () => {

            addToCart(
                product,
                quantity,
                currentSelections
            );

            closeProductModal();

            openCart();

        });

}


/* =========================================================
   13. CATEGORY MODAL
   ========================================================= */

const categoryModal =
    document.getElementById("category-modal");

const categoryProductGrid =
    document.getElementById("category-product-grid");


function openCategoryModal(category) {

    if (!categoryModal) return;


    const categoryProducts =
        products.filter(
            product =>
                product.category === category
        );


    document
        .getElementById("category-modal-label")
        .textContent =
        "Terra Haven Collection";


    document
        .getElementById("category-modal-title")
        .textContent =
        category;


    document
        .getElementById("category-modal-description")
        .textContent =
        `Explore our ${category.toLowerCase()} collection.`;


    categoryProductGrid.innerHTML = "";


    categoryProducts.forEach(product => {

        categoryProductGrid.appendChild(
            createProductCard(product)
        );

    });


    categoryModal.classList.remove("hidden");

    document.body.classList.add("modal-open");

}


/* =========================================================
   14. SHOP ALL
   ========================================================= */

document
    .getElementById("shop-all-btn")
    ?.addEventListener("click", () => {

        if (!categoryModal) return;


        document
            .getElementById("category-modal-label")
            .textContent =
            "Complete Collection";


        document
            .getElementById("category-modal-title")
            .textContent =
            "Shop All Products";


        document
            .getElementById("category-modal-description")
            .textContent =
            "Explore the complete Terra Haven collection.";


        categoryProductGrid.innerHTML = "";


        products.forEach(product => {

            categoryProductGrid.appendChild(
                createProductCard(product)
            );

        });


        categoryModal.classList.remove("hidden");

        document.body.classList.add("modal-open");

    });


/* =========================================================
   15. CATEGORY CARDS
   =========================================================

   Existing category cards are made clickable here.

*/


const categoryCards =
    document.querySelectorAll(
        "#horizontal-track > div"
    );


categoryCards.forEach(card => {

    const title =
        card.querySelector("h4");


    if (!title) return;


    const categoryName =
        title.textContent.trim();


    if (
        categoryName === "Make It Yours"
    ) {

        return;

    }


    let mappedCategory =
        categoryName;


    if (
        categoryName === "Lifestyle Bags"
    ) {

        mappedCategory =
            "Lifestyle Bags";

    }


    if (
        categoryName === "Edible Cold-pressed Oils"
    ) {

        mappedCategory =
            "Edible Cold-Pressed Oils";

    }


    card.addEventListener("click", () => {

        openCategoryModal(mappedCategory);

    });

});


/* =========================================================
   16. ADD TO CART
   ========================================================= */

function addToCart(
    product,
    quantity = 1,
    selections = {}
) {

    const existing =
        cart.find(item => {

            return (
                item.product.id === product.id &&
                JSON.stringify(item.selections) ===
                JSON.stringify(selections)
            );

        });


    if (existing) {

        existing.quantity += quantity;

    } else {

        cart.push({

            product,
            quantity,
            selections

        });

    }


    renderCart();

    updateCartCount();

}


/* =========================================================
   17. CART COUNT
   ========================================================= */

function updateCartCount() {

    const totalItems =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const cartLinks =
        document.querySelectorAll(
            "nav a"
        );


    cartLinks.forEach(link => {

        if (
            link.textContent
                .trim()
                .toLowerCase()
                .startsWith("cart")
        ) {

            link.textContent =
                `Cart (${totalItems})`;

        }

    });

}


/* =========================================================
   18. CART RENDER
   ========================================================= */

function renderCart() {

    const cartItems =
        document.getElementById("cart-items");


    const cartTotal =
        document.getElementById("cart-total");


    if (!cartItems || !cartTotal) return;


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="text-center py-16">

                <div class="font-serif text-3xl text-charcoal/30">
                    Your cart is empty
                </div>

                <p class="text-sm text-charcoal/50 mt-3">
                    Add something beautiful to your collection.
                </p>

            </div>

        `;


        cartTotal.textContent =
            "₹0";

        return;

    }


    let total = 0;


    cartItems.innerHTML =
        cart.map((item, index) => {

            const itemTotal =
                item.product.price *
                item.quantity;


            total += itemTotal;


            const optionsText =
                Object.values(item.selections)
                    .join(" • ");


            return `

                <div class="cart-item">

                    <img
                        src="${item.product.images[0]}"
                        alt="${item.product.name}"
                    >

                    <div class="flex-1 min-w-0">

                        <h3 class="font-serif text-lg">
                            ${item.product.name}
                        </h3>

                        ${
                            optionsText
                            ?
                            `<p class="text-xs text-charcoal/50 mt-1">
                                ${optionsText}
                            </p>`
                            :
                            ""
                        }

                        <p class="text-xs mt-2">
                            ${item.quantity} ×
                            ${formatPrice(item.product.price)}
                        </p>

                        <p class="font-medium text-sm mt-1">
                            ${formatPrice(itemTotal)}
                        </p>

                    </div>

                    <button
                        class="remove-cart-item"
                        data-index="${index}">
                        ✕
                    </button>

                </div>

            `;

        }).join("");


    cartTotal.textContent =
        formatPrice(total);


    document
        .querySelectorAll(".remove-cart-item")
        .forEach(button => {

            button.addEventListener("click", () => {

                cart.splice(
                    Number(button.dataset.index),
                    1
                );

                renderCart();

                updateCartCount();

            });

        });

}


/* =========================================================
   19. OPEN CART
   ========================================================= */

const cartDrawer =
    document.getElementById("cart-drawer");


function openCart() {

    if (!cartDrawer) return;

    cartDrawer.classList.remove("hidden");

    document.body.classList.add("modal-open");

    renderCart();

}


function closeCart() {

    if (!cartDrawer) return;

    cartDrawer.classList.add("hidden");

    document.body.classList.remove("modal-open");

}


/* =========================================================
   20. CART NAVIGATION
   ========================================================= */

document
    .querySelectorAll("nav a")
    .forEach(link => {

        if (
            link.textContent
                .trim()
                .toLowerCase()
                .startsWith("cart")
        ) {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openCart();

                }
            );

        }

    });


/* =========================================================
   21. CLOSE BUTTONS
   ========================================================= */

document
    .getElementById("product-modal-close")
    ?.addEventListener(
        "click",
        closeProductModal
    );


document
    .getElementById("product-modal-overlay")
    ?.addEventListener(
        "click",
        closeProductModal
    );


document
    .getElementById("category-modal-close")
    ?.addEventListener(
        "click",
        () => {

            categoryModal.classList.add("hidden");

            document.body.classList.remove("modal-open");

        }
    );


document
    .getElementById("category-modal-overlay")
    ?.addEventListener(
        "click",
        () => {

            categoryModal.classList.add("hidden");

            document.body.classList.remove("modal-open");

        }
    );


document
    .getElementById("cart-close")
    ?.addEventListener(
        "click",
        closeCart
    );


document
    .getElementById("cart-overlay")
    ?.addEventListener(
        "click",
        closeCart
    );


/* =========================================================
   22. ESC KEY
   ========================================================= */

document.addEventListener("keydown", event => {

    if (event.key !== "Escape") return;


    closeProductModal();

    categoryModal?.classList.add("hidden");

    closeCart();

});


/* =========================================================
   23. NAVBAR
   ========================================================= */

const navbar =
    document.getElementById("navbar");


window.addEventListener("scroll", () => {

    if (!navbar) return;


    if (
        window.scrollY >
        window.innerHeight - 80
    ) {

        navbar.classList.add("nav-scrolled");

    } else {

        navbar.classList.remove("nav-scrolled");

    }

});


/* =========================================================
   24. PRODUCT ANIMATIONS
   ========================================================= */

gsap.from(".fade-up", {

    scrollTrigger: {

        trigger: "#categories",

        start: "top 80%"

    },

    y: 50,

    opacity: 0,

    duration: 1,

    stagger: 0.15,

    ease: "power3.out"

});
