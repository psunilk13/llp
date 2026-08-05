# Copyright (c) 2026, saikumar parla and Contributors
# License: MIT. See LICENSE

import frappe
from frappe import _
from frappe.www.login import get_context as get_base_context

no_cache = True

def get_context(context):
	# Import and inherit base Frappe login context
	context = get_base_context(context)
	
	# LLP Custom Login context overrides
	context["title"] = _("Login - BRICKMAN | Amaravathi Bricks Industries")
	context["app_title"] = _("BRICKMAN")
	context["brand_logo"] = "/assets/llp_ui/images/logo.png"
	context["no_header"] = 1
	context["no_breadcrumbs"] = 1
	context["no_sidebar"] = 1
	context["show_footer_on_login"] = 0
	
	return context
