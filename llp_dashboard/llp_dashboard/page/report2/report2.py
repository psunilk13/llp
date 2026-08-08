import frappe
import json

@frappe.whitelist()
def get_all_brick_report_data(filters=None):
    """
    Fetches main brick production data along with its two child tables.
    Guarantees strict parent-date alignment and item-group filtering across tables.
    """
    if isinstance(filters, str):
        filters = json.loads(filters)
    
    filters = filters or {}
    date_val = filters.get("date")
    item_groups = filters.get("item_groups", [])

    # Fetch valid brick item groups if none are selected by the user
    if item_groups and len(item_groups) > 0:
        target_groups = tuple(item_groups)
    else:
        target_groups = tuple(get_item_groups())

    # Base conditions for main production table
    prod_conditions = []
    prod_params = {}

    if date_val:
        prod_conditions.append("bp.date = %(date)s")
        prod_params["date"] = date_val

    # Filter parent Production records matching allowed/selected item groups
    if target_groups:
        prod_conditions.append("""
            (
                bp.name IN (
                    SELECT DISTINCT parent FROM `tabBricks` b
                    JOIN `tabItem` i ON b.item_code = i.name
                    WHERE i.item_group IN %(target_groups)s
                )
                OR
                bp.name IN (
                    SELECT DISTINCT parent FROM `tabCutting Sizes` cs
                    JOIN `tabItem` i ON cs.brick_size = i.name
                    WHERE i.item_group IN %(target_groups)s
                )
                OR
                bp.name IN (
                    SELECT DISTINCT bp_inner.name FROM `tabBrick Production` bp_inner
                    JOIN `tabItem` i ON bp_inner.brick_size = i.name
                    WHERE i.item_group IN %(target_groups)s
                )
            )
        """)
        prod_params["target_groups"] = target_groups

    prod_where_clause = "WHERE " + " AND ".join(prod_conditions) if prod_conditions else ""

    production_query = f"""
        SELECT 
            bp.name,
            bp.date, 
            bp.warehouse, 
            bp.batch_quantity, 
            bp.no_of_batches, 
            bp.damage, 
            bp.produced_bricks, 
            bp.leakage_box,
            bp.cubic_meters,
            bp.plates 
        FROM `tabBrick Production` bp
        {prod_where_clause}
    """
    
    production_data = frappe.db.sql(production_query, prod_params, as_dict=True)
    parent_names = [p["name"] for p in production_data]

    # Fetch child records strictly tied to PARENT DATE
    if parent_names and target_groups:
        child_params = {
            "parent_names": tuple(parent_names),
            "target_groups": target_groups
        }

        # Cutting Sizes conditions (Enforces item group matching)
        cs_conditions = ["cs.parent IN %(parent_names)s", "i.item_group IN %(target_groups)s"]
        
        # Raw Details conditions (Removes item group restriction so raw materials/components aren't dropped)
        b_conditions = ["b.parent IN %(parent_names)s"]

        if date_val:
            cs_conditions.append("bp.date = %(date)s")
            b_conditions.append("bp.date = %(date)s")
            child_params["date"] = date_val

        # 1. Cutting Sizes Query
        cs_where = "WHERE " + " AND ".join(cs_conditions)
        cutting_sizes_query = f"""
            SELECT 
                cs.parent, 
                cs.brick_size, 
                cs.no_of_produced_bricks, 
                cs.damage 
            FROM `tabCutting Sizes` cs
            INNER JOIN `tabBrick Production` bp ON cs.parent = bp.name
            INNER JOIN `tabItem` i ON cs.brick_size = i.name
            {cs_where}
        """

        # 2. Raw Details Query (No item group filter on tabBricks items)
        b_where = "WHERE " + " AND ".join(b_conditions)
        bricks_query = f"""
            SELECT 
                b.parent, 
                b.item_code, 
                b.uom, 
                b.quantity 
            FROM `tabBricks` b
            INNER JOIN `tabBrick Production` bp ON b.parent = bp.name
            {b_where}
        """
        
        cutting_sizes_data = frappe.db.sql(cutting_sizes_query, child_params, as_dict=True)
        bricks_data = frappe.db.sql(bricks_query, child_params, as_dict=True)
    else:
        cutting_sizes_data = []
        bricks_data = []

    return {
        "production": production_data,
        "cutting_sizes": cutting_sizes_data,
        "bricks": bricks_data
    }


@frappe.whitelist()
def get_item_groups():
    """
    Fetches list of item groups where custom_is_brick_group is 1.
    """
    groups = frappe.get_all(
        "Item Group", 
        filters={"custom_is_brick_group": 1}, 
        fields=["name"], 
        order_by="name asc"
    )
    return [g["name"] for g in groups]