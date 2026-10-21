document.addEventListener("DOMContentLoaded", () => {
    const loginPanel = document.getElementById("login-panel");
    const dashboard = document.getElementById("dashboard");
    const loginForm = document.getElementById("login-form");
    const loginMessage = document.getElementById("login-message");
    const dashboardMessage = document.getElementById("dashboard-message");
    const inquiryList = document.getElementById("inquiry-list");
    const searchInput = document.getElementById("search-input");
    const logoutButton = document.getElementById("logout-button");
    let inquiries = [];

    const setMessage = (element, text, isError = false) => {
        element.textContent = text;
        element.classList.toggle("is-error", isError);
    };

    async function request(url, options = {}) {
        const response = await fetch(url, {
            credentials: "same-origin",
            ...options,
            headers: { "Content-Type": "application/json", ...options.headers }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "The request could not be completed.");
        return result;
    }

    function showLogin() {
        dashboard.hidden = true;
        loginPanel.hidden = false;
    }

    function showDashboard() {
        loginPanel.hidden = true;
        dashboard.hidden = false;
    }

    function renderInquiries() {
        const query = searchInput.value.trim().toLowerCase();
        const visible = inquiries.filter((inquiry) =>
            [inquiry.name, inquiry.email, inquiry.service, inquiry.message]
                .some((value) => value.toLowerCase().includes(query))
        );
        document.getElementById("total-count").textContent = String(inquiries.length);
        document.getElementById("new-count").textContent =
            String(inquiries.filter((inquiry) => inquiry.status === "new").length);
        document.getElementById("active-count").textContent =
            String(inquiries.filter((inquiry) => inquiry.status === "in-progress").length);
        inquiryList.replaceChildren();

        if (!visible.length) {
            const empty = document.createElement("p");
            empty.className = "empty-state";
            empty.textContent = inquiries.length ? "No inquiries match your search." : "No inquiries yet. New customer messages will appear here.";
            inquiryList.append(empty);
            return;
        }

        for (const inquiry of visible) {
            const card = document.createElement("article");
            card.className = "inquiry-card";
            const header = document.createElement("div");
            header.className = "inquiry-top";
            const identity = document.createElement("div");
            const name = document.createElement("h3");
            name.className = "inquiry-name";
            name.textContent = inquiry.name;
            const meta = document.createElement("p");
            meta.className = "inquiry-meta";
            const email = document.createElement("a");
            email.href = `mailto:${inquiry.email}`;
            email.textContent = inquiry.email;
            meta.append(email);
            identity.append(name, meta);
            const date = document.createElement("time");
            date.className = "inquiry-date";
            date.dateTime = inquiry.created_at;
            date.textContent = new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
            }).format(new Date(inquiry.created_at));
            header.append(identity, date);

            const service = document.createElement("p");
            service.className = "inquiry-service";
            service.textContent = inquiry.service || "Service not specified";
            const message = document.createElement("p");
            message.className = "inquiry-message";
            message.textContent = inquiry.message;
            const actions = document.createElement("div");
            actions.className = "inquiry-actions";
            const statusLabel = document.createElement("label");
            statusLabel.textContent = "Status";
            const status = document.createElement("select");
            status.setAttribute("aria-label", `Status for ${inquiry.name}`);
            for (const [value, label] of [["new", "New"], ["in-progress", "In progress"], ["closed", "Closed"]]) {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = label;
                status.append(option);
            }
            status.value = inquiry.status;
            status.addEventListener("change", async () => {
                status.disabled = true;
                try {
                    const result = await request(`/api/admin/inquiries/${encodeURIComponent(inquiry.id)}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: status.value })
                    });
                    inquiries = inquiries.map((item) => item.id === result.inquiry.id ? result.inquiry : item);
                    setMessage(dashboardMessage, "Inquiry status updated.");
                    renderInquiries();
                } catch (error) {
                    status.value = inquiry.status;
                    setMessage(dashboardMessage, error.message, true);
                    status.disabled = false;
                }
            });
            statusLabel.append(status);
            actions.append(statusLabel);
            card.append(header, service, message, actions);
            inquiryList.append(card);
        }
    }

    async function loadDashboard() {
        const result = await request("/api/admin/inquiries");
        inquiries = result.inquiries.map((inquiry) => ({
            ...inquiry,
            created_at: new Date(inquiry.created_at).toISOString()
        }));
        showDashboard();
        renderInquiries();
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = loginForm.querySelector("button");
        button.disabled = true;
        setMessage(loginMessage, "Signing in…");
        try {
            const password = new FormData(loginForm).get("password");
            await request("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
            loginForm.reset();
            await loadDashboard();
        } catch (error) {
            setMessage(loginMessage, error.message, true);
        } finally {
            button.disabled = false;
        }
    });

    logoutButton.addEventListener("click", async () => {
        try {
            await request("/api/admin/logout", { method: "POST", body: "{}" });
            showLogin();
            setMessage(loginMessage, "You have been signed out.");
        } catch (error) {
            setMessage(dashboardMessage, error.message, true);
        }
    });

    searchInput.addEventListener("input", renderInquiries);
    loadDashboard().catch((error) => {
        if (error.message.includes("sign in")) showLogin();
        else {
            showLogin();
            setMessage(loginMessage, error.message, true);
        }
    });
});
