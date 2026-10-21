document.addEventListener("DOMContentLoaded", () => {
    const yearElement = document.getElementById("year");
    const menuToggle = document.querySelector(".menu-toggle");
    const primaryNav = document.querySelector(".primary-nav");
    const contactForm = document.getElementById("contact-form");
    const serviceSelect = document.getElementById("service");
    const formStatus = document.getElementById("form-status");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    if (menuToggle && primaryNav) {
        const closeMenu = () => {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open menu");
            primaryNav.classList.remove("is-open");
        };

        menuToggle.addEventListener("click", () => {
            const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!isExpanded));
            menuToggle.setAttribute("aria-label", isExpanded ? "Open menu" : "Close menu");
            primaryNav.classList.toggle("is-open", !isExpanded);
        });

        primaryNav.addEventListener("click", (event) => {
            if (event.target.closest("a")) closeMenu();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });
    }

    document.querySelectorAll(".service-link[data-service]").forEach((link) => {
        link.addEventListener("click", () => {
            if (serviceSelect) serviceSelect.value = link.dataset.service;
        });
    });

    if (!contactForm || !formStatus) return;

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());
        const apiBase = window.location.protocol === "file:" ? "http://localhost:5000" : "";

        formStatus.textContent = "Sending your inquiry…";
        formStatus.className = "form-status";
        submitButton.disabled = true;

        try {
            const response = await fetch(`${apiBase}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Your inquiry could not be sent.");
            }

            formStatus.textContent = result.message;
            formStatus.classList.add("is-success");
            contactForm.reset();
        } catch (error) {
            formStatus.textContent = error instanceof Error
                ? error.message
                : "Unable to send your inquiry right now. Please try again.";
            formStatus.classList.add("is-error");
        } finally {
            submitButton.disabled = false;
        }
    });
});
