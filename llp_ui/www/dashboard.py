# Copyright (c) 2026, saikumar parla and Contributors
# License: MIT. See LICENSE

import frappe
from frappe import _

no_cache = True

def get_context(context):
	context["title"] = _("ERP Dashboard - BRICKMAN | Amaravathi Bricks")
	context["user_fullname"] = frappe.utils.get_fullname(frappe.session.user) if frappe.session.user != "Guest" else "sateesh v"
	return context
