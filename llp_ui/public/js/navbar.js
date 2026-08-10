/* ==========================================================================
   LLP - AMARAVATHI BRICKS Native Navbar Controller
   Moves Frappe's native .sidebar-toggle-btn directly into the Top Navbar
   before the logo badge, handles FontAwesome icons, white text outside logo badge,
   single logout button, and reliable sidebar collapse toggle!
   ========================================================================== */

(function () {
	console.log("[LLP UI] AMARAVATHI BRICKS top navbar controller loaded");

	if (!document.getElementById("llp-fontawesome-css")) {
		const faCss = document.createElement("link");
		faCss.id = "llp-fontawesome-css";
		faCss.rel = "stylesheet";
		faCss.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
		document.head.appendChild(faCss);
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
			if (window.frappe && frappe.show_alert) {
				frappe.show_alert({ message: __("Logging out..."), indicator: "blue" });
			}
			setTimeout(function () {
				window.location.href = logoutUrl || "/?cmd=web_logout";
			}, 800);
		});

		const escHandler = function (e) {
			if (e.key === "Escape") {
				modal.classList.remove("active");
				document.removeEventListener("keydown", escHandler);
			}
		};
		document.addEventListener("keydown", escHandler);

		modal.classList.add("active");
	}

	function setupGlobalLogoutHandlers() {
		$(document).off("click.llplogout").on("click.llplogout", ".llp-logout-trigger, .llp-btn-logout, .llp-desk-logout-btn, a[href*='web_logout'], #toolbar-user a[href*='logout']", function (e) {
			e.preventDefault();
			e.stopPropagation();
			const targetUrl = $(this).attr("href") || "/?cmd=web_logout";
			showLogoutDialog(targetUrl);
		});

		// Global Delegated Hamburger Sidebar Toggle
		$(document).off("click.llphamburger").on("click.llphamburger", "#llp-top-hamburger, .llp-desk-hamburger-btn", function (e) {
			e.preventDefault();
			e.stopPropagation();
			toggleDeskSidebar();
		});

		// Close Mobile Drawer on Backdrop/Outside Click
		$(document).off("click.llpmobiledrawer").on("click.llpmobiledrawer", function (e) {
			if (window.innerWidth <= 768 && document.body.classList.contains("drawer-open")) {
				if (!$(e.target).closest(".desk-sidebar, .body-sidebar, .layout-side-section, #sidebar-offcanvas, .offcanvas, #llp-top-hamburger, .llp-desk-hamburger-btn").length) {
					document.body.classList.remove("drawer-open");
				}
			}
		});
	}

	function toggleDeskSidebar() {
		if (window.innerWidth <= 768) {
			document.body.classList.toggle("drawer-open");
		} else {
			const isCollapsed = document.body.classList.toggle("desk-sidebar-collapsed");
			document.body.classList.toggle("sidebar-collapsed", isCollapsed);

			// Persist state
			localStorage.setItem("llp_desk_sidebar_collapsed", isCollapsed ? "true" : "false");
		}
		$(document.body).trigger("toggleSidebar");
	}

	function initSidebarState() {
		if (window.innerWidth > 768) {
			const isCollapsed = localStorage.getItem("llp_desk_sidebar_collapsed") === "true";
			if (isCollapsed) {
				document.body.classList.add("desk-sidebar-collapsed", "sidebar-collapsed");
			} else {
				document.body.classList.remove("desk-sidebar-collapsed", "sidebar-collapsed");
			}
		}
	}

	function setupSidebarObserver() {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === "attributes" && mutation.attributeName === "class") {
					if (window.innerWidth > 768) {
						const shouldBeCollapsed = localStorage.getItem("llp_desk_sidebar_collapsed") === "true";
						const isCurrentlyCollapsed = document.body.classList.contains("desk-sidebar-collapsed");

						if (shouldBeCollapsed && !isCurrentlyCollapsed) {
							// Router stripped it, re-apply instantly
							document.body.classList.add("desk-sidebar-collapsed", "sidebar-collapsed");
						} else if (!shouldBeCollapsed && isCurrentlyCollapsed) {
							// Router forced it collapsed when it shouldn't be
							document.body.classList.remove("desk-sidebar-collapsed", "sidebar-collapsed");
						}
					}
				}
			});
		});

		observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
	}

	const FA_WORKSPACE_ICON_MAP = {
		"home": "fa-solid fa-house",
		"accounting": "fa-solid fa-calculator",
		"account": "fa-solid fa-calculator",
		"finance": "fa-solid fa-file-invoice-dollar",
		"buying": "fa-solid fa-cart-shopping",
		"purchase": "fa-solid fa-cart-shopping",
		"selling": "fa-solid fa-tags",
		"sales": "fa-solid fa-tags",
		"stock": "fa-solid fa-boxes-stacked",
		"inventory": "fa-solid fa-boxes-stacked",
		"assets": "fa-solid fa-building-user",
		"asset": "fa-solid fa-building-user",
		"manufacturing": "fa-solid fa-industry",
		"quality": "fa-solid fa-circle-check",
		"projects": "fa-solid fa-diagram-project",
		"project": "fa-solid fa-diagram-project",
		"support": "fa-solid fa-headset",
		"users": "fa-solid fa-users",
		"user": "fa-solid fa-users",
		"website": "fa-solid fa-globe",
		"web": "fa-solid fa-globe",
		"crm": "fa-solid fa-user-tie",
		"customer": "fa-solid fa-user-tie",
		"tools": "fa-solid fa-wrench",
		"tool": "fa-solid fa-wrench",
		"build": "fa-solid fa-hammer",
		"customization": "fa-solid fa-sliders",
		"custom": "fa-solid fa-sliders",
		"integrations": "fa-solid fa-network-wired",
		"settings": "fa-solid fa-gear",
		"setup": "fa-solid fa-gear",
		"payroll": "fa-solid fa-money-check-dollar",
		"hr": "fa-solid fa-user-group",
		"human": "fa-solid fa-user-group",
		"loan": "fa-solid fa-hand-holding-dollar",
		"retail": "fa-solid fa-shop"
	};

	function replaceDeskSidebarIcons() {
		// Target only specific individual desk sidebar item containers
		$(".desk-sidebar .sidebar-item-container").each(function () {
			const $container = $(this);
			const itemName = ($container.attr("item-name") || "").trim().toLowerCase();
			const $deskItem = $container.find("> .desk-sidebar-item, > .standard-sidebar-item, > a").first();
			const $targetItem = $deskItem.length ? $deskItem : $container;

			const $iconContainer = $targetItem.find(".sidebar-item-icon").first();
			const labelText = ($targetItem.find(".sidebar-item-label").first().text() || itemName).trim().toLowerCase();
			const iconAttr = ($iconContainer.attr("item-icon") || itemName || labelText).trim().toLowerCase();

			let matchedFa = "";
			for (let key in FA_WORKSPACE_ICON_MAP) {
				if (iconAttr === key || labelText === key || iconAttr.indexOf(key) !== -1 || labelText.indexOf(key) !== -1) {
					matchedFa = FA_WORKSPACE_ICON_MAP[key];
					break;
				}
			}

			if (!matchedFa) {
				matchedFa = "fa-solid fa-folder"; // Default clean FontAwesome folder icon
			}

			if ($iconContainer.length) {
				$iconContainer.find("svg, .indicator").hide();
				if ($iconContainer.find("i.fa-solid, i.fas, i.fa-regular").length) {
					$iconContainer.find("i.fa-solid, i.fas, i.fa-regular").attr("class", matchedFa);
				} else {
					$iconContainer.append(`<i class="${matchedFa}"></i>`);
				}
			}
		});

		// Also check any standalone sidebar items
		$(".desk-sidebar .sidebar-item, .body-sidebar .sidebar-item").not(".sidebar-item-container *").each(function () {
			const $item = $(this);
			if ($item.find(".sidebar-item-icon i.fa-solid").length) return;

			const labelText = ($item.find(".sidebar-item-label").first().text() || $item.attr("title") || $item.text() || "").trim().toLowerCase();
			let matchedFa = "";
			for (let key in FA_WORKSPACE_ICON_MAP) {
				if (labelText.indexOf(key) !== -1) {
					matchedFa = FA_WORKSPACE_ICON_MAP[key];
					break;
				}
			}
			if (!matchedFa) matchedFa = "fa-solid fa-folder";

			const $iconContainer = $item.find(".sidebar-item-icon").first();
			if ($iconContainer.length) {
				$iconContainer.find("svg, .indicator").hide();
				if ($iconContainer.find("i.fa-solid, i.fas, i.fa-regular").length) {
					$iconContainer.find("i.fa-solid, i.fas, i.fa-regular").attr("class", matchedFa);
				} else {
					$iconContainer.append(`<i class="${matchedFa}"></i>`);
				}
			}
		});

		// Replace standard sidebar (leaderboard/etc) SVGs with FontAwesome
		$(".standard-sidebar-item").each(function () {
			const $item = $(this);
			const labelText = ($item.find(".doctype-text").text() || $item.text() || "").trim().toLowerCase();
			let matchedFa = "fa-solid fa-folder"; // Default
			for (let key in FA_WORKSPACE_ICON_MAP) {
				if (labelText.indexOf(key) !== -1) {
					matchedFa = FA_WORKSPACE_ICON_MAP[key];
					break;
				}
			}

			// In standard sidebar, the icon is usually the first span containing an svg
			const $iconSpan = $item.find("span").first();
			if ($iconSpan.length && $iconSpan.find("svg").length) {
				$iconSpan.find("svg").hide();
				if ($iconSpan.find("i.fa-solid, i.fas, i.fa-regular").length) {
					$iconSpan.find("i.fa-solid, i.fas, i.fa-regular").attr("class", matchedFa);
				} else {
					$iconSpan.append(`<i class="${matchedFa}"></i>`);
				}
			}
		});

		// Replace Page Action icons (like "Change User", etc.)
		$(".page-actions .btn").each(function () {
			const $btn = $(this);
			const labelText = ($btn.attr("data-label") || $btn.text() || "").trim().toLowerCase();
			if (!labelText) return;

			let matchedFa = "";
			if (labelText.includes("change user")) {
				matchedFa = "fa-solid fa-users-gear";
			} else if (labelText.includes("actions")) {
				// The actions dropdown already has a chevron, but we can replace the main icon if it exists
				matchedFa = "fa-solid fa-caret-down";
			} else if (labelText.includes("menu")) {
				matchedFa = "fa-solid fa-ellipsis-vertical";
			}

			if (matchedFa) {
				const $svg = $btn.find("svg");
				if ($svg.length) {
					$svg.hide();
					if (!$btn.find("i.fa-solid").length) {
						$btn.prepend(`<i class="${matchedFa}" style="margin-right: 5px;"></i>`);
					}
				}
			}
		});
	}



	function hidePageHeadOnWorkspaces() {
		var $pageHead = $(".page-head");
		if (!$pageHead.length) return;

		// Always hide title text, title-area, sidebar toggle, page icon
		$pageHead.find(".title-text, .title-area, .sidebar-toggle-btn, .page-icon").hide();

		// Always collapse the .page-title column to 0 width
		$pageHead.find(".page-title").css({
			"width": "0",
			"min-width": "0",
			"max-width": "0",
			"flex": "0 0 0",
			"padding": "0",
			"margin": "0",
			"overflow": "hidden"
		});

		// Let page-actions fill full width
		$pageHead.find(".page-actions").css({
			"flex": "1 1 100%",
			"max-width": "100%"
		});

		// Check if any action buttons are actually visible inside page-actions
		var $actions = $pageHead.find(".page-actions");
		var hasVisibleButtons = false;
		if ($actions.length) {
			// Check for visible buttons: primary-action, btn-secondary, menu-btn-group, actions-btn-group
			$actions.find(".primary-action, .btn-secondary, .menu-btn-group, .actions-btn-group, .custom-actions").each(function () {
				if (!$(this).hasClass("hide") && $(this).is(":visible")) {
					hasVisibleButtons = true;
					return false; // break
				}
			});
		}

		// If NO visible action buttons, collapse page-head completely (workspace home)
		if (!hasVisibleButtons) {
			document.body.classList.add("llp-pagehead-empty");
		} else {
			document.body.classList.remove("llp-pagehead-empty");
		}
	}

	function moveNativeSidebarToggle() {
		const $navbar = $("header.navbar, .navbar.navbar-expand");
		if (!$navbar.length) return;

		const $logo = $navbar.find(".navbar-brand, .navbar-home");
		if (!$logo.length) return;

		// 1. Dual Icon Hamburger / Toggle Button (Swaps icon on hover & reliably toggles sidebar)
		let $toggleBtn = $("#llp-top-hamburger");
		if (!$toggleBtn.length) {
			const $nativeToggle = $(".sidebar-toggle-btn");
			if ($nativeToggle.length) {
				$toggleBtn = $nativeToggle.attr("id", "llp-top-hamburger").addClass("llp-moved-toggle llp-desk-hamburger-btn");
			} else {
				$toggleBtn = $(`
					<button type="button" id="llp-top-hamburger" class="llp-desk-hamburger-btn" title="Toggle Navigation" data-bs-toggle="offcanvas" href="#sidebar-offcanvas" aria-controls="sidebar-offcanvas">
						<span class="icon-hamburger"><i class="fa-solid fa-bars"></i></span>
						<span class="icon-toggler"><i class="fa-solid fa-angles-right"></i></span>
					</button>
				`);
			}
		}

		if ($toggleBtn.find(".icon-hamburger").length === 0) {
			$toggleBtn.html(`
				<span class="icon-hamburger"><i class="fa-solid fa-bars"></i></span>
				<span class="icon-toggler"><i class="fa-solid fa-angles-right"></i></span>
			`);
		}

		if (!$toggleBtn.parent().is($logo.parent()) || $toggleBtn.next()[0] !== $logo[0]) {
			$logo.before($toggleBtn);
		}

		$toggleBtn.css({
			"margin-right": "12px",
			"order": "1",
			"display": "inline-flex",
			"align-items": "center",
			"justify-content": "center"
		});

		// 2. Format Logo Badge & Pure White AMARAVATHI BRICKS text OUTSIDE the white logo badge box
		$logo.css({
			"order": "2",
			"background": "transparent",
			"box-shadow": "none",
			"padding": "0",
			"display": "inline-flex",
			"align-items": "center",
			"gap": "10px",
			"text-decoration": "none"
		});

		// Only text in navbar, remove the native image if present
		if (!$logo.find(".llp-desk-brand-text").length) {
			$logo.html(`
				<span class="llp-desk-brand-text" style="color: #FFFFFF; font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 800; letter-spacing: 0.5px;">AMARAVATHI BRICKS</span>
			`);
		}

		// Inject Large Logo into Desk Sidebar
		const $sidebar = $(".desk-sidebar");
		if ($sidebar.length && !$sidebar.find(".llp-sidebar-logo-container").length) {
			$sidebar.prepend(`
				<div class="llp-sidebar-logo-container" style="display: flex; justify-content: center; align-items: center; padding: 0px 0; margin-bottom: 5px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
						<img src="/assets/llp_ui/images/logo.png" alt="AMARAVATHI BRICKS Logo" class="llp-desk-logo-img" style="width: 150px !important; padding:5px 5px !important; border-radius:4px ;max-height: none !important; width: auto !important; display: block !important;background:#fff">
				</div>
			`);
		}

		// 3. Search Icon replacement directly INSIDE Awesomplete & Search Bar container
		const $searchBar = $navbar.find(".search-bar, .awesomplete");
		if ($searchBar.length) {
			$searchBar.css("position", "relative");
			const $nativeIcon = $searchBar.find(".search-icon");
			if ($nativeIcon.length) {
				$nativeIcon.html('<i class="fa-solid fa-magnifying-glass"></i>').show();
			} else if (!$searchBar.find(".llp-fa-search-icon").length) {
				$searchBar.prepend('<i class="fa-solid fa-magnifying-glass llp-fa-search-icon"></i>');
			}
		}

		// 4. Notifications icon replacement with FontAwesome Bell
		const $notifBtn = $navbar.find(".dropdown-notifications .notifications-icon, .notifications-icon");
		if ($notifBtn.length && !$notifBtn.find(".fa-bell").length) {
			$notifBtn.find("svg").hide();
			if (!$notifBtn.find(".llp-fa-bell").length) {
				$notifBtn.append(`<i class="fa-solid fa-bell llp-fa-bell"></i>`);
			}
		}

		// 5. Help dropdown arrow replacement with FontAwesome Chevron Down
		const $helpBtn = $navbar.find(".dropdown-help .nav-link, #toolbar-help").prev();
		if ($helpBtn.length && !$helpBtn.find(".fa-chevron-down").length) {
			$helpBtn.find("svg").hide();
			if (!$helpBtn.find(".llp-fa-chevron").length) {
				$helpBtn.append(`<i class="fa-solid fa-chevron-down llp-fa-chevron" style="margin-left: 4px;"></i>`);
			}
		}

		// 6. Ensure STRICTLY EXACTLY ONE Logout Button exists in top navbar controls
		const $existingLogoutBtns = $navbar.find(".llp-desk-logout-btn");
		if ($existingLogoutBtns.length > 1) {
			$existingLogoutBtns.slice(1).remove();
		} else if ($existingLogoutBtns.length === 0) {
			const $container = $navbar.find(".container").first();
			const $target = $container.length ? $container : $navbar;
			$target.append(`
				<a href="/?cmd=web_logout" class="llp-desk-logout-btn llp-logout-trigger" title="Logout" style="order: 99;">
					<i class="fa-solid fa-arrow-right-from-bracket"></i>
				</a>
			`);
		}

		// 7. Ensure Logout/Login is REMOVED from the desk sidebar
		$(".desk-sidebar .llp-sidebar-bottom, .desk-sidebar .llp-sidebar-logout-item, .desk-sidebar .llp-logout-trigger").remove();

		// 8. Replace SVG icons with FontAwesome icons in Desk Sidebar
		replaceDeskSidebarIcons();

		// 9. Hide the page-head (Home title bar) on workspace/desk pages
		hidePageHeadOnWorkspaces();

		// 10. Customize Page Actions (Move breadcrumbs and replace SVGs)
		customizePageActions();
	}

	function customizePageActions() {
		var $pageHead = $(".page-head");
		if (!$pageHead.length) return;
		var $pageActions = $pageHead.find(".page-actions");
		if (!$pageActions.length) return;

		var $breadcrumbs = $("#navbar-breadcrumbs, .navbar-breadcrumbs");
		if ($breadcrumbs.length) {
			$breadcrumbs.removeClass("d-none d-sm-flex hide hidden");
			if (!$pageActions.find("#navbar-breadcrumbs, .navbar-breadcrumbs").length) {
				$pageActions.prepend($breadcrumbs);
			}
		}

		// Replace SVGs with FontAwesome icons safely inside all buttons and dropdowns
		$pageActions.find("svg").each(function () {
			var $svg = $(this);
			var $use = $svg.find("use");
			if (!$use.length) return;

			var svgHref = ($use.attr("href") || $use.attr("xlink:href") || "").toLowerCase();
			if (!svgHref) return;

			if (svgHref.indexOf("refresh") !== -1 || svgHref.indexOf("reload") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-rotate"></i>');
			} else if (svgHref.indexOf("dot-horizontal") !== -1 || svgHref.indexOf("more") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-ellipsis-vertical"></i>');
			} else if (svgHref.indexOf("setting") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-gear"></i>');
			} else if (svgHref.indexOf("add") !== -1 || svgHref.indexOf("plus") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-plus"></i>');
			} else if (svgHref.indexOf("list") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-list"></i>');
			} else if (svgHref.indexOf("select") !== -1 || svgHref.indexOf("down") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-left: 5px;"></i>');
			} else if (svgHref.indexOf("filter") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-filter"></i>');
			} else if (svgHref.indexOf("report") !== -1 || svgHref.indexOf("small-file") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-file-lines"></i>');
			} else if (svgHref.indexOf("dashboard") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-gauge"></i>');
			} else if (svgHref.indexOf("kanban") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-table-columns"></i>');
			} else if (svgHref.indexOf("gantt") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-bars-staggered"></i>');
			} else if (svgHref.indexOf("calendar") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-calendar"></i>');
			} else if (svgHref.indexOf("image") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-image"></i>');
			} else if (svgHref.indexOf("tree") !== -1 || svgHref.indexOf("hierarchy") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-sitemap"></i>');
			} else if (svgHref.indexOf("previous") !== -1 || svgHref.indexOf("prev") !== -1 || svgHref.indexOf("left") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-chevron-left"></i>');
			} else if (svgHref.indexOf("next") !== -1 || svgHref.indexOf("right") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-chevron-right"></i>');
			} else if (svgHref.indexOf("print") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-print"></i>');
			} else if (svgHref.indexOf("expand") !== -1 || svgHref.indexOf("full") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-expand"></i>');
			} else if (svgHref.indexOf("collapse") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-compress"></i>');
			} else if (svgHref.indexOf("attach") !== -1 || svgHref.indexOf("paperclip") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-paperclip"></i>');
			} else if (svgHref.indexOf("share") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-share-nodes"></i>');
			} else if (svgHref.indexOf("link") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-link"></i>');
			} else if (svgHref.indexOf("bookmark") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-bookmark"></i>');
			} else if (svgHref.indexOf("edit") !== -1 || svgHref.indexOf("pen") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-pen"></i>');
			} else if (svgHref.indexOf("delete") !== -1 || svgHref.indexOf("trash") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-trash"></i>');
			} else if (svgHref.indexOf("copy") !== -1 || svgHref.indexOf("duplicate") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-copy"></i>');
			} else if (svgHref.indexOf("form") !== -1 || svgHref.indexOf("document") !== -1 || svgHref.indexOf("file") !== -1) {
				$svg.replaceWith('<i class="fa-solid fa-file"></i>');
			}
		});
	}

	function formatWebNavbar() {
		var $webNav = $(".navbar.navbar-light");
		if (!$webNav.length) return;

		// 1. Replace the "Home" text with the Amaravathi Bricks logo
		var $brand = $webNav.find(".navbar-brand");
		if ($brand.length && !$brand.find(".llp-web-logo-img").length) {
			$brand.empty().append(`
				<div class="llp-nav-logo-badge">
					<img src="/assets/llp_ui/images/logo.png" alt="AMARAVATHI BRICKS Logo" class="llp-web-logo-img" style="height: 36px !important; width: auto !important; display: block !important;">
				</div>
			`);
		}

		// 2. Ensure Avatar is squared off and consistent size (handled partially in CSS, but let's make sure class exists)
		var $avatarFrame = $webNav.find(".avatar-frame");
		if ($avatarFrame.length && !$avatarFrame.closest('.llp-web-avatar').length) {
			$avatarFrame.addClass("llp-web-avatar");
		}

		// 3. Replace Footer Powered By
		var $footerPowered = $(".web-footer .footer-powered");
		if ($footerPowered.length && $footerPowered.text().indexOf("Hippoclouds") === -1) {
			$footerPowered.html('Powered by <a class="text-muted" href="http://www.hippoclouds.com" target="_blank">Hippoclouds</a>');
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", function () {
			initSidebarState();
			setupSidebarObserver();
			moveNativeSidebarToggle();
			formatWebNavbar();
			setupGlobalLogoutHandlers();
		});
	} else {
		initSidebarState();
		setupSidebarObserver();
		moveNativeSidebarToggle();
		formatWebNavbar();
		setupGlobalLogoutHandlers();
	}

	if (window.jQuery) {
		jQuery(document).on("toolbar_setup page-change", function() {
			moveNativeSidebarToggle();
			formatWebNavbar();
		});
	}
	setInterval(function() {
		moveNativeSidebarToggle();
		formatWebNavbar();
	}, 500);
})();

