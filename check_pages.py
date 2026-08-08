import frappe

frappe.init(site=frappe.utils.get_sites()[0])
frappe.connect()

pages = frappe.get_all('Page',
    filters={'module': ['in', ['Dashboard', 'LLP Dashboard']]},
    fields=['name', 'module', 'page_name']
)

print("=== Pages in database ===")
for p in pages:
    print(f"  name={p.name}, module={p.module}, page_name={p.page_name}")

if not pages:
    print("No pages found with module Dashboard or LLP Dashboard")

# Also check all modules
print("\n=== All registered modules ===")
installed = frappe.get_all('Module Def', fields=['name'], order_by='name')
for m in installed:
    print(f"  {m.name}")

frappe.destroy()
