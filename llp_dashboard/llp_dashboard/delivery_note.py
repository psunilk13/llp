# import frappe
# from erpnext.accounts.doctype.sales_invoice.sales_invoice import SalesInvoice

# class CustomSalesInvoice(SalesInvoice):
#     def autoname(self):
#         from frappe.utils import nowdate

#         date = nowdate()
#         year = int(date[0:4])
#         month = int(date[5:7])

#         # Indian Financial Year Logic (April to March)
#         if month >= 4:
#             start_year = str(year)[-2:]
#             end_year = str(year + 1)[-2:]
#         else:
#             start_year = str(year - 1)[-2:]
#             end_year = str(year)[-2:]

#         fy = f"{start_year}-{end_year}"

#         prefix = f"SAII/{fy}/"

#         # Query to fetch the last generated invoice number for the current FY
#         last = frappe.db.sql("""
#             SELECT name FROM `tabSales Invoice`
#             WHERE name LIKE %s
#             ORDER BY creation DESC
#             LIMIT 1
#         """, (f"{prefix}%",))

#         if last:
#             # Extract the last digits after the slash
#             last_no = int(last[0][0].split("/")[-1])
#             new_no = str(last_no + 1).zfill(4)
#         else:
#             new_no = "00001"

#         self.name = f"{prefix}{new_no}"


import frappe
from erpnext.accounts.doctype.sales_invoice.sales_invoice import SalesInvoice
from frappe.utils import nowdate


class CustomSalesInvoice(SalesInvoice):

    def autoname(self):
        # Temporary name for Draft Sales Invoice
        self.name = frappe.model.naming.make_autoname("DRAFT-SI-.#####")

    def on_submit(self):
        # First run standard Sales Invoice submit logic
        super().on_submit()

        # Generate final invoice number only after submit
        date = nowdate()

        year = int(date[0:4])
        month = int(date[5:7])

        # Indian Financial Year: April -> March
        if month >= 4:
            start_year = str(year)[-2:]
            end_year = str(year + 1)[-2:]
        else:
            start_year = str(year - 1)[-2:]
            end_year = str(year)[-2:]

        fy = f"{start_year}-{end_year}"

        prefix = f"SAII/{fy}/"

        # Get last submitted invoice for this FY
        last = frappe.db.sql("""
            SELECT name
            FROM `tabSales Invoice`
            WHERE name LIKE %s
            AND docstatus = 1
            ORDER BY CAST(SUBSTRING_INDEX(name, '/', -1) AS UNSIGNED) DESC
            LIMIT 1
        """, (f"{prefix}%",))

        if last:
            last_no = int(last[0][0].split("/")[-1])
            new_no = str(last_no + 1).zfill(5)
        else:
            new_no = "00001"

        new_name = f"{prefix}{new_no}"

        # Rename submitted Sales Invoice
        frappe.rename_doc(
            "Sales Invoice",
            self.name,
            new_name,
            force=True,
            merge=False
        )

        # Update current object name
        self.name = new_name
