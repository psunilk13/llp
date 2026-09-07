import frappe
from erpnext.accounts.doctype.sales_invoice.sales_invoice import SalesInvoice

class CustomSalesInvoice(SalesInvoice):
    def autoname(self):
        from frappe.utils import nowdate

        date = nowdate()
        year = int(date[0:4])
        month = int(date[5:7])

        # Indian Financial Year Logic (April to March)
        if month >= 4:
            start_year = str(year)[-2:]
            end_year = str(year + 1)[-2:]
        else:
            start_year = str(year - 1)[-2:]
            end_year = str(year)[-2:]

        fy = f"{start_year}-{end_year}"

        prefix = f"SAII/{fy}/"

        # Query to fetch the last generated invoice number for the current FY
        last = frappe.db.sql("""
            SELECT name FROM `tabSales Invoice`
            WHERE name LIKE %s
            ORDER BY creation DESC
            LIMIT 1
        """, (f"{prefix}%",))

        if last:
            # Extract the last digits after the slash
            last_no = int(last[0][0].split("/")[-1])
            new_no = str(last_no + 1).zfill(4)
        else:
            new_no = "00001"

        self.name = f"{prefix}{new_no}"
