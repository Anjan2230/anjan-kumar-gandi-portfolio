"use strict";

document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       PORTFOLIO — PREMIUM INTERACTION ENGINE
       ========================================================= */

    const body = document.body;
    const header = document.querySelector(".site-header");
    const main = document.querySelector("main");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

    /* =========================================================
       HELPERS
       ========================================================= */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const clamp = (value, min, max) =>
        Math.min(Math.max(value, min), max);

    /* =========================================================
       PAGE READY
       ========================================================= */

    requestAnimationFrame(() => {
        body.classList.add("page-ready");
    });

    /* =========================================================
       HEADER + SCROLL PROGRESS
       ========================================================= */

    let ticking = false;

    let scrollProgress = $(".scroll-progress");

    if (!scrollProgress) {
        scrollProgress = document.createElement("div");
        scrollProgress.className = "scroll-progress";
        scrollProgress.setAttribute("aria-hidden", "true");

        body.prepend(scrollProgress);
    }

    function updateScrollUI() {
        const scrollTop = window.scrollY;

        /* Header */
        if (header) {
            header.classList.toggle("is-scrolled", scrollTop > 30);
        }

        /* Progress */
        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress =
            documentHeight > 0
                ? (scrollTop / documentHeight) * 100
                : 0;

        scrollProgress.style.setProperty(
            "--scroll-progress",
            `${clamp(progress, 0, 100)}%`
        );

        /* Hero scroll indicator */
        const scrollIndicator = $(".hero-scroll-indicator");

        if (scrollIndicator) {
            scrollIndicator.classList.toggle(
                "is-hidden",
                scrollTop > 100
            );
        }

        ticking = false;
    }

    function requestScrollUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollUI);
            ticking = true;
        }
    }

    window.addEventListener(
        "scroll",
        requestScrollUpdate,
        { passive: true }
    );

    updateScrollUI();

    /* =========================================================
       REVEAL ON SCROLL
       ========================================================= */

    const revealElements = $$(".reveal");

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => {
            element.classList.add("is-revealed");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-revealed");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -60px 0px"
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    }

    /* =========================================================
       ACTIVE NAVIGATION
       ========================================================= */

    const navLinks = $$(
        'a[href^="#"]:not([href="#"])'
    );

    const sections = $$(
        "main section[id]"
    );

    function setActiveNavigation(id) {
        navLinks.forEach((link) => {
            const target = link.getAttribute("href");

            const isActive =
                target === `#${id}`;

            link.classList.toggle(
                "active",
                isActive
            );

            if (isActive) {
                link.setAttribute(
                    "aria-current",
                    "page"
                );
            } else {
                link.removeAttribute(
                    "aria-current"
                );
            }
        });
    }

    if (
        sections.length &&
        "IntersectionObserver" in window
    ) {
        const sectionObserver =
            new IntersectionObserver(
                (entries) => {
                    const visibleSections =
                        entries
                            .filter(
                                (entry) =>
                                    entry.isIntersecting
                            )
                            .sort(
                                (a, b) =>
                                    b.intersectionRatio -
                                    a.intersectionRatio
                            );

                    if (
                        visibleSections.length
                    ) {
                        setActiveNavigation(
                            visibleSections[0]
                                .target.id
                        );
                    }
                },
                {
                    rootMargin:
                        "-35% 0px -55% 0px",
                    threshold: [0.1, 0.25, 0.5]
                }
            );

        sections.forEach((section) => {
            sectionObserver.observe(section);
        });
    }

    /* =========================================================
       SMOOTH ANCHOR SCROLLING
       ========================================================= */

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href =
                link.getAttribute("href");

            if (
                !href ||
                href === "#" ||
                !href.startsWith("#")
            ) {
                return;
            }

            const target =
                document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: reducedMotion
                    ? "auto"
                    : "smooth",
                block: "start"
            });

            history.pushState(
                null,
                "",
                href
            );
        });
    });

    /* =========================================================
       MOBILE NAVIGATION
       ========================================================= */

    const mobileNav =
        $(".mobile-nav");

    const mobileToggle =
        $(".hamburger-btn") ||
        $(".mobile-menu-toggle");

    const mobileLinks =
        $$(".mobile-nav-link");

    function openMobileMenu() {
        if (!mobileNav || !mobileToggle) {
            return;
        }

        mobileNav.classList.add("is-open");
        mobileToggle.classList.add("is-active");

        mobileToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        body.classList.add(
            "mobile-menu-open"
        );
    }

    function closeMobileMenu() {
        if (!mobileNav || !mobileToggle) {
            return;
        }

        mobileNav.classList.remove("is-open");
        mobileToggle.classList.remove(
            "is-active"
        );

        mobileToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        body.classList.remove(
            "mobile-menu-open"
        );
    }

    if (mobileToggle) {
        mobileToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileToggle.addEventListener(
            "click",
            () => {
                const isOpen =
                    mobileNav?.classList.contains(
                        "is-open"
                    );

                if (isOpen) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            }
        );
    }

    mobileLinks.forEach((link) => {
        link.addEventListener(
            "click",
            closeMobileMenu
        );
    });

    document.addEventListener(
        "click",
        (event) => {
            if (
                !mobileNav ||
                !mobileToggle ||
                !mobileNav.classList.contains(
                    "is-open"
                )
            ) {
                return;
            }

            if (
                mobileNav.contains(event.target) ||
                mobileToggle.contains(event.target)
            ) {
                return;
            }

            closeMobileMenu();
        }
    );

    /* =========================================================
       ESCAPE KEY
       ========================================================= */

    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key !== "Escape") {
                return;
            }

            closeMobileMenu();

            document
                .querySelectorAll(
                    ".toast.show"
                )
                .forEach((toast) => {
                    toast.classList.remove(
                        "show"
                    );
                });
        }
    );

    /* =========================================================
       BACK TO TOP
       ========================================================= */

    const backToTop =
        $("#back-to-top");

    if (backToTop) {
        backToTop.addEventListener(
            "click",
            () => {
                window.scrollTo({
                    top: 0,
                    behavior: reducedMotion
                        ? "auto"
                        : "smooth"
                });
            }
        );
    }

    /* =========================================================
       TOAST NOTIFICATIONS
       ========================================================= */

    const toastContainer =
        $("#toast-container");

    function showToast(
        message,
        type = "success",
        duration = 3500
    ) {
        if (!toastContainer) return;

        const toast =
            document.createElement("div");

        toast.className =
            `toast toast-${type}`;

        const icon =
            type === "success"
                ? "✓"
                : type === "error"
                ? "!"
                : "i";

        toast.innerHTML = `
            <span class="toast-icon"
                  aria-hidden="true">
                ${icon}
            </span>
            <span class="toast-message">
                ${message}
            </span>
        `;

        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        const removeToast = () => {
            toast.classList.remove("show");

            setTimeout(() => {
                toast.remove();
            }, 300);
        };

        setTimeout(
            removeToast,
            duration
        );
    }

    /* =========================================================
       COPY TO CLIPBOARD
       ========================================================= */

    async function copyText(text) {
        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            await navigator.clipboard.writeText(
                text
            );

            return true;
        }

        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        textarea.style.position =
            "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(
            textarea
        );

        textarea.focus();
        textarea.select();

        let successful = false;

        try {
            successful =
                document.execCommand(
                    "copy"
                );
        } catch {
            successful = false;
        }

        textarea.remove();

        return successful;
    }

    $$(
        ".copy-action-btn"
    ).forEach((button) => {
        button.addEventListener(
            "click",
            async () => {
                const text =
                    button.dataset.copy ||
                    button.getAttribute(
                        "data-copy"
                    );

                if (!text) return;

                const originalText =
                    button.textContent;

                const success =
                    await copyText(text);

                if (success) {
                    button.textContent =
                        "Copied!";

                    showToast(
                        "Copied to clipboard.",
                        "success"
                    );

                    setTimeout(() => {
                        button.textContent =
                            originalText;
                    }, 1800);
                } else {
                    showToast(
                        "Unable to copy. Please copy it manually.",
                        "error"
                    );
                }
            }
        );
    });

    /* =========================================================
       CONTACT FORM
       ========================================================= */

    const contactForm =
        $("#portfolio-contact-form");

    const nameInput =
        $("#contact-name");

    const emailInput =
        $("#contact-email");

    const subjectInput =
        $("#contact-subject");

    const messageInput =
        $("#contact-message");

    const nameError =
        $("#name-error");

    const emailError =
        $("#email-error");

    const messageError =
        $("#message-error");

    const submitButton =
        $("#form-submit-btn");

    const portfolioEmail =
        "anjankumar.gandi@gmail.com";

    function setFieldError(
        input,
        errorElement,
        message
    ) {
        if (!input) return;

        const hasError =
            Boolean(message);

        input.classList.toggle(
            "is-invalid",
            hasError
        );

        input.setAttribute(
            "aria-invalid",
            String(hasError)
        );

        if (errorElement) {
            errorElement.textContent =
                message || "";
        }
    }

    function validateContactForm() {
        let valid = true;

        const name =
            nameInput?.value.trim() || "";

        const email =
            emailInput?.value.trim() || "";

        const message =
            messageInput?.value.trim() || "";

        if (!name) {
            setFieldError(
                nameInput,
                nameError,
                "Please enter your name."
            );

            valid = false;
        } else {
            setFieldError(
                nameInput,
                nameError,
                ""
            );
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setFieldError(
                emailInput,
                emailError,
                "Please enter your email."
            );

            valid = false;
        } else if (
            !emailPattern.test(email)
        ) {
            setFieldError(
                emailInput,
                emailError,
                "Please enter a valid email address."
            );

            valid = false;
        } else {
            setFieldError(
                emailInput,
                emailError,
                ""
            );
        }

        if (!message) {
            setFieldError(
                messageInput,
                messageError,
                "Please enter your message."
            );

            valid = false;
        } else {
            setFieldError(
                messageInput,
                messageError,
                ""
            );
        }

        return valid;
    }

    if (contactForm) {
        contactForm.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();

                if (
                    !validateContactForm()
                ) {
                    showToast(
                        "Please fix the highlighted fields.",
                        "error"
                    );

                    return;
                }

                const name =
                    nameInput.value.trim();

                const email =
                    emailInput.value.trim();

                const subject =
                    subjectInput?.value.trim() ||
                    `Portfolio enquiry from ${name}`;

                const message =
                    messageInput.value.trim();

                const emailBody =
                    `Hi Anjan,%0D%0A%0D%0A` +
                    `${encodeURIComponent(
                        message
                    )}` +
                    `%0D%0A%0D%0A` +
                    `Name: ${encodeURIComponent(
                        name
                    )}` +
                    `%0D%0A` +
                    `Email: ${encodeURIComponent(
                        email
                    )}`;

                const mailto =
                    `mailto:${portfolioEmail}` +
                    `?subject=${encodeURIComponent(
                        subject
                    )}` +
                    `&body=${emailBody}`;

                if (submitButton) {
                    submitButton.disabled =
                        true;

                    submitButton.classList.add(
                        "is-sending"
                    );
                }

                showToast(
                    "Opening your email client...",
                    "success",
                    2500
                );

                setTimeout(() => {
                    window.location.href =
                        mailto;

                    if (submitButton) {
                        submitButton.disabled =
                            false;

                        submitButton.classList.remove(
                            "is-sending"
                        );
                    }
                }, 350);
            }
        );

        [
            nameInput,
            emailInput,
            messageInput
        ].forEach((input) => {
            if (!input) return;

            input.addEventListener(
                "blur",
                validateContactForm
            );

            input.addEventListener(
                "input",
                () => {
                    input.classList.remove(
                        "is-invalid"
                    );
                }
            );
        });
    }

    /* =========================================================
       MAGNETIC BUTTONS
       ========================================================= */

    if (
        !reducedMotion &&
        !isTouchDevice
    ) {
        $$(".magnetic-btn").forEach(
            (button) => {
                button.addEventListener(
                    "pointermove",
                    (event) => {
                        const rect =
                            button.getBoundingClientRect();

                        const x =
                            event.clientX -
                            rect.left -
                            rect.width / 2;

                        const y =
                            event.clientY -
                            rect.top -
                            rect.height / 2;

                        const strength =
                            0.18;

                        button.style.transform =
                            `translate(${x * strength}px, ${y * strength}px)`;
                    }
                );

                button.addEventListener(
                    "pointerleave",
                    () => {
                        button.style.transform =
                            "";
                    }
                );
            }
        );
    }

    /* =========================================================
       CARD TILT
       ========================================================= */

    if (
        !reducedMotion &&
        !isTouchDevice
    ) {
        const tiltCards = $$(
            [
                ".project-item-card",
                ".skill-card",
                ".timeline-card",
                ".education-item-card",
                ".cert-item-card",
                ".contact-form-card",
                ".channel-card"
            ].join(",")
        );

        tiltCards.forEach((card) => {
            card.addEventListener(
                "pointermove",
                (event) => {
                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        (event.clientX -
                            rect.left) /
                            rect.width -
                        0.5;

                    const y =
                        (event.clientY -
                            rect.top) /
                            rect.height -
                        0.5;

                    const rotateX =
                        clamp(
                            -y * 7,
                            -7,
                            7
                        );

                    const rotateY =
                        clamp(
                            x * 7,
                            -7,
                            7
                        );

                    card.style.transform =
                        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
                }
            );

            card.addEventListener(
                "pointerleave",
                () => {
                    card.style.transform =
                        "";
                }
            );
        });
    }

    /* =========================================================
       PREMIUM CURSOR
       ========================================================= */

    if (
        !reducedMotion &&
        !isTouchDevice
    ) {
        const cursor =
            document.createElement("div");

        cursor.className =
            "premium-cursor";

        cursor.setAttribute(
            "aria-hidden",
            "true"
        );

        cursor.innerHTML = `
            <span class="premium-cursor-dot"></span>
            <span class="premium-cursor-ring"></span>
        `;

        body.appendChild(cursor);

        let cursorX = 0;
        let cursorY = 0;
        let targetX = 0;
        let targetY = 0;

        let cursorFrame = null;

        function animateCursor() {
            cursorX +=
                (targetX - cursorX) *
                0.18;

            cursorY +=
                (targetY - cursorY) *
                0.18;

            cursor.style.transform =
                `translate3d(${cursorX}px, ${cursorY}px, 0)`;

            cursorFrame =
                requestAnimationFrame(
                    animateCursor
                );
        }

        document.addEventListener(
            "pointermove",
            (event) => {
                targetX =
                    event.clientX;

                targetY =
                    event.clientY;

                cursor.classList.add(
                    "is-visible"
                );

                if (!cursorFrame) {
                    cursorFrame =
                        requestAnimationFrame(
                            animateCursor
                        );
                }
            },
            { passive: true }
        );

        const interactiveSelectors =
            [
                "a",
                "button",
                "input",
                "textarea",
                "select",
                ".project-item-card",
                ".skill-card",
                ".channel-card"
            ].join(",");

        document.addEventListener(
            "pointerover",
            (event) => {
                if (
                    event.target.closest(
                        interactiveSelectors
                    )
                ) {
                    cursor.classList.add(
                        "is-hovering"
                    );
                }
            }
        );

        document.addEventListener(
            "pointerout",
            (event) => {
                if (
                    event.target.closest(
                        interactiveSelectors
                    )
                ) {
                    cursor.classList.remove(
                        "is-hovering"
                    );
                }
            }
        );

        document.addEventListener(
            "mouseleave",
            () => {
                cursor.classList.remove(
                    "is-visible"
                );
            }
        );
    }

    /* =========================================================
       HERO PARALLAX
       ========================================================= */

    if (
        !reducedMotion &&
        !isTouchDevice
    ) {
        const hero =
            $("#home");

        const heroVisual =
            hero?.querySelector(
                ".hero-visual, .hero-image-wrapper, .profile-card-wrapper, .profile-card"
            );

        if (hero && heroVisual) {
            hero.addEventListener(
                "pointermove",
                (event) => {
                    const rect =
                        hero.getBoundingClientRect();

                    const x =
                        (event.clientX -
                            rect.left) /
                            rect.width -
                        0.5;

                    const y =
                        (event.clientY -
                            rect.top) /
                            rect.height -
                        0.5;

                    heroVisual.style.transform =
                        `translate3d(${x * 10}px, ${y * 10}px, 0)`;
                }
            );

            hero.addEventListener(
                "pointerleave",
                () => {
                    heroVisual.style.transform =
                        "";
                }
            );
        }
    }

    /* =========================================================
       BUTTON RIPPLE
       ========================================================= */

    if (!reducedMotion) {
        $$(
            "button, .btn, .magnetic-btn"
        ).forEach((button) => {
            button.addEventListener(
                "click",
                (event) => {
                    const rect =
                        button.getBoundingClientRect();

                    const ripple =
                        document.createElement(
                            "span"
                        );

                    ripple.className =
                        "button-ripple";

                    const size =
                        Math.max(
                            rect.width,
                            rect.height
                        ) * 1.4;

                    ripple.style.width =
                        `${size}px`;

                    ripple.style.height =
                        `${size}px`;

                    ripple.style.left =
                        `${event.clientX - rect.left - size / 2}px`;

                    ripple.style.top =
                        `${event.clientY - rect.top - size / 2}px`;

                    button.appendChild(
                        ripple
                    );

                    setTimeout(() => {
                        ripple.remove();
                    }, 650);
                }
            );
        });
    }

    /* =========================================================
       CARD MOUSE POSITION
       ========================================================= */

    if (!reducedMotion) {
        $$(
            [
                ".project-item-card",
                ".skill-card",
                ".channel-card",
                ".education-item-card",
                ".cert-item-card"
            ].join(",")
        ).forEach((card) => {
            card.addEventListener(
                "pointermove",
                (event) => {
                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        ((event.clientX -
                            rect.left) /
                            rect.width) *
                        100;

                    const y =
                        ((event.clientY -
                            rect.top) /
                            rect.height) *
                        100;

                    card.style.setProperty(
                        "--mouse-x",
                        `${x}%`
                    );

                    card.style.setProperty(
                        "--mouse-y",
                        `${y}%`
                    );
                },
                { passive: true }
            );
        });
    }

    /* =========================================================
       IMAGE LOAD STATES
       ========================================================= */

    $$("img").forEach((image) => {
        if (image.complete) {
            image.classList.add(
                "image-loaded"
            );
        } else {
            image.addEventListener(
                "load",
                () => {
                    image.classList.add(
                        "image-loaded"
                    );
                },
                { once: true }
            );
        }

        if (
            !image.hasAttribute(
                "loading"
            ) &&
            !image.closest(".hero")
        ) {
            image.setAttribute(
                "loading",
                "lazy"
            );
        }
    });

    /* =========================================================
       EXTERNAL LINK SAFETY
       ========================================================= */

    $$('a[target="_blank"]').forEach(
        (link) => {
            const rel =
                link.getAttribute("rel") ||
                "";

            const relValues =
                new Set(
                    rel.split(/\s+/).filter(
                        Boolean
                    )
                );

            relValues.add("noopener");
            relValues.add("noreferrer");

            link.setAttribute(
                "rel",
                [...relValues].join(" ")
            );
        }
    );

    /* =========================================================
       RESUME LINK TRACKING
       ========================================================= */

    $$(
        'a[href*="Anjan_Kumar_Gandi_Resume"]'
    ).forEach((link) => {
        link.addEventListener(
            "click",
            () => {
                showToast(
                    "Opening resume...",
                    "success",
                    1800
                );
            }
        );
    });

    /* =========================================================
       DYNAMIC YEAR
       ========================================================= */

    $$("[data-current-year]").forEach(
        (element) => {
            element.textContent =
                new Date().getFullYear();
        }
    );

    /* =========================================================
       FIRST SCROLL STATE
       ========================================================= */

    let hasScrolled = false;

    window.addEventListener(
        "scroll",
        () => {
            if (hasScrolled) return;

            hasScrolled = true;

            body.classList.add(
                "has-scrolled"
            );
        },
        {
            passive: true,
            once: true
        }
    );

    /* =========================================================
       RESIZE CLEANUP
       ========================================================= */

    window.addEventListener(
        "resize",
        () => {
            if (
                window.innerWidth > 900
            ) {
                closeMobileMenu();
            }
        },
        { passive: true }
    );

    /* =========================================================
       REDUCED MOTION
       ========================================================= */

    if (reducedMotion) {
        body.classList.add(
            "reduced-motion"
        );
    }

    /* =========================================================
       CONSOLE BRANDING
       ========================================================= */

    console.log(
        "%c ANJAN KUMAR GANDI ",
        "background:#7c3aed;color:#fff;font-weight:700;padding:6px 10px;border-radius:6px;"
    );

    console.log(
        "%c Portfolio loaded successfully.",
        "color:#7c3aed;font-weight:600;"
    );
});