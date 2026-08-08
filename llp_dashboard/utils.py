import os
import json
import frappe

def create_page_files(doc, method=None, app_name: str = "llp_dashboard") -> str | None:
    """
    Safely creates a dashboard page directory along with its standard 
    JSON, JS, and Python controller files if they do not already exist.
    Only processes pages that belong to the 'LLP Dashboard' module.
    """
    try:
        # Only process pages belonging to this app's module
        if hasattr(doc, "module") and doc.module != "LLP Dashboard":
            return None

        # Extract the name from the document object or fallback if a string was passed directly
        if hasattr(doc, "name"):
            raw_name = doc.page_name or doc.name
        else:
            raw_name = str(doc)

        # Normalize page name to lowercase and snake_case
        formatted_page_name = raw_name.lower().strip().replace(" ", "_")
        readable_title = formatted_page_name.replace("_", " ").title()
        
        # Get the absolute path to the specified Frappe app
        app_path = frappe.get_app_path(app_name)

        # Construct target directory path
        # app_path already points to the inner app package (e.g. .../llp_dashboard/llp_dashboard)
        # Pages go under the module directory: <app_package>/<module>/page/<page_name>
        page_path = os.path.join(
            app_path,
            app_name,
            "page",
            formatted_page_name
        )

        # Create directory and any missing parent directories safely
        os.makedirs(page_path, exist_ok=True)

        # File paths
        json_file_path = os.path.join(page_path, f"{formatted_page_name}.json")
        js_file_path = os.path.join(page_path, f"{formatted_page_name}.js")
        py_file_path = os.path.join(page_path, f"{formatted_page_name}.py")

        # 1. Create JSON File (Page Metadata)
        if not os.path.exists(json_file_path):
            page_json_data = {
                "creation": frappe.utils.now(),
                "docstatus": 0,
                "doctype": "Page",
                "idx": 0,
                "modified": frappe.utils.now(),
                "modified_by": "Administrator",
                "module": "LLP Dashboard",
                "name": formatted_page_name,
                "owner": "Administrator",
                "page_name": readable_title,
                "roles": [{"role": "System Manager"}]
            }
            with open(json_file_path, "w", encoding="utf-8") as f:
                json.dump(page_json_data, f, indent=4)

        # 2. Create JS File (Client Script)
        if not os.path.exists(js_file_path):
            js_content = f"""frappe.pages['{formatted_page_name}'].on_page_load = function(wrapper) {{
    var page = frappe.ui.make_app_page({{
        parent: wrapper,
        title: '{readable_title}',
        single_column: true
    }});
    
    // Page initialization code goes here
}};
"""
            with open(js_file_path, "w", encoding="utf-8") as f:
                f.write(js_content)

        # 3. Create Python File (Server Controller)
        if not os.path.exists(py_file_path):
            py_content = f"""# Auto-generated controller for {readable_title}

import frappe

def get_context(context):
    context.title = "{readable_title}"
"""
            with open(py_file_path, "w", encoding="utf-8") as f:
                f.write(py_content)

        frappe.logger().info(f"Successfully generated page bundle files for: {formatted_page_name}")
        return page_path

    except Exception as e:
        frappe.log_error(
            title="Dashboard Page Bundle Generation Failed",
            message=f"Error while creating files for page '{doc}': {str(e)}"
        )
        raise