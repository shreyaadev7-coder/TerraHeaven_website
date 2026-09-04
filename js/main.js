// Remove loader on page load
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.visibility = 'hidden'; }, 1000);
});

// Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

// 1. Hero Parallax Effect
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

// 2. Text Reveal Animation (Split layout)
gsap.from(".reveal-image", {
    scrollTrigger: { trigger: ".reveal-text-container", start: "top 80%" },
    y: 50, opacity: 0, duration: 1.2, ease: "power3.out"
});
gsap.from(".reveal-text", {
    scrollTrigger: { trigger: ".reveal-text-container", start: "top 80%" },
    y: 30, opacity: 0, duration: 1.2, stagger: 0.2, ease: "power3.out"
});

// 3. Horizontal Scroll Section
const horizontalSection = document.querySelector("#horizontal-scroll");
const horizontalTrack = document.querySelector("#horizontal-track");

let getScrollAmount = () => -(horizontalTrack.scrollWidth - window.innerWidth + 100); 

const tween = gsap.to(horizontalTrack, {
    x: getScrollAmount,
    ease: "none"
});

ScrollTrigger.create({
    trigger: horizontalSection,
    start: "top top",
    end: () => `+=${horizontalTrack.scrollWidth - window.innerWidth + 100}`,
    pin: true,
    animation: tween,
    scrub: 1,
    invalidateOnRefresh: true
});

// 4. Parallax Image Break
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

// 5. Staggered Product Fade Ups
gsap.from(".fade-up", {
    scrollTrigger: { trigger: "#categories", start: "top 80%" },
    y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out"
});

// Fixed Navbar Background
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight - 80) {
        navbar.classList.add('nav-scrolled');
    } else {
        navbar.classList.remove('nav-scrolled');
    }
});
