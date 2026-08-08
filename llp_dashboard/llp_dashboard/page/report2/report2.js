frappe.pages['report2'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Brick Production Report',
        single_column: true
    });
    
    let todayStr = frappe.datetime.get_today();
    
    let $container = $(page.body).append(`
        <div class="report-container" style="padding: 10px; background-color: #f4f6f9; min-height: 100vh; overflow: hidden;">
            
            <!-- Filters Section Card -->
            <div class="panel panel-default" style="border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; margin-bottom: 12px; background: #ffffff;">
                <div class="panel-body" style="padding: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h5 style="margin: 0; font-weight: 600; color: #36414c; font-size: 14px;">Filters</h5>
                        <button class="btn btn-default btn-xs" id="reset-filters-btn" style="padding: 2px 8px; font-size: 11px; border-radius: 4px;">Reset</button>
                    </div>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6 form-group" style="margin-bottom: 8px;">
                            <label style="font-weight: 500; color: #515865; font-size: 11px;">Date</label>
                            <input type="date" class="form-control input-sm" id="filter-date" value="${todayStr}" style="border-radius: 4px; height: 30px;">
                        </div>
                        <div class="col-xs-12 col-sm-6 form-group" style="margin-bottom: 0px; position: relative;">
                            <label style="font-weight: 500; color: #515865; font-size: 11px;">Item Groups</label>
                            
                            <div class="dropdown" id="item-group-dropdown-container">
                                <button class="btn btn-default btn-sm dropdown-toggle" type="button" id="item-group-dropdown-btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" style="width: 100%; text-align: left; background: #fff; border: 1px solid #d1d8dd; border-radius: 4px; height: 30px; padding: 4px 10px; display: flex; justify-content: space-between; align-items: center;">
                                    <span id="item-group-btn-text" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #36414c; font-size: 12px;">All Item Groups</span>
                                    <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu" id="item-group-checkbox-list" style="width: 100%; max-height: 150px; overflow-y: auto; padding: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 4px;">
                                    <li style="padding: 4px 8px;" class="text-muted">Loading item groups...</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Layout Split -->
            <div class="row" style="margin-left: -5px; margin-right: -5px;">
                
                <!-- Left Side: Main Production Table Card -->
                <div class="col-xs-12 col-md-6" style="padding-left: 5px; padding-right: 5px;">
                    <div class="panel panel-default" style="border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; margin-bottom: 12px; background: #ffffff;">
                        <div class="panel-body" style="padding: 10px;">
                            <h5 style="margin-top: 0; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #36414c;">Production Details</h5>
                            <div style="width: 100%; overflow: hidden;">
                                <table class="table table-bordered table-striped" id="brick-report-table" style="margin-bottom: 0; font-size: 10px; table-layout: fixed; width: 100%;">
                                    <thead>
                                        <tr style="background-color: #fafbfc;">
                                            <th style="width: 25px; text-align: center; padding: 4px 2px;">#</th>
                                            <th style="padding: 4px 4px;">B.Qty</th>
                                            <th style="padding: 4px 4px;">Moulds</th>
                                            <th style="padding: 4px 4px;">Leakage</th>
                                            <th style="padding: 4px 4px;">Cubic</th>
                                            <th style="padding: 4px 4px;">Palattes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="6" class="text-center text-muted" style="padding: 6px;">Loading...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Side: Cutting Sizes Details stacked on top of Raw Details -->
                <div class="col-xs-12 col-md-6" style="padding-left: 5px; padding-right: 5px;">
                    
                    <!-- Cutting Sizes Child Table Card -->
                    <div class="panel panel-default" style="border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; margin-bottom: 10px; background: #ffffff;">
                        <div class="panel-body" style="padding: 10px;">
                            <h5 style="margin-top: 0; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #36414c;">Cutting Sizes Details</h5>
                            <div style="width: 100%; overflow: hidden;">
                                <table class="table table-bordered table-striped" id="cutting-sizes-table" style="margin-bottom: 0; font-size: 10px; table-layout: fixed; width: 100%;">
                                    <thead>
                                        <tr style="background-color: #fafbfc;">
                                            <th style="width: 24px; text-align: center; padding: 4px 2px;">#</th>
                                            <th style="padding: 4px 4px;">Brick Size</th>
                                            <th style="width: 50px; padding: 4px 4px;">Prod</th>
                                            <th style="width: 40px; padding: 4px 4px;">Dmg</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="4" class="text-center text-muted" style="padding: 6px;">Loading...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Raw Details Child Table Card -->
                    <div class="panel panel-default" style="border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; margin-bottom: 12px; background: #ffffff;">
                        <div class="panel-body" style="padding: 10px;">
                            <h5 style="margin-top: 0; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #36414c;">Raw Details</h5>
                            <div style="width: 100%; overflow: hidden;">
                                <table class="table table-bordered table-striped" id="bricks-child-table" style="margin-bottom: 0; font-size: 10px; table-layout: fixed; width: 100%;">
                                    <thead>
                                        <tr style="background-color: #fafbfc;">
                                            <th style="width: 24px; text-align: center; padding: 4px 2px;">#</th>
                                            <th style="padding: 4px 4px;">Item Code</th>
                                            <th style="width: 45px; padding: 4px 4px;">UOM</th>
                                            <th style="width: 40px; padding: 4px 4px;">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colspan="4" class="text-center text-muted" style="padding: 6px;">Loading...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    `);

    $('#item-group-checkbox-list').on('click', function(e) {
        e.stopPropagation();
    });

    frappe.call({
        method: "llp_dashboard.llp_dashboard.page.report2.report2.get_item_groups",
        callback: function(r) {
            let $list = $('#item-group-checkbox-list');
            $list.empty();
            if (r.message && r.message.length > 0) {
                r.message.forEach(group => {
                    $list.append(`
                        <li style="padding: 4px 6px;">
                            <label style="font-weight: normal; margin-bottom: 0; display: block; cursor: pointer; font-size: 11px;">
                                <input type="checkbox" class="item-group-checkbox" value="${group}" style="margin-right: 6px;"> ${group}
                            </label>
                        </li>
                    `);
                });
            } else {
                $list.html('<li style="padding: 4px 8px;" class="text-muted">No item groups found</li>');
            }
            loadReportData();
        }
    });

    function updateDropdownButtonText() {
        let selectedCount = $('.item-group-checkbox:checked').length;
        let $btnText = $('#item-group-btn-text');
        if (selectedCount === 0) {
            $btnText.text('All Item Groups');
        } else if (selectedCount === 1) {
            $btnText.text($('.item-group-checkbox:checked').first().val());
        } else {
            $btnText.text(`${selectedCount} Item Groups Selected`);
        }
    }

    function loadReportData() {
        let dateVal = $('#filter-date').val();
        let selectedGroups = [];
        $('.item-group-checkbox:checked').each(function() {
            selectedGroups.push($(this).val());
        });

        let filters = {
            date: dateVal || null,
            item_groups: selectedGroups
        };

        $('#brick-report-table tbody').html('<tr><td colspan="6" class="text-center text-muted" style="padding: 6px;">Loading...</td></tr>');
        $('#cutting-sizes-table tbody').html('<tr><td colspan="4" class="text-center text-muted" style="padding: 6px;">Loading...</td></tr>');
        $('#bricks-child-table tbody').html('<tr><td colspan="4" class="text-center text-muted" style="padding: 6px;">Loading...</td></tr>');

        frappe.call({
            method: "llp_dashboard.llp_dashboard.page.report2.report2.get_all_brick_report_data",
            args: { filters: filters },
            callback: function(response) {
                let data = response.message || {};

                // 1. Populate Production Details Table
                let $prodTbody = $('#brick-report-table tbody').empty();
                if (data.production && data.production.length > 0) {
                    data.production.forEach((row, index) => {
                        $prodTbody.append(`
                            <tr>
                                <td style="text-align: center; font-weight: 500; color: #8d99ae; padding: 4px 2px;">${index + 1}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.batch_quantity || 0}">${row.batch_quantity || 0}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.no_of_batches || 0}">${row.no_of_batches || 0}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.leakage_box || 0}">${row.leakage_box || 0}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.cubic_meters || 0}">${row.cubic_meters || 0}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.plates || 0}">${row.plates || 0}</td>
                            </tr>
                        `);
                    });
                } else {
                    $prodTbody.append(`<tr><td colspan="6" class="text-center text-muted" style="padding: 6px;">No records found</td></tr>`);
                }

                // 2. Populate Cutting Sizes Table
                let $cuttingTbody = $('#cutting-sizes-table tbody').empty();
                if (data.cutting_sizes && data.cutting_sizes.length > 0) {
                    data.cutting_sizes.forEach((row, index) => {
                        $cuttingTbody.append(`
                            <tr>
                                <td style="text-align: center; font-weight: 500; color: #8d99ae; padding: 4px 4px;">${index + 1}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.brick_size || ''}">${row.brick_size || ''}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.no_of_produced_bricks || 0}">${row.no_of_produced_bricks || 0}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.damage || 0}">${row.damage || 0}</td>
                            </tr>
                        `);
                    });
                } else {
                    $cuttingTbody.append(`<tr><td colspan="4" class="text-center text-muted" style="padding: 6px;">No records found</td></tr>`);
                }

                // 3. Populate Raw Details Table
                let $bricksTbody = $('#bricks-child-table tbody').empty();
                if (data.bricks && data.bricks.length > 0) {
                    data.bricks.forEach((row, index) => {
                        $bricksTbody.append(`
                            <tr>
                                <td style="text-align: center; font-weight: 500; color: #8d99ae; padding: 4px 4px;">${index + 1}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.item_code || ''}">${row.item_code || ''}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.uom || ''}">${row.uom || ''}</td>
                                <td style="padding: 4px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.quantity || 0}">${row.quantity || 0}</td>
                            </tr>
                        `);
                    });
                } else {
                    $bricksTbody.append(`<tr><td colspan="4" class="text-center text-muted" style="padding: 6px;">No records found</td></tr>`);
                }
            }
        });
    }

    $('#filter-date').on('change', function() {
        loadReportData();
    });

    $(document).on('change', '.item-group-checkbox', function() {
        updateDropdownButtonText();
        loadReportData();
    });

    $('#reset-filters-btn').on('click', function() {
        $('#filter-date').val(todayStr);
        $('.item-group-checkbox').prop('checked', false);
        updateDropdownButtonText();
        loadReportData();
    });
};