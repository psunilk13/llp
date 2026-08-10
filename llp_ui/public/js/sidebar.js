/* ==========================================================================
   LLP - BRICKMAN Sidebar & Drawer Controller
   ========================================================================== */

(function () {
	console.log("[LLP UI] Sidebar & Drawer script loaded");

	function initSidebar() {
		const hamburgerBtn = document.getElementById("btn-hamburger-toggle") || document.querySelector(".llp-hamburger-btn");
		const sidebar = document.querySelector(".llp-sidebar");

		if (hamburgerBtn) {
			hamburgerBtn.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();

				// On mobile / small screens, toggle drawer overlay
				if (window.innerWidth <= 991) {
					document.body.classList.toggle("drawer-open");
				} else {
					// On desktop screens, toggle collapsed icon-only sidebar mode
					document.body.classList.toggle("sidebar-collapsed");
				}
			});
		}

		// Close drawer when clicking outside on mobile
		document.addEventListener("click", function (e) {
			if (window.innerWidth <= 991 && document.body.classList.contains("drawer-open")) {
				if (sidebar && !sidebar.contains(e.target) && hamburgerBtn && !hamburgerBtn.contains(e.target)) {
					document.body.classList.remove("drawer-open");
				}
			}
		});

		// Interactive Tab Switcher
		const tabBtns = document.querySelectorAll(".llp-tab-btn");
		tabBtns.forEach(btn => {
			btn.addEventListener("click", function () {
				tabBtns.forEach(b => b.classList.remove("active"));
				btn.classList.add("active");
			});
		});

		// Submenu Collapsible Items
		const menuDropdowns = document.querySelectorAll(".llp-menu-dropdown");
		menuDropdowns.forEach(dropdown => {
			dropdown.addEventListener("click", function (e) {
				e.preventDefault();
				dropdown.classList.toggle("open");
				const chevron = dropdown.querySelector(".menu-chevron");
				if (chevron) {
					chevron.classList.toggle("fa-chevron-down");
					chevron.classList.toggle("fa-chevron-up");
				}
			});
		});

		// Global Logout Dialog & Snackbar Handler
		setupLogoutHandlers();
	}

	function showSnackbar(message) {
		let snackbar = document.getElementById("llp-snackbar");
		if (!snackbar) {
			snackbar = document.createElement("div");
			snackbar.id = "llp-snackbar";
			snackbar.className = "llp-snackbar";
			document.body.appendChild(snackbar);
		}
		snackbar.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
		snackbar.classList.add("show");
	}

	function showLogoutDialog(logoutUrl) {
		let modal = document.getElementById("llp-logout-modal");
		if (!modal) {
			modal = document.createElement("div");
			modal.id = "llp-logout-modal";
			modal.className = "llp-modal-overlay";
			modal.innerHTML = `
				<div class="llp-modal-card">
					<div class="llp-modal-icon">
						<i class="fa-solid fa-arrow-right-from-bracket"></i>
					</div>
					<h3 class="llp-modal-title">Do you want to logout?</h3>
					<p class="llp-modal-text">Are you sure you want to end your current session?</p>
					<div class="llp-modal-actions">
						<button type="button" class="llp-btn-modal-cancel">Cancel</button>
						<button type="button" class="llp-btn-modal-confirm">Logout</button>
					</div>
				</div>
			`;
			document.body.appendChild(modal);

			const cancelBtn = modal.querySelector(".llp-btn-modal-cancel");
			cancelBtn.addEventListener("click", function () {
				modal.classList.remove("active");
			});

			modal.addEventListener("click", function (e) {
				if (e.target === modal) {
					modal.classList.remove("active");
				}
			});
		}

		const confirmBtn = modal.querySelector(".llp-btn-modal-confirm");
		const newConfirmBtn = confirmBtn.cloneNode(true);
		confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

		newConfirmBtn.addEventListener("click", function () {
			modal.classList.remove("active");
			showSnackbar("Logging out successfully... Redirecting!");
			setTimeout(function () {
				window.location.href = logoutUrl || "/?cmd=web_logout";
			}, 1200);
		});

		// Allow Esc key to close dialog
		const escHandler = function (e) {
			if (e.key === "Escape") {
				modal.classList.remove("active");
				document.removeEventListener("keydown", escHandler);
			}
		};
		document.addEventListener("keydown", escHandler);

		modal.classList.add("active");
	}

	function setupLogoutHandlers() {
		document.addEventListener("click", function (e) {
			const logoutTrigger = e.target.closest(".llp-logout-trigger, .llp-btn-logout, .llp-desk-logout-btn, a[href*='web_logout']");
			if (logoutTrigger) {
				e.preventDefault();
				e.stopPropagation();
				const targetUrl = logoutTrigger.getAttribute("href") || "/?cmd=web_logout";
				showLogoutDialog(targetUrl);
			}
		}, true);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initSidebar);
	} else {
		initSidebar();
	}
})();

