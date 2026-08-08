frappe.pages['report3'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Brick Production Pivot Summary',
        single_column: true
    });

    // Inject CSS for custom filters, dropdown, table layout, and download button
    $('<style>').prop('type', 'text/css').html(`
        .page-content {
            padding: 15px;
        }
        #pivot-production-table th {
            background-color: #f4f5f7;
            text-align: center;
            vertical-align: middle;
        }
        .sub-item-badge {
            display: inline-block;
            background: #e2e8f0;
            padding: 3px 8px;
            margin: 2px;
            border-radius: 4px;
            font-size: 12px;
        }
        .custom-filter-container {
            display: flex;
            gap: 15px;
            align-items: flex-end;
            margin-bottom: 20px;
            flex-wrap: wrap;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #d1d8dd;
            justify-content: space-between;
        }
        .filter-inputs-group {
            display: flex;
            gap: 15px;
            align-items: flex-end;
            flex-wrap: wrap;
        }
        .custom-filter-group {
            display: flex;
            flex-direction: column;
        }
        .custom-filter-group label {
            font-size: 12px;
            color: #515862;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .custom-date-input {
            background: #fff;
            border: 1px solid #d1d8dd;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 13px;
            color: #36414c;
            width: 160px;
        }
        .custom-multiselect-dropdown {
            position: relative;
            display: inline-block;
        }
        .custom-dropdown-btn {
            background: #fff;
            border: 1px solid #d1d8dd;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            min-width: 220px;
            text-align: left;
            color: #36414c;
        }
        .custom-dropdown-content {
            display: none;
            position: absolute;
            background-color: #fff;
            min-width: 250px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.15);
            z-index: 1000;
            padding: 12px;
            border-radius: 4px;
            border: 1px solid #d1d8dd;
            max-height: 250px;
            overflow-y: auto;
            top: 100%;
            left: 0;
            margin-top: 2px;
        }
        .custom-dropdown-content label {
            display: block;
            font-weight: normal;
            margin-bottom: 8px;
            cursor: pointer;
        }
        .custom-dropdown-content input {
            margin-right: 8px;
        }
        .btn-excel-download {
            background-color: #28a745;
            color: #fff;
            border: 1px solid #218838;
            padding: 6px 15px;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .btn-excel-download:hover {
            background-color: #218838;
            color: #fff;
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
                        <i class="fa fa-file-excel-o"></i> Download Excel
                    </button>
                </div>
            </div>
            
            <div class="panel panel-default">
                <div class="panel-body" style="overflow-x: auto;">
                    <table class="table table-bordered table-hover" id="pivot-production-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Production ID</th>
                                <th>Batch Qty</th>
                                <th>Leakage Box</th>
                                <th>No Of Batches</th>
                                <th>Cubic Meters</th>
                                <th>Plates</th>
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
                    tbody.append(`<tr><td colspan="9" class="text-center text-muted">No records found for the selected filters.</td></tr>`);
                    return;
                }

                r.message.forEach(row => {
                    let brickSizesHtml = row.brick_sizes && row.brick_sizes.length > 0 
                        ? row.brick_sizes.map(b => `${b.brick_size}: ${b.no_of_produced_bricks}`).join('<br style="mso-data-placement:same-cell;">') 
                        : '-';

                    let itemsHtml = row.items && row.items.length > 0 
                        ? row.items.map(i => `${i.item_code}: ${i.quantity}`).join('<br style="mso-data-placement:same-cell;">') 
                        : '-';

                    let tr = `<tr>
                        <td>${row.date}</td>
                        <td><b>${row.name}</b></td>
                        <td>${row.batch_quantity}</td>
                        <td>${row.leakage_box}</td>
                        <td>${row.no_of_batches}</td>
                        <td>${row.cubic_meters}</td>
                        <td>${row.plates}</td>
                        <td style="white-space: pre-line;">${brickSizesHtml}</td>
                        <td style="white-space: pre-line;">${itemsHtml}</td>
                    </tr>`;
                    tbody.append(tr);
                });
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
                th, td { border: 0.5pt solid #d1d8dd; padding: 8px; text-align: left; font-family: Arial, sans-serif; font-size: 11pt; vertical-align: top; mso-data-placement: same-cell; }
                th { background-color: #f4f5f7; font-weight: bold; text-align: center; }
            </style>
        </head>
        <body>
            <h3>Brick Production Pivot Summary</h3>
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