frappe.pages['report3'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Brick Production Pivot Summary',
        single_column: true
    });

    // Inject Modern SaaS UI Styles
    $('<style>').prop('type', 'text/css').html(`
        .page-content {
            padding: 20px;
            background-color: #f8fafc;
            min-height: calc(100vh - 100px);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Modern Filter Card */
        .custom-filter-container {
            display: flex;
            gap: 20px;
            align-items: flex-end;
            margin-bottom: 24px;
            flex-wrap: wrap;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid #e2e8f0;
            justify-content: space-between;
        }
        .filter-inputs-group {
            display: flex;
            gap: 20px;
            align-items: flex-end;
            flex-wrap: wrap;
        }
        .custom-filter-group {
            display: flex;
            flex-direction: column;
        }
        .custom-filter-group label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 6px;
            font-weight: 600;
        }
        .custom-date-input {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            color: #1e293b;
            width: 160px;
            transition: all 0.2s ease;
        }
        .custom-date-input:focus {
            border-color: #3b82f6;
            background: #fff;
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        /* Dropdown Styling */
        .custom-multiselect-dropdown {
            position: relative;
            display: inline-block;
        }
        .custom-dropdown-btn {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            min-width: 240px;
            text-align: left;
            color: #1e293b;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .custom-dropdown-btn:hover {
            background: #f1f5f9;
        }
        .custom-dropdown-content {
            display: none;
            position: absolute;
            background-color: #fff;
            min-width: 260px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            max-height: 260px;
            overflow-y: auto;
            top: calc(100% + 4px);
            left: 0;
        }
        .custom-dropdown-content label {
            display: flex;
            align-items: center;
            font-weight: normal;
            margin-bottom: 8px;
            cursor: pointer;
            color: #334155;
            font-size: 13px;
        }
        .custom-dropdown-content input {
            margin-right: 10px;
            accent-color: #3b82f6;
            width: 15px;
            height: 15px;
        }

        /* Excel Download Button */
        .btn-excel-download {
            background-color: #10b981;
            color: #fff;
            border: none;
            padding: 9px 18px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: background-color 0.2s ease;
        }
        .btn-excel-download:hover {
            background-color: #059669;
        }

        /* Modern Table Card */
        .table-card {
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid #e2e8f0;
            overflow: hidden;
        }
        #pivot-production-table {
            margin-bottom: 0;
            width: 100%;
            border-collapse: collapse;
        }
        #pivot-production-table th {
            background-color: #f1f5f9;
            color: #475569;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            font-weight: 600;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            text-align: center;
            vertical-align: middle;
        }
        #pivot-production-table td {
            padding: 12px 16px;
            color: #334155;
            font-size: 13px;
            vertical-align: middle;
            border-top: 1px solid #f1f5f9;
        }
        #pivot-production-table tbody tr:hover {
            background-color: #f8fafc;
        }
    `).appendTo('head');

    let today = frappe.datetime.get_today();
    let one_month_ago = frappe.datetime.add_months(today, -1);

    let html_content = `
        <div class="page-content">
            <div class="custom-filter-container">
                <div class="filter-inputs-group">
                    <div class="custom-filter-group">
                        <label>From Date</label>
                        <input type="date" id="custom-from-date" class="custom-date-input" value="${one_month_ago}">
                    </div>
                    
                    <div class="custom-filter-group">
                        <label>To Date</label>
                        <input type="date" id="custom-to-date" class="custom-date-input" value="${today}">
                    </div>

                    <div class="custom-filter-group">
                        <label>Item Group</label>
                        <div class="custom-multiselect-dropdown">
                            <button type="button" class="custom-dropdown-btn" id="item-group-dropdown-btn">Select Item Groups...</button>
                            <div class="custom-dropdown-content" id="item-group-dropdown-list">
                                <!-- Checkboxes populated dynamically -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="custom-filter-group" style="justify-content: flex-end;">
                    <button type="button" id="btn-download-excel" class="btn-excel-download">
                        <i class="fa fa-file-excel-o"></i> Export Excel
                    </button>
                </div>
            </div>
            
            <div class="table-card">
                <div style="overflow-x: auto;">
                    <table class="table table-hover" id="pivot-production-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>No Of Batches</th>
                                <th>Cubic Meters</th>
                                <th id="th-no-of-boxes">No Of Boxes</th>
                                <th id="th-leakage-box">Leakage Box</th>
                                <th id="th-plates">Plates</th>
                                <th>Brick Sizes & Produced Bricks</th>
                                <th>Items & Quantities</th>
                            </tr>
                        </thead>
                        <tbody id="pivot-table-body">
                            <!-- Populated dynamically via JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    $(html_content).appendTo(page.main);

    $('#item-group-dropdown-btn').on('click', function(e) {
        e.stopPropagation();
        $('#item-group-dropdown-list').toggle();
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.custom-multiselect-dropdown').length) {
            $('#item-group-dropdown-list').hide();
        }
    });

    $('#custom-from-date, #custom-to-date').on('change', function() {
        load_pivot_data();
    });

    $('#btn-download-excel').on('click', function() {
        download_table_as_excel();
    });

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Item Group",
            filters: { custom_is_brick_group: 1 },
            fields: ["name"],
            limit_page_length: 0
        },
        callback: function(res) {
            let list_container = $('#item-group-dropdown-list');
            list_container.empty();

            if (res.message && res.message.length > 0) {
                res.message.forEach(group => {
                    list_container.append(`
                        <label>
                            <input type="checkbox" value="${group.name}" class="item-group-checkbox"> ${group.name}
                        </label>
                    `);
                });

                $('.item-group-checkbox').on('change', function() {
                    update_dropdown_button_text();
                    adjust_columns_visibility();
                    load_pivot_data();
                });
            } else {
                list_container.append('<div class="text-muted" style="padding: 5px;">No brick item groups found.</div>');
            }
        }
    });

    load_pivot_data();
};

function update_dropdown_button_text() {
    let checked_boxes = $('.item-group-checkbox:checked');
    let btn = $('#item-group-dropdown-btn');
    if (checked_boxes.length === 0) {
        btn.text('Select Item Groups...');
    } else if (checked_boxes.length === 1) {
        btn.text(checked_boxes.val());
    } else {
        btn.text(checked_boxes.length + ' Item Groups Selected');
    }
}

function adjust_columns_visibility() {
    let selected_groups = [];
    $('.item-group-checkbox:checked').each(function() {
        selected_groups.push($(this).val().toLowerCase());
    });

    let total_checked = selected_groups.length;
    let has_aac = selected_groups.includes('aac blocks');
    let has_solid = selected_groups.includes('solid blocks');

    if (total_checked === 0) {
        // No filter set -> Default: Show all columns
        $('#th-no-of-boxes').show();
        $('#th-leakage-box').show();
        $('#th-plates').show();
        $('.col-no-of-boxes').show();
        $('.col-leakage-box').show();
        $('.col-plates').show();
        return;
    }

    // AAC columns visibility (No Of Boxes & Leakage Box)
    if (has_aac) {
        $('#th-no-of-boxes').show();
        $('#th-leakage-box').show();
        $('.col-no-of-boxes').show();
        $('.col-leakage-box').show();
    } else {
        $('#th-no-of-boxes').hide();
        $('#th-leakage-box').hide();
        $('.col-no-of-boxes').hide();
        $('.col-leakage-box').hide();
    }

    // Solid columns visibility (Plates)
    if (has_solid) {
        $('#th-plates').show();
        $('.col-plates').show();
    } else {
        $('#th-plates').hide();
        $('.col-plates').hide();
    }
}

function load_pivot_data() {
    let from_date_val = $('#custom-from-date').val();
    let to_date_val = $('#custom-to-date').val();
    
    let selected_item_groups = [];
    $('.item-group-checkbox:checked').each(function() {
        selected_item_groups.push($(this).val());
    });

    frappe.call({
        method: "llp_dashboard.llp_dashboard.page.report3.report3.get_pivot_production_data",
        args: {
            from_date: from_date_val,
            to_date: to_date_val,
            item_groups: selected_item_groups
        },
        callback: function(r) {
            if (r.message) {
                let tbody = $('#pivot-table-body');
                tbody.empty();

                if (r.message.length === 0) {
                    tbody.append(`<tr><td colspan="8" class="text-center text-muted" style="padding: 40px;">No records found for the selected filters.</td></tr>`);
                    return;
                }

                r.message.forEach(row => {
                    let brickSizesHtml = row.brick_sizes && row.brick_sizes.length > 0 
                        ? row.brick_sizes.map(b => `${b.brick_size}: ${b.no_of_produced_bricks}`).join('<br style="mso-data-placement:same-cell;">') 
                        : '-';

                    let itemsHtml = row.items && row.items.length > 0 
                        ? row.items.map(i => `${i.item_code}: ${i.quantity} ${i.uom ? i.uom : ''}`).join('<br style="mso-data-placement:same-cell;">') 
                        : '-';

                    let tr = `<tr>
                        <td style="text-align: center;">${row.date}</td>
                        <td style="text-align: center;">${row.no_of_batches}</td>
                        <td style="text-align: center;">${row.cubic_meters}</td>
                        <td style="text-align: center;" class="col-no-of-boxes">${row.no_of_boxes}</td>
                        <td style="text-align: center;" class="col-leakage-box">${row.leakage_box}</td>
                        <td style="text-align: center;" class="col-plates">${row.plates}</td>
                        <td style="white-space: pre-line;">${brickSizesHtml}</td>
                        <td style="white-space: pre-line;">${itemsHtml}</td>
                    </tr>`;
                    tbody.append(tr);
                });

                // Re-apply visibility based on current selections after data render
                adjust_columns_visibility();
            }
        }
    });
}

function download_table_as_excel() {
    let table = document.getElementById('pivot-production-table');
    if (!table) {
        frappe.msgprint(__('No data table found to export.'));
        return;
    }

    let html_content = table.outerHTML;
    
    let excel_template = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Brick Production Summary</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 0.5pt solid #cbd5e1; padding: 10px; text-align: left; font-family: Arial, sans-serif; font-size: 11pt; vertical-align: top; mso-data-placement: same-cell; }
                th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
            </style>
        </head>
        <body>
            <h3 style="font-family: Arial, sans-serif; color: #1e293b;">Brick Production Pivot Summary</h3>
            ${html_content}
        </body>
        </html>
    `;

    let blob = new Blob([excel_template], { type: 'application/vnd.ms-excel' });
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', 'Brick_Production_Summary_' + frappe.datetime.get_today() + '.xls');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}