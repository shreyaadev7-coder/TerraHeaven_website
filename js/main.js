/* =========================================================
   TERRA HAVEN
   MAIN JAVASCRIPT
   =========================================================
   - Normal vertical page scrolling
   - Working horizontal category scroller
   - Touchpad / mouse wheel support
   - Product galleries
   - Product variants
   - Add to cart
   - Cart drawer
   - Popup internal scrolling
   - GSAP visual animations
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. LOADER
       ===================================================== */

    const loader = document.getElementById("loader");

    window.addEventListener("load", () => {

        if (!loader) return;

        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.visibility = "hidden";
            loader.style.pointerEvents = "none";
        }, 1000);
    });


    /* =====================================================
       2. GSAP SETUP
       ===================================================== */

    if (
        typeof gsap !== "undefined" &&
        typeof ScrollTrigger !== "undefined"
    ) {

        gsap.registerPlugin(ScrollTrigger);


        /* HERO */

        const heroBg =
            document.getElementById("hero-bg");

        if (heroBg) {

            gsap.to(heroBg, {
                yPercent: 30,
                ease: "none",

                scrollTrigger: {
                    trigger: heroBg,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }


        /* PHILOSOPHY IMAGE */

        const revealImage =
            document.querySelector(".reveal-image");

        if (revealImage) {

            gsap.from(revealImage, {

                scrollTrigger: {
                    trigger: ".reveal-text-container",
                    start: "top 80%"
                },

                y: 50,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out"
            });
        }


        /* PHILOSOPHY TEXT */

        const revealText =
            document.querySelector(".reveal-text");

        if (revealText) {

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


        /* PARALLAX BANNER */

        const parallaxBanner =
            document.getElementById(
                "parallax-banner"
            );

        if (parallaxBanner) {

            gsap.to(parallaxBanner, {

                yPercent: 20,
                ease: "none",

                scrollTrigger: {
                    trigger: parallaxBanner,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    }


    /* =====================================================
       3. HORIZONTAL CATEGORY SCROLLER
       =====================================================

       IMPORTANT:

       We are NOT using Lenis here.

       The browser keeps normal vertical scrolling.

       When the pointer is over the category section,
       wheel / touchpad movement becomes horizontal.

       At the beginning/end, normal page scrolling resumes.
    */

    const horizontalSection =
        document.getElementById(
            "horizontal-scroll"
        );

    const horizontalTrack =
        document.getElementById(
            "horizontal-track"
        );


    if (
        horizontalSection &&
        horizontalTrack
    ) {

        let currentX = 0;

        let targetX = 0;

        let maxX = 0;

        let pointerInside = false;


        /* -------------------------------------------------
           Calculate width
           ------------------------------------------------- */

        function calculateHorizontalWidth() {

            maxX =
                Math.max(
                    0,
                    horizontalTrack.scrollWidth -
                    horizontalSection.clientWidth
                );


            targetX =
                Math.max(
                    0,
                    Math.min(
                        targetX,
                        maxX
                    )
                );


            currentX =
                Math.max(
                    0,
                    Math.min(
                        currentX,
                        maxX
                    )
                );


            horizontalTrack.style.transform =
                `translate3d(${-currentX}px, 0, 0)`;
        }


        /* -------------------------------------------------
           Smooth movement
           ------------------------------------------------- */

        function animateHorizontal() {

            const difference =
                targetX -
                currentX;


            if (
                Math.abs(difference) <
                0.5
            ) {

                currentX = targetX;

            } else {

                currentX +=
                    difference * 0.14;
            }


            horizontalTrack.style.transform =
                `translate3d(${-currentX}px, 0, 0)`;


            requestAnimationFrame(
                animateHorizontal
            );
        }


        /* -------------------------------------------------
           Mouse enters section
           ------------------------------------------------- */

        horizontalSection.addEventListener(
            "mouseenter",
            () => {

                pointerInside = true;
            }
        );


        /* -------------------------------------------------
           Mouse leaves section
           ------------------------------------------------- */

        horizontalSection.addEventListener(
            "mouseleave",
            () => {

                pointerInside = false;
            }
        );


        /* -------------------------------------------------
           Mouse wheel / touchpad
           ------------------------------------------------- */

        horizontalSection.addEventListener(
            "wheel",
            (event) => {

                if (!pointerInside) {
                    return;
                }


                /*
                 * Trackpads may send:
                 *
                 * deltaY = vertical swipe
                 * deltaX = horizontal swipe
                 *
                 * Both are converted into horizontal
                 * category movement.
                 */

                let movement =
                    event.deltaY +
                    event.deltaX;


                /*
                 * Avoid extreme jumps.
                 */

                movement =
                    Math.max(
                        -100,
                        Math.min(
                            movement,
                            100
                        )
                    );


                const atStart =
                    targetX <= 0;


                const atEnd =
                    targetX >=
                    maxX;


                const movingForward =
                    movement > 0;


                const movingBackward =
                    movement < 0;


                /*
                 * Consume the touchpad gesture only
                 * while horizontal content remains.
                 */

                if (
                    (movingForward && !atEnd) ||
                    (movingBackward && !atStart)
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    targetX =
                        Math.max(
                            0,
                            Math.min(
                                targetX +
                                movement,
                                maxX
                            )
                        );
                }

            },
            {
                passive: false
            }
        );


        /* -------------------------------------------------
           Mouse drag
           ------------------------------------------------- */

        let dragging = false;

        let dragStartX = 0;

        let dragStartPosition = 0;


        horizontalTrack.addEventListener(
            "mousedown",
            (event) => {

                /*
                 * Don't start dragging if user clicked
                 * a button or another interactive item.
                 */

                if (
                    event.target.closest(
                        "button, a"
                    )
                ) {
                    return;
                }


                dragging = true;

                dragStartX =
                    event.clientX;

                dragStartPosition =
                    targetX;


                horizontalTrack.style.cursor =
                    "grabbing";


                event.preventDefault();
            }
        );


        window.addEventListener(
            "mousemove",
            (event) => {

                if (!dragging) return;


                const distance =
                    dragStartX -
                    event.clientX;


                targetX =
                    Math.max(
                        0,
                        Math.min(
                            dragStartPosition +
                            distance,
                            maxX
                        )
                    );
            }
        );


        window.addEventListener(
            "mouseup",
            () => {

                if (!dragging) return;


                dragging = false;


                horizontalTrack.style.cursor =
                    "grab";
            }
        );


        /* -------------------------------------------------
           Touch screen support
           ------------------------------------------------- */

        let lastTouchX = 0;

        let lastTouchY = 0;


        horizontalSection.addEventListener(
            "touchstart",
            (event) => {

                const touch =
                    event.touches[0];


                lastTouchX =
                    touch.clientX;

                lastTouchY =
                    touch.clientY;
            },
            {
                passive: true
            }
        );


        horizontalSection.addEventListener(
            "touchmove",
            (event) => {

                const touch =
                    event.touches[0];


                const deltaX =
                    lastTouchX -
                    touch.clientX;


                const deltaY =
                    lastTouchY -
                    touch.clientY;


                /*
                 * Use whichever direction has the
                 * stronger movement.
                 */

                const movement =
                    Math.abs(deltaX) >
                    Math.abs(deltaY)
                        ? deltaX
                        : deltaY;


                const atStart =
                    targetX <= 0;


                const atEnd =
                    targetX >= maxX;


                if (
                    (movement > 0 && !atEnd) ||
                    (movement < 0 && !atStart)
                ) {

                    event.preventDefault();


                    targetX =
                        Math.max(
                            0,
                            Math.min(
                                targetX +
                                movement,
                                maxX
                            )
                        );
                }


                lastTouchX =
                    touch.clientX;

                lastTouchY =
                    touch.clientY;
            },
            {
                passive: false
            }
        );


        /* -------------------------------------------------
           Resize
           ------------------------------------------------- */

        window.addEventListener(
            "resize",
            calculateHorizontalWidth
        );


        /* -------------------------------------------------
           Start
           ------------------------------------------------- */

        setTimeout(
            calculateHorizontalWidth,
            100
        );


        window.addEventListener(
            "load",
            calculateHorizontalWidth
        );


        animateHorizontal();


        horizontalTrack.style.cursor =
            "grab";
    }


    /* =====================================================
       4. PRODUCT DATABASE
       ===================================================== */

    const products = [

        /* =================================================
           BEDSPREADS
           ================================================= */

        {
            id: "bedspread-1",
            category: "Bedspreads",
            name: "Terra Haven Bedspread 01",

            description:
                "A timeless bedspread designed to bring warmth and character into your bedroom.",

            images: [
                "assets/images/bedspread-1.png"
            ],

            price: 2499,

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
            name: "Terra Haven Bedspread 02",

            images: [
                "assets/images/bedspread-2.png"
            ],

            price: 2599,

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
            name: "Terra Haven Bedspread 03",

            images: [
                "assets/images/bedspread-3.png"
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
            id: "bedspread-4",
            category: "Bedspreads",
            name: "Terra Haven Bedspread 04",

            images: [
                "assets/images/bedspread-4.png"
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
            id: "bedspread-5",
            category: "Bedspreads",
            name: "Terra Haven Bedspread 05",

            images: [
                "assets/images/bedspread-5.png"
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
            id: "bedspread-6",
            category: "Bedspreads",
            name: "Terra Haven Bedspread 06",

            images: [
                "assets/images/bedspread-6.png"
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
            id: "bedspread-7",
            category: "Bedspreads",
            name: "Terra Haven Bedspread 07",

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
            name: "Terra Haven Bedspread 08",

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
            name: "Terra Haven Bedspread 09",

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
            name: "Terra Haven Bedspread 10",

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


        /* =================================================
           DOUBLE BED
           ================================================= */

        {
            id: "double-bed-1",
            category: "Bedspreads",
            name: "Double Bed Collection",

            description:
                "A complete double-bed collection with multiple views.",

            images: [
                "assets/images/Bed Double 1A.png",
                "assets/images/Bed Double 1B.png",
                "assets/images/Bed Double 1C.png"
            ],

            price: 3499,

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


        /* =================================================
           SINGLE BED
           ================================================= */

        {
            id: "single-bed-1",
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


        /* =================================================
           CUSHIONS
           ================================================= */

        {
            id: "cushion-1",
            category: "Cushions",
            name: "Terra Cushion 01",

            description:
                "A handcrafted accent cushion designed to add texture and warmth.",

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

            description:
                "An earthy statement cushion for relaxed interiors.",

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


        /* =================================================
           LIFESTYLE BAGS
           ================================================= */

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


        /* =================================================
           OILS
           ================================================= */

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


        /* =================================================
           QUILTS
           ================================================= */

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


    /* =====================================================
       5. CART STATE
       ===================================================== */

    let cart = [];

    let currentProduct = null;

    let currentImageIndex = 0;

    let currentQuantity = 1;

    let currentSelections = {};


    /* =====================================================
       6. HELPERS
       ===================================================== */

    function formatPrice(price) {

        return "₹" +
            Number(price).toLocaleString(
                "en-IN"
            );
    }


    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    /* =====================================================
       7. PRODUCT CARD
       ===================================================== */

    function createProductCard(product) {

        const card =
            document.createElement("article");


        card.className =
            "product-card cursor-pointer group bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-500";


        card.innerHTML = `

            <div class="product-image-box">

                <img
                    src="${product.images[0]}"
                    alt="${escapeHtml(product.name)}"
                    class="product-main-image"
                    loading="lazy"
                >

                ${
                    product.images.length > 1
                    ?
                    `
                    <div class="image-count-badge">
                        ${product.images.length} Photos
                    </div>
                    `
                    :
                    ""
                }

                <div class="product-hover-button">

                    <button
                        type="button"
                        class="w-full bg-charcoal text-white py-3 text-xs tracking-widest uppercase hover:bg-clay transition-colors">
                        View Product
                    </button>

                </div>

            </div>


            <div class="mt-4 text-center">

                <span class="text-[10px] uppercase tracking-[0.25em] text-clay block mb-2">
                    ${escapeHtml(product.category)}
                </span>

                <h3 class="font-serif text-lg text-charcoal group-hover:text-clay transition-colors">
                    ${escapeHtml(product.name)}
                </h3>

                ${
                    product.options
                    ?
                    `
                    <p class="text-xs text-charcoal/50 mt-1">
                        ${product.options[0].values.join(" / ")}
                    </p>
                    `
                    :
                    ""
                }

                <p class="text-sm mt-3 font-medium text-charcoal">
                    ${formatPrice(product.price)}
                </p>

            </div>
        `;


        card.addEventListener(
            "click",
            () => {
                openProductModal(product);
            }
        );


        return card;
    }


    /* =====================================================
       8. FEATURED PRODUCTS
       ===================================================== */

    const productGrid =
        document.getElementById(
            "product-grid"
        );


    function renderFeaturedProducts() {

        if (!productGrid) return;


        productGrid.innerHTML = "";


        /*
         * Show first 6 products on homepage.
         * "Shop All Products" shows everything.
         */

        products
            .slice(0, 6)
            .forEach(product => {

                productGrid.appendChild(
                    createProductCard(product)
                );

            });
    }


    renderFeaturedProducts();


    /* =====================================================
       9. PRODUCT MODAL
       ===================================================== */

    const productModal =
        document.getElementById(
            "product-modal"
        );


    const productModalContent =
        document.getElementById(
            "product-modal-content"
        );


    function lockBackground() {

        document.body.classList.add(
            "modal-open"
        );
    }


    function unlockBackground() {

        /*
         * Only unlock when no modal/drawer is open.
         */

        const categoryOpen =
            document
                .getElementById(
                    "category-modal"
                )
                ?.classList.contains(
                    "hidden"
                ) === false;


        const productOpen =
            document
                .getElementById(
                    "product-modal"
                )
                ?.classList.contains(
                    "hidden"
                ) === false;


        const cartOpen =
            document
                .getElementById(
                    "cart-drawer"
                )
                ?.classList.contains(
                    "hidden"
                ) === false;


        if (
            !categoryOpen &&
            !productOpen &&
            !cartOpen
        ) {

            document.body.classList.remove(
                "modal-open"
            );
        }
    }


    function openProductModal(product) {

        if (
            !productModal ||
            !productModalContent
        ) {

            return;
        }


        currentProduct =
            product;


        currentImageIndex = 0;

        currentQuantity = 1;

        currentSelections = {};


        /*
         * Automatically select first variant.
         */

        if (product.options) {

            product.options.forEach(
                (option, index) => {

                    if (
                        option.values &&
                        option.values.length
                    ) {

                        currentSelections[index] =
                            option.values[0];

                    }

                }
            );
        }


        productModal.classList.remove(
            "hidden"
        );


        lockBackground();


        renderProductModal();
    }


    function closeProductModal() {

        if (!productModal) return;


        productModal.classList.add(
            "hidden"
        );


        unlockBackground();
    }


    function renderProductModal() {

        if (
            !currentProduct ||
            !productModalContent
        ) {

            return;
        }


        const product =
            currentProduct;


        const selectedImage =
            product.images[
                currentImageIndex
            ];


        productModalContent.innerHTML = `

            <div class="product-detail-gallery">

                <div class="product-large-image">

                    <img
                        src="${selectedImage}"
                        alt="${escapeHtml(product.name)}"
                        id="modal-main-image"
                    >


                    ${
                        product.images.length > 1
                        ?
                        `
                        <button
                            type="button"
                            id="product-prev"
                            class="gallery-arrow gallery-arrow-left"
                            aria-label="Previous image">
                            ←
                        </button>

                        <button
                            type="button"
                            id="product-next"
                            class="gallery-arrow gallery-arrow-right"
                            aria-label="Next image">
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

                        ${
                            product.images
                                .map(
                                    (
                                        imageUrl,
                                        index
                                    ) => `

                                        <button
                                            type="button"
                                            class="product-thumbnail ${
                                                index === currentImageIndex
                                                    ? "active"
                                                    : ""
                                            }"
                                            data-index="${index}">

                                            <img
                                                src="${imageUrl}"
                                                alt="${escapeHtml(product.name)} ${index + 1}"
                                            >

                                        </button>
                                    `
                                )
                                .join("")
                        }

                    </div>
                    `
                    :
                    ""
                }

            </div>


            <div class="product-detail-info">

                <span
                    class="text-xs uppercase tracking-[0.3em] text-clay">

                    ${escapeHtml(
                        product.category
                    )}

                </span>


                <h2
                    class="font-serif text-4xl md:text-5xl text-charcoal mt-3">

                    ${escapeHtml(
                        product.name
                    )}

                </h2>


                <div
                    class="mt-5 text-2xl font-medium text-charcoal">

                    ${formatPrice(
                        product.price
                    )}

                </div>


                <p
                    class="text-sm text-charcoal/60 leading-relaxed mt-6">

                    ${escapeHtml(
                        product.description ||
                        "Thoughtfully selected for the Terra Haven collection."
                    )}

                </p>


                ${
                    product.options
                    ?
                    product.options
                        .map(
                            (
                                option,
                                optionIndex
                            ) => `

                                <div
                                    class="mt-8">

                                    <label
                                        class="text-xs uppercase tracking-widest text-charcoal font-medium block mb-3">

                                        ${escapeHtml(
                                            option.label
                                        )}

                                    </label>


                                    <div
                                        class="flex flex-wrap gap-2">

                                        ${
                                            option.values
                                                .map(
                                                    value => `

                                                        <button
                                                            type="button"
                                                            class="option-button ${
                                                                currentSelections[
                                                                    optionIndex
                                                                ] === value
                                                                    ? "selected"
                                                                    : ""
                                                            }"
                                                            data-option="${optionIndex}"
                                                            data-value="${escapeHtml(value)}">

                                                            ${escapeHtml(
                                                                value
                                                            )}

                                                        </button>
                                                    `
                                                )
                                                .join("")
                                        }

                                    </div>

                                </div>
                            `
                        )
                        .join("")
                    :
                    ""
                }


                <div class="mt-8">

                    <label
                        class="text-xs uppercase tracking-widest text-charcoal font-medium block mb-3">

                        Quantity

                    </label>


                    <div class="quantity-control">

                        <button
                            type="button"
                            id="quantity-minus">

                            −

                        </button>


                        <span
                            id="product-quantity">

                            ${currentQuantity}

                        </span>


                        <button
                            type="button"
                            id="quantity-plus">

                            +

                        </button>

                    </div>

                </div>


                <button
                    type="button"
                    id="modal-add-to-cart"
                    class="w-full mt-8 bg-charcoal text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-clay transition-colors">

                    Add to Cart —
                    ${formatPrice(product.price)}

                </button>


                <div
                    class="mt-5 text-xs text-charcoal/50 leading-relaxed">

                    ✓ Carefully selected for Terra Haven<br>
                    ✓ Multiple variants available<br>
                    ✓ Designed for everyday living

                </div>

            </div>
        `;


        attachProductEvents();
    }


    /* =====================================================
       10. PRODUCT EVENTS
       ===================================================== */

    function attachProductEvents() {

        if (!currentProduct) return;


        /*
         * Thumbnail buttons
         */

        document
            .querySelectorAll(
                ".product-thumbnail"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        currentImageIndex =
                            Number(
                                button.dataset.index
                            );

                        renderProductModal();
                    }
                );
            });


        /*
         * Previous
         */

        document
            .getElementById(
                "product-prev"
            )
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    currentImageIndex--;


                    if (
                        currentImageIndex <
                        0
                    ) {

                        currentImageIndex =
                            currentProduct
                                .images.length -
                            1;
                    }


                    renderProductModal();
                }
            );


        /*
         * Next
         */

        document
            .getElementById(
                "product-next"
            )
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    currentImageIndex++;


                    if (
                        currentImageIndex >=
                        currentProduct.images.length
                    ) {

                        currentImageIndex = 0;
                    }


                    renderProductModal();
                }
            );


        /*
         * Options
         */

        document
            .querySelectorAll(
                ".option-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const optionIndex =
                            Number(
                                button.dataset.option
                            );


                        currentSelections[
                            optionIndex
                        ] =
                            button.dataset.value;


                        document
                            .querySelectorAll(
                                `.option-button[data-option="${optionIndex}"]`
                            )
                            .forEach(
                                optionButton => {

                                    optionButton
                                        .classList
                                        .remove(
                                            "selected"
                                        );
                                }
                            );


                        button.classList.add(
                            "selected"
                        );
                    }
                );
            });


        /*
         * Quantity minus
         */

        document
            .getElementById(
                "quantity-minus"
            )
            ?.addEventListener(
                "click",
                () => {

                    if (
                        currentQuantity >
                        1
                    ) {

                        currentQuantity--;

                        updateQuantity();
                    }
                }
            );


        /*
         * Quantity plus
         */

        document
            .getElementById(
                "quantity-plus"
            )
            ?.addEventListener(
                "click",
                () => {

                    currentQuantity++;

                    updateQuantity();
                }
            );


        /*
         * Add to cart
         */

        document
            .getElementById(
                "modal-add-to-cart"
            )
            ?.addEventListener(
                "click",
                () => {

                    addToCart(
                        currentProduct,
                        currentQuantity,
                        {
                            ...currentSelections
                        }
                    );


                    closeProductModal();


                    openCart();
                }
            );
    }


    function updateQuantity() {

        const quantityElement =
            document.getElementById(
                "product-quantity"
            );


        if (quantityElement) {

            quantityElement.textContent =
                currentQuantity;
        }
    }


    /* =====================================================
       11. CATEGORY MODAL
       ===================================================== */

    const categoryModal =
        document.getElementById(
            "category-modal"
        );


    const categoryProductGrid =
        document.getElementById(
            "category-product-grid"
        );


    function openCategoryModal(
        category
    ) {

        if (
            !categoryModal ||
            !categoryProductGrid
        ) {

            return;
        }


        const categoryProducts =
            products.filter(
                product =>
                    product.category ===
                    category
            );


        const label =
            document.getElementById(
                "category-modal-label"
            );


        const title =
            document.getElementById(
                "category-modal-title"
            );


        const description =
            document.getElementById(
                "category-modal-description"
            );


        if (label) {

            label.textContent =
                "Terra Haven Collection";
        }


        if (title) {

            title.textContent =
                category;
        }


        if (description) {

            description.textContent =
                categoryProducts.length
                    ?
                    `Explore our ${category.toLowerCase()} collection.`
                    :
                    "More pieces from this collection are coming soon.";
        }


        categoryProductGrid.innerHTML =
            "";


        if (
            categoryProducts.length ===
            0
        ) {

            categoryProductGrid.innerHTML = `

                <div
                    class="col-span-full text-center py-20">

                    <p
                        class="font-serif text-3xl text-charcoal/40">

                        Coming Soon

                    </p>


                    <p
                        class="text-sm text-charcoal/50 mt-3">

                        More Terra Haven pieces are coming soon.

                    </p>

                </div>

            `;

        } else {

            categoryProducts.forEach(
                product => {

                    categoryProductGrid.appendChild(
                        createProductCard(
                            product
                        )
                    );
                }
            );
        }


        categoryModal.classList.remove(
            "hidden"
        );


        lockBackground();


        /*
         * Make sure the popup starts at the top.
         */

        const panel =
            categoryModal.querySelector(
                ".category-modal-panel"
            );


        if (panel) {

            panel.scrollTop = 0;

            panel.style.overscrollBehavior =
                "contain";
        }
    }


    function closeCategoryModal() {

        if (!categoryModal) return;


        categoryModal.classList.add(
            "hidden"
        );


        unlockBackground();
    }


    /* =====================================================
       12. CATEGORY CARDS
       ===================================================== */

    const categoryCards =
        document.querySelectorAll(
            "#horizontal-track > div"
        );


    categoryCards.forEach(
        card => {

            const heading =
                card.querySelector(
                    "h4"
                );


            if (!heading) return;


            const categoryName =
                heading.textContent.trim();


            /*
             * Leave Make It Yours for
             * the customization system.
             */

            if (
                categoryName ===
                "Make It Yours"
            ) {

                return;
            }


            let mappedCategory =
                categoryName;


            if (
                categoryName ===
                "Edible Cold-pressed Oils"
            ) {

                mappedCategory =
                    "Edible Cold-Pressed Oils";
            }


            card.addEventListener(
                "click",
                event => {

                    /*
                     * Don't open collection when
                     * clicking a button.
                     */

                    if (
                        event.target.closest(
                            "button"
                        )
                    ) {

                        return;
                    }


                    openCategoryModal(
                        mappedCategory
                    );
                }
            );
        }
    );


    /* =====================================================
       13. SHOP ALL
       ===================================================== */

    document
        .getElementById(
            "shop-all-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                if (
                    !categoryModal ||
                    !categoryProductGrid
                ) {

                    return;
                }


                const label =
                    document.getElementById(
                        "category-modal-label"
                    );


                const title =
                    document.getElementById(
                        "category-modal-title"
                    );


                const description =
                    document.getElementById(
                        "category-modal-description"
                    );


                if (label) {

                    label.textContent =
                        "Complete Collection";
                }


                if (title) {

                    title.textContent =
                        "Shop All Products";
                }


                if (description) {

                    description.textContent =
                        "Explore the complete Terra Haven collection.";
                }


                categoryProductGrid.innerHTML =
                    "";


                products.forEach(
                    product => {

                        categoryProductGrid.appendChild(
                            createProductCard(
                                product
                            )
                        );
                    }
                );


                categoryModal.classList.remove(
                    "hidden"
                );


                lockBackground();


                const panel =
                    categoryModal.querySelector(
                        ".category-modal-panel"
                    );


                if (panel) {

                    panel.scrollTop = 0;
                }
            }
        );


    /* =====================================================
       14. CART
       ===================================================== */

    const cartDrawer =
        document.getElementById(
            "cart-drawer"
        );


    function addToCart(
        product,
        quantity,
        selections
    ) {

        const key =
            JSON.stringify(
                selections || {}
            );


        const existing =
            cart.find(
                item =>
                    item.product.id ===
                        product.id &&
                    JSON.stringify(
                        item.selections
                    ) === key
            );


        if (existing) {

            existing.quantity +=
                quantity;

        } else {

            cart.push({

                product: product,

                quantity: quantity,

                selections:
                    selections || {}

            });
        }


        updateCartCount();

        renderCart();
    }


    /* =====================================================
       15. CART COUNT
       ===================================================== */

    function updateCartCount() {

        const total =
            cart.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            );


        document
            .querySelectorAll(
                "nav a"
            )
            .forEach(link => {

                const text =
                    link.textContent
                        .trim()
                        .toLowerCase();


                if (
                    text.startsWith(
                        "cart"
                    )
                ) {

                    link.textContent =
                        `Cart (${total})`;
                }
            });
    }


    /* =====================================================
       16. CART RENDER
       ===================================================== */

    function renderCart() {

        const cartItems =
            document.getElementById(
                "cart-items"
            );


        const cartTotal =
            document.getElementById(
                "cart-total"
            );


        if (
            !cartItems ||
            !cartTotal
        ) {

            return;
        }


        if (cart.length === 0) {

            cartItems.innerHTML = `

                <div
                    class="text-center py-16">

                    <div
                        class="font-serif text-3xl text-charcoal/30">

                        Your cart is empty

                    </div>


                    <p
                        class="text-sm text-charcoal/50 mt-3">

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
            cart
                .map(
                    (item, index) => {

                        const itemTotal =
                            item.product.price *
                            item.quantity;


                        total +=
                            itemTotal;


                        const optionValues =
                            Object.values(
                                item.selections ||
                                {}
                            );


                        return `

                            <div
                                class="cart-item">

                                <img
                                    src="${item.product.images[0]}"
                                    alt="${escapeHtml(item.product.name)}"
                                >


                                <div
                                    class="flex-1 min-w-0">

                                    <h3
                                        class="font-serif text-lg">

                                        ${escapeHtml(
                                            item.product.name
                                        )}

                                    </h3>


                                    ${
                                        optionValues.length
                                        ?
                                        `
                                        <p
                                            class="text-xs text-charcoal/50 mt-1">

                                            ${escapeHtml(
                                                optionValues.join(
                                                    " • "
                                                )
                                            )}

                                        </p>
                                        `
                                        :
                                        ""
                                    }


                                    <p
                                        class="text-xs mt-2">

                                        ${item.quantity}
                                        ×
                                        ${formatPrice(
                                            item.product.price
                                        )}

                                    </p>


                                    <p
                                        class="font-medium text-sm mt-1">

                                        ${formatPrice(
                                            itemTotal
                                        )}

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    class="remove-cart-item"
                                    data-index="${index}">

                                    ✕

                                </button>

                            </div>

                        `;
                    }
                )
                .join("");


        cartTotal.textContent =
            formatPrice(total);


        document
            .querySelectorAll(
                ".remove-cart-item"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        cart.splice(
                            index,
                            1
                        );


                        updateCartCount();

                        renderCart();
                    }
                );
            });
    }


    /* =====================================================
       17. OPEN CART
       ===================================================== */

    function openCart() {

        if (!cartDrawer) return;


        cartDrawer.classList.remove(
            "hidden"
        );


        lockBackground();


        const cartItems =
            document.getElementById(
                "cart-items"
            );


        if (cartItems) {

            cartItems.style.overscrollBehavior =
                "contain";
        }


        renderCart();
    }


    /* =====================================================
       18. CLOSE CART
       ===================================================== */

    function closeCart() {

        if (!cartDrawer) return;


        cartDrawer.classList.add(
            "hidden"
        );


        unlockBackground();
    }


    /* =====================================================
       19. CART NAVIGATION
       ===================================================== */

    document
        .querySelectorAll(
            "nav a"
        )
        .forEach(link => {

            if (
                link.textContent
                    .trim()
                    .toLowerCase()
                    .startsWith(
                        "cart"
                    )
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


    /* =====================================================
       20. CLOSE BUTTONS
       ===================================================== */

    document
        .getElementById(
            "product-modal-close"
        )
        ?.addEventListener(
            "click",
            closeProductModal
        );


    document
        .getElementById(
            "product-modal-overlay"
        )
        ?.addEventListener(
            "click",
            closeProductModal
        );


    document
        .getElementById(
            "category-modal-close"
        )
        ?.addEventListener(
            "click",
            closeCategoryModal
        );


    document
        .getElementById(
            "category-modal-overlay"
        )
        ?.addEventListener(
            "click",
            closeCategoryModal
        );


    document
        .getElementById(
            "cart-close"
        )
        ?.addEventListener(
            "click",
            closeCart
        );


    document
        .getElementById(
            "cart-overlay"
        )
        ?.addEventListener(
            "click",
            closeCart
        );


    /* =====================================================
       21. ESC KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;
            }


            closeProductModal();

            closeCategoryModal();

            closeCart();
        }
    );


    /* =====================================================
       22. NAVBAR
       ===================================================== */

    const navbar =
        document.getElementById(
            "navbar"
        );


    window.addEventListener(
        "scroll",
        () => {

            if (!navbar) return;


            if (
                window.scrollY >
                window.innerHeight - 80
            ) {

                navbar.classList.add(
                    "nav-scrolled"
                );

            } else {

                navbar.classList.remove(
                    "nav-scrolled"
                );
            }
        }
    );


    /* =====================================================
       23. INITIALISE
       ===================================================== */

    renderCart();

    updateCartCount();


    /* =====================================================
       24. REFRESH GSAP
       ===================================================== */

    if (
        typeof ScrollTrigger !==
        "undefined"
    ) {

        setTimeout(
            () => {
                ScrollTrigger.refresh();
            },
            500
        );
    }

});