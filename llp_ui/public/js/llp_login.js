/* ==========================================================================
   LLP - BRICKMAN Interactive Login & Password Reset Controller
   ========================================================================== */

(function () {
	console.log("[LLP UI] Login controller script loaded");

	function initLLPLogin() {
		const loginSection = document.getElementById("login-section");
		const forgotSection = document.getElementById("forgot-section");
		const btnShowForgot = document.getElementById("btn-show-forgot");
		const btnBackLogin = document.getElementById("btn-back-login");
		
		const formLogin = document.querySelector(".form-signin");
		const formForgot = document.querySelector(".form-forgot");
		
		const btnLoginSubmit = document.getElementById("btn-login-submit") || document.querySelector(".btn-login");
		const btnForgotSubmit = document.getElementById("btn-forgot-submit") || document.querySelector(".btn-forgot");
		
		const togglePasswordBtn = document.querySelector(".btn-toggle-password") || document.querySelector(".btn-toggle-eye");
		const passwordInput = document.getElementById("login_password");

		// Switch Views (Login <-> Forgot Password)
		function showSection(sectionName) {
			if (sectionName === "forgot") {
				if (loginSection) {
					loginSection.classList.remove("active");
					loginSection.style.display = "none";
				}
				if (forgotSection) {
					forgotSection.style.display = "block";
					setTimeout(() => forgotSection.classList.add("active"), 10);
				}
				window.location.hash = "forgot";
			} else {
				if (forgotSection) {
					forgotSection.classList.remove("active");
					forgotSection.style.display = "none";
				}
				if (loginSection) {
					loginSection.style.display = "block";
					setTimeout(() => loginSection.classList.add("active"), 10);
				}
				window.location.hash = "login";
			}
		}

		if (btnShowForgot) {
			btnShowForgot.addEventListener("click", function (e) {
				e.preventDefault();
				showSection("forgot");
			});
		}

		if (btnBackLogin) {
			btnBackLogin.addEventListener("click", function (e) {
				e.preventDefault();
				showSection("login");
			});
		}

		if (window.location.hash === "#forgot") {
			showSection("forgot");
		}

		// Password Eye Toggle
		if (togglePasswordBtn && passwordInput) {
			togglePasswordBtn.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				const isPassword = passwordInput.getAttribute("type") === "password";
				passwordInput.setAttribute("type", isPassword ? "text" : "password");
				
				const icon = togglePasswordBtn.querySelector("i");
				if (icon) {
					if (isPassword) {
						icon.className = "fa-solid fa-eye-slash";
					} else {
						icon.className = "fa-solid fa-eye";
					}
				}
			});
		}

		// Display Alert Message
		function showAlert(containerSelector, message, type) {
			const container = document.querySelector(containerSelector);
			if (!container) return;

			const alertType = type || "danger";
			const iconClass = alertType === "success" ? "fa-circle-check" : "fa-triangle-exclamation";
			const alertHtml = `
				<div class="llp-alert llp-alert-${alertType}" style="margin: 8px 0; padding: 8px 12px; border-radius: 8px; font-size: 0.84rem; display: flex; align-items: center; gap: 8px; ${alertType === 'success' ? 'background: #F0FDF4; border: 1px solid #86EFAC; color: #166534;' : 'background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B;'}">
					<i class="fa-solid ${iconClass}"></i>
					<span>${message}</span>
				</div>
			`;
			container.innerHTML = alertHtml;
		}

		function clearAlerts() {
			document.querySelectorAll(".llp-alert-container, .llp-forgot-alert-container").forEach(el => el.innerHTML = "");
		}

		// AUTHENTICATION LOGIN FUNCTION
		function handleLogin(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			console.log("[LLP UI] Login button clicked");
			clearAlerts();

			const emailEl = document.getElementById("login_email");
			const email = emailEl ? emailEl.value.trim() : "";
			const password = passwordInput ? passwordInput.value : "";
			const btn = btnLoginSubmit || document.querySelector(".btn-login");

			if (!email || !password) {
				showAlert(".llp-alert-container", "Please enter both email and password.");
				return false;
			}

			const originalBtnHtml = btn ? btn.innerHTML : "Sign in";
			if (btn) {
				btn.disabled = true;
				btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin btn-spinner"></i>&nbsp;&nbsp; Authenticating...`;
			}

			const csrfToken = window.csrf_token || "";

			// Perform AJAX Request to /api/method/login
			jQuery.ajax({
				type: "POST",
				url: "/api/method/login",
				data: {
					usr: email,
					pwd: password
				},
				headers: {
					"X-Frappe-CSRF-Token": csrfToken
				},
				success: function (r) {
					console.log("[LLP UI] Login success response:", r);
					if (r.message === "Logged In" || r.message === "No App" || r.home_page || r.default_path) {
						showAlert(".llp-alert-container", "Login successful! Redirecting...", "success");
						setTimeout(function () {
							window.location.href = r.default_path || r.home_page || "/app";
						}, 300);
					} else {
						if (btn) {
							btn.disabled = false;
							btn.innerHTML = originalBtnHtml;
						}
						showAlert(".llp-alert-container", "Authentication returned an invalid response.");
					}
				},
				error: function (xhr) {
					console.error("[LLP UI] Login error response:", xhr);
					if (btn) {
						btn.disabled = false;
						btn.innerHTML = originalBtnHtml;
					}
					let errorMsg = "Invalid email or password. Please try again.";
					try {
						if (xhr.responseJSON && xhr.responseJSON._server_messages) {
							const msgArr = JSON.parse(xhr.responseJSON._server_messages);
							if (msgArr && msgArr.length > 0) {
								const parsedMsg = JSON.parse(msgArr[0]);
								errorMsg = parsedMsg.message || parsedMsg;
							}
						} else if (xhr.responseJSON && xhr.responseJSON.message) {
							errorMsg = xhr.responseJSON.message;
						}
					} catch (err) {}
					showAlert(".llp-alert-container", typeof errorMsg === 'string' ? errorMsg.replace(/<[^>]*>?/gm, '') : "Invalid email or password.");
				}
			});

			return false;
		}

		// Attach Login Listeners
		if (btnLoginSubmit) {
			btnLoginSubmit.addEventListener("click", handleLogin);
		}
		if (formLogin) {
			formLogin.addEventListener("submit", handleLogin);
		}

		// FORGOT PASSWORD FUNCTION
		function handleForgot(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			clearAlerts();

			const forgotEmailEl = document.getElementById("forgot_email");
			const forgotEmail = forgotEmailEl ? forgotEmailEl.value.trim() : "";
			const btn = btnForgotSubmit || document.querySelector(".btn-forgot");

			if (!forgotEmail) {
				showAlert(".llp-forgot-alert-container", "Please enter your email address.");
				return false;
			}

			const originalBtnHtml = btn ? btn.innerHTML : "Send reset link";
			if (btn) {
				btn.disabled = true;
				btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin btn-spinner"></i>&nbsp;&nbsp; Sending...`;
			}

			const csrfToken = window.csrf_token || "";

			jQuery.ajax({
				type: "POST",
				url: "/api/method/frappe.core.doctype.user.user.reset_password",
				data: { user: forgotEmail },
				headers: { "X-Frappe-CSRF-Token": csrfToken },
				success: function () {
					if (btn) {
						btn.disabled = false;
						btn.innerHTML = originalBtnHtml;
					}
					showAlert(".llp-forgot-alert-container", "Password reset instructions have been sent to your email.", "success");
				},
				error: function () {
					if (btn) {
						btn.disabled = false;
						btn.innerHTML = originalBtnHtml;
					}
					showAlert(".llp-forgot-alert-container", "Unable to send reset link. Please verify the email address.");
				}
			});

			return false;
		}

		if (btnForgotSubmit) {
			btnForgotSubmit.addEventListener("click", handleForgot);
		}
		if (formForgot) {
			formForgot.addEventListener("submit", handleForgot);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initLLPLogin);
	} else {
		initLLPLogin();
	}
})();
