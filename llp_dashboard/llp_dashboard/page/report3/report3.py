import frappe
import json

@frappe.whitelist()
def get_pivot_production_data(from_date=None, to_date=None, item_groups=None):
    date_condition = "1=1"
    query_filters = {}

    if from_date and to_date:
        date_condition = "date BETWEEN %(from_date)s AND %(to_date)s"
        query_filters["from_date"] = from_date
        query_filters["to_date"] = to_date

    if isinstance(item_groups, str):
        try:
            item_groups = json.loads(item_groups)
        except Exception:
            item_groups = [item_groups] if item_groups else []

    # 1. Fetch main Brick Production records
    productions = frappe.db.sql(f"""
        SELECT 
            name, 
            date, 
            no_of_batches, 
            cubic_meters, 
            no_of_boxes, 
            leakage_box, 
            plates
        FROM `tabBrick Production`
        WHERE {date_condition}
        ORDER BY name ASC
    """, query_filters, as_dict=True)

    if not productions:
        return []

    prod_names = [p["name"] for p in productions]

    # 2. Fetch Cutting Sizes child records along with Item Group information
    cutting_sizes = frappe.db.sql("""
        SELECT cs.parent, cs.brick_size, cs.no_of_produced_bricks, t.item_group, t.item_name 
        FROM `tabCutting Sizes` AS cs
        LEFT JOIN `tabItem` AS t ON cs.brick_size = t.name
        WHERE cs.parent IN %(prod_names)s
    """, {"prod_names": prod_names}, as_dict=True)

    # 3. Fetch Bricks child records including UOM
    bricks_items = frappe.db.sql("""
        SELECT b.parent, b.item_code, b.quantity, b.uom, t.item_group, t.item_name 
        FROM `tabBricks` AS b
        LEFT JOIN `tabItem` AS t ON b.item_code = t.name
        WHERE b.parent IN %(prod_names)s
    """, {"prod_names": prod_names}, as_dict=True)

    # Map items by parent
    item_map = {}
    for item in bricks_items:
        p = item["parent"]
        if p not in item_map:
            item_map[p] = []
        if item["item_code"]:
            item_map[p].append({
                "item_code": item["item_code"], 
                "quantity": item["quantity"],
                "uom": item.get("uom") or ""
            })

    # Map cutting sizes by parent
    cs_map = {}
    for cs in cutting_sizes:
        p = cs["parent"]
        if p not in cs_map:
            cs_map[p] = {}
        b_size = cs["brick_size"]
        b_qty = cs["no_of_produced_bricks"] or 0
        ig = cs["item_group"] or ""
        if b_size:
            if b_size not in cs_map[p]:
                cs_map[p][b_size] = {"qty": 0, "item_group": ig}
            cs_map[p][b_size]["qty"] += b_qty

    # Assemble final payload
    result = []
    for prod in productions:
        p_name = prod["name"]
        all_items = item_map.get(p_name, [])
        all_cutting_sizes = cs_map.get(p_name, {})

        if item_groups and len(item_groups) > 0:
            filtered_cutting_sizes = {
                b_size: data["qty"] 
                for b_size, data in all_cutting_sizes.items() 
                if data["item_group"] in item_groups or any(g.lower() in b_size.lower() for g in item_groups)
            }

            if not filtered_cutting_sizes:
                continue

            cutting_sizes_to_display = filtered_cutting_sizes
        else:
            cutting_sizes_to_display = {b_size: data["qty"] for b_size, data in all_cutting_sizes.items()}

        brick_sizes_list = [
            {"brick_size": b_size, "no_of_produced_bricks": qty} 
            for b_size, qty in cutting_sizes_to_display.items()
        ]

        result.append({
            "date": prod["date"],
            "name": p_name,
            "no_of_batches": prod["no_of_batches"],
            "cubic_meters": prod["cubic_meters"],
            "no_of_boxes": prod["no_of_boxes"],
            "leakage_box": prod["leakage_box"],
            "plates": prod["plates"],
            "brick_sizes": brick_sizes_list,
            "items": all_items
        })

    return result