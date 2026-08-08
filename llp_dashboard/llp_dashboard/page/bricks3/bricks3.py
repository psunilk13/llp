import frappe

@frappe.whitelist()
def get_brick_stock(item_groups=None, warehouses=None, items=None):
    if isinstance(item_groups, str):
        item_groups = frappe.parse_json(item_groups)
    if isinstance(warehouses, str):
        warehouses = frappe.parse_json(warehouses)
    if isinstance(items, str):
        items = frappe.parse_json(items)

    conditions = ["i.custom_is_brick = 1"]
    values = {}

    if item_groups and len(item_groups) > 0:
        conditions.append("i.item_group IN %(item_groups)s")
        values["item_groups"] = tuple(item_groups)

    if warehouses and len(warehouses) > 0:
        conditions.append("b.warehouse IN %(warehouses)s")
        values["warehouses"] = tuple(warehouses)

    if items and len(items) > 0:
        conditions.append("i.item_name IN %(items)s")
        values["items"] = tuple(items)

    where_clause = " AND ".join(conditions)

    return frappe.db.sql(
        f"""
        SELECT 
            i.item_name, 
            i.item_group, 
            b.warehouse, 
            b.actual_qty
        FROM `tabBin` b
        INNER JOIN `tabItem` i ON b.item_code = i.name
        WHERE {where_clause}
        """,
        values,
        as_dict=True,
    )

@frappe.whitelist()
def get_brick_filter_options(item_groups=None, warehouses=None, items=None):
    """Fetches dynamic filter options based on current selections to cross-filter dropdowns."""
    if isinstance(item_groups, str):
        item_groups = frappe.parse_json(item_groups)
    if isinstance(warehouses, str):
        warehouses = frappe.parse_json(warehouses)
    if isinstance(items, str):
        items = frappe.parse_json(items)

    # Base query over Bin and Item to find valid overlapping relations
    conditions = ["i.custom_is_brick = 1"]
    values = {}

    if item_groups and len(item_groups) > 0:
        conditions.append("i.item_group IN %(item_groups)s")
        values["item_groups"] = tuple(item_groups)

    if warehouses and len(warehouses) > 0:
        conditions.append("b.warehouse IN %(warehouses)s")
        values["warehouses"] = tuple(warehouses)

    if items and len(items) > 0:
        conditions.append("i.item_name IN %(items)s")
        values["items"] = tuple(items)

    where_clause = " AND ".join(conditions)

    # Fetch all matching rows to extract valid options dynamically
    data = frappe.db.sql(
        f"""
        SELECT DISTINCT 
            i.item_name, 
            i.item_group, 
            b.warehouse
        FROM `tabBin` b
        INNER JOIN `tabItem` i ON b.item_code = i.name
        WHERE {where_clause}
        """,
        values,
        as_dict=True,
    )

    # Always provide absolute full master list for item_groups so they never vanish completely
    all_item_groups = [d.item_group for d in frappe.get_all("Item", filters={"custom_is_brick": 1}, fields=["item_group"], distinct=True) if d.item_group]
    
    valid_warehouses = sorted(list(set([d.warehouse for d in data if d.warehouse])))
    valid_items = sorted(list(set([d.item_name for d in data if d.item_name])))

    return {
        "item_groups": sorted(all_item_groups),
        "items": valid_items,
        "warehouses": valid_warehouses
    }