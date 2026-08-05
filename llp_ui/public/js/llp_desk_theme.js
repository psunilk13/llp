/* ==========================================================================
   LLP - AMARAVATHI BRICKS Complete Frappe Desk Controller
   Places Hamburger Icon FIRST at top left before logo (Swaps on hover)
   ========================================================================== */

(function () {
	console.log("[LLP UI] AMARAVATHI BRICKS Desk theme controller loaded");

	function applyDeskTheme() {
		const navbar = document.querySelector(".navbar.navbar-expand, header.navbar");
		if (!navbar) return;

		const container = navbar.querySelector(".container") || navbar;
		const logoLink = navbar.querySelector(".navbar-brand, .navbar-home");

		// 1. Dual Icon Hamburger Button (Swaps icon to toggler on hover)
		let hamburgerBtn = document.getElementById("llp-top-hamburger");
		if (!hamburgerBtn) {
			hamburgerBtn = document.createElement("button");
			hamburgerBtn.id = "llp-top-hamburger";
			hamburgerBtn.type = "button";
			hamburgerBtn.className = "llp-desk-hamburger-btn";
			hamburgerBtn.title = "Toggle Navigation";
			hamburgerBtn.innerHTML = `
				<span class="icon-hamburger"><i class="fa-solid fa-bars"></i></span>
				<span class="icon-toggler"><i class="fa-solid fa-angles-right"></i></span>
			`;

			if (logoLink && logoLink.parentNode === container) {
				container.insertBefore(hamburgerBtn, logoLink);
			} else if (container.firstChild) {
				container.insertBefore(hamburgerBtn, container.firstChild);
			} else {
				container.appendChild(hamburgerBtn);
			}
		} else {
			if (!hamburgerBtn.querySelector(".icon-hamburger")) {
				hamburgerBtn.innerHTML = `
					<span class="icon-hamburger"><i class="fa-solid fa-bars"></i></span>
					<span class="icon-toggler"><i class="fa-solid fa-angles-right"></i></span>
				`;
			}
		}

		// 2. Format Logo Badge (Logo Image inside white badge; Pure White AMARAVATHI BRICKS text OUTSIDE)
		if (logoLink) {
			logoLink.style.background = "transparent";
			logoLink.style.boxShadow = "none";
			logoLink.style.padding = "0";
			logoLink.style.display = "inline-flex";
			logoLink.style.alignItems = "center";
			logoLink.style.gap = "10px";
			logoLink.style.textDecoration = "none";

			if (!logoLink.querySelector(".llp-desk-logo-badge") || logoLink.textContent.indexOf("AMARAVATHI BRICKS") === -1) {
				logoLink.innerHTML = `
					<div class="llp-desk-logo-badge">
						<img src="/assets/llp_ui/images/logo.png" alt="AMARAVATHI BRICKS Logo" class="llp-desk-logo-img">
					</div>
					<span class="llp-desk-brand-text">AMARAVATHI BRICKS</span>
				`;
			}
		}

		// 3. Ensure EXACTLY ONE Logout Button exists in navbar controls
		const logoutBtns = navbar.querySelectorAll(".llp-desk-logout-btn");
		if (logoutBtns.length > 1) {
			for (let i = 1; i < logoutBtns.length; i++) {
				logoutBtns[i].remove();
			}
		} else if (logoutBtns.length === 0 && container) {
			const logoutBtn = document.createElement("a");
			logoutBtn.href = "/?cmd=web_logout";
			logoutBtn.className = "llp-desk-logout-btn llp-logout-trigger";
			logoutBtn.title = "Logout";
			logoutBtn.style.order = "99";
			logoutBtn.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i>`;
			container.appendChild(logoutBtn);
		}

		// 4. Move .page-head to be the first child of .layout-main-section-wrapper
		const pageHead = document.querySelector(".page-head");
		const mainSection = document.querySelector(".layout-main-section-wrapper");
		if (pageHead && mainSection && pageHead.parentNode !== mainSection) {
			mainSection.insertBefore(pageHead, mainSection.firstChild);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", applyDeskTheme);
	} else {
		applyDeskTheme();
	}

	if (window.jQuery) {
		jQuery(document).on("page-change", applyDeskTheme);
	}
})();


