frappe.pages['bricks3'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Brick Dashboard',
        single_column: true
    });
    
    let $container = $(page.body).append(`
        <div style="padding: 15px; background-color: var(--bg-color); min-height: 100vh;">
            
            <!-- Compact Filter Dropdowns Section -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <div class="dropdown-filter-wrapper position-relative">
                        <label class="font-weight-bold text-muted mb-1" style="font-size: 11px; text-transform: uppercase;">Item Group</label>
                        <div id="item-group-dropdown-btn" class="form-control d-flex justify-content-between align-items-center" style="cursor: pointer; background: var(--control-bg); height: 35px; font-size: 13px;">
                            <span class="selected-text text-truncate">All Item Groups</span>
                            <span class="caret"></span>
                        </div>
                        <div id="item-group-menu" class="card shadow border p-2 position-absolute w-100" style="display: none; z-index: 1050; max-height: 200px; overflow-y: auto; background: var(--card-bg);">
                            <div id="item-group-checkboxes">
                                <span class="text-muted small">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="dropdown-filter-wrapper position-relative">
                        <label class="font-weight-bold text-muted mb-1" style="font-size: 11px; text-transform: uppercase;">Warehouse</label>
                        <div id="warehouse-dropdown-btn" class="form-control d-flex justify-content-between align-items-center" style="cursor: pointer; background: var(--control-bg); height: 35px; font-size: 13px;">
                            <span class="selected-text text-truncate">All Warehouses</span>
                            <span class="caret"></span>
                        </div>
                        <div id="warehouse-menu" class="card shadow border p-2 position-absolute w-100" style="display: none; z-index: 1050; max-height: 200px; overflow-y: auto; background: var(--card-bg);">
                            <div id="warehouse-checkboxes">
                                <span class="text-muted small">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="dropdown-filter-wrapper position-relative">
                        <label class="font-weight-bold text-muted mb-1" style="font-size: 11px; text-transform: uppercase;">Item</label>
                        <div id="item-dropdown-btn" class="form-control d-flex justify-content-between align-items-center" style="cursor: pointer; background: var(--control-bg); height: 35px; font-size: 13px;">
                            <span class="selected-text text-truncate">All Items</span>
                            <span class="caret"></span>
                        </div>
                        <div id="item-menu" class="card shadow border p-2 position-absolute w-100" style="display: none; z-index: 1050; max-height: 200px; overflow-y: auto; background: var(--card-bg);">
                            <div id="item-checkboxes">
                                <span class="text-muted small">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-12 text-right">
                    <button id="reset-filters" class="btn btn-default btn-xs text-muted">Clear All Filters</button>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card p-3 shadow-sm border-0" style="background: var(--card-bg); border-radius: 8px;">
                        <div id="item-group-chart" style="width: 100%; height: 380px;"></div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card p-3 shadow-sm border-0" style="background: var(--card-bg); border-radius: 8px;">
                        <div id="brick-chart" style="width: 100%; height: 380px;"></div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="card p-3 shadow-sm border-0" style="background: var(--card-bg); border-radius: 8px;">
                        <div id="warehouse-chart" style="width: 100%; height: 400px;"></div>
                    </div>
                </div>
            </div>

        </div>
    `);

    // Toggle dropdown visibility and close others when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown-filter-wrapper').length) {
            $('.card.position-absolute').hide();
        }
    });

    $('#item-group-dropdown-btn').on('click', function(e) {
        e.stopPropagation();
        $('.card.position-absolute').not('#item-group-menu').hide();
        $('#item-group-menu').toggle();
    });

    $('#warehouse-dropdown-btn').on('click', function(e) {
        e.stopPropagation();
        $('.card.position-absolute').not('#warehouse-menu').hide();
        $('#warehouse-menu').toggle();
    });

    $('#item-dropdown-btn').on('click', function(e) {
        e.stopPropagation();
        $('.card.position-absolute').not('#item-menu').hide();
        $('#item-menu').toggle();
    });

    // Initial load: fetch options and initial stock data
    updateDashboard({});

    function updateDashboard(filters) {
        // 1. Update filter option checkboxes dynamically based on current selections
        frappe.call({
            method: "llp_dashboard.llp_dashboard.page.bricks3.bricks3.get_brick_filter_options",
            args: filters,
            callback: function(r) {
                if (r.message) {
                    populateCheckboxes(r.message);
                }
            }
        });

        // 2. Fetch stock data for the charts
        frappe.call({
            method: "llp_dashboard.llp_dashboard.page.bricks3.bricks3.get_brick_stock",
            args: filters,
            callback: function(r) {
                if (r.message) {
                    renderAllCharts(r.message);
                } else {
                    renderAllCharts([]);
                }
            }
        });
    }

    function populateCheckboxes(options) {
        let checkedGroups = $('.item-group-cb:checked').map(function() { return this.value; }).get();
        let checkedWarehouses = $('.warehouse-cb:checked').map(function() { return this.value; }).get();
        let checkedItems = $('.item-cb:checked').map(function() { return this.value; }).get();

        let cbStyle = "display: block; margin-bottom: 4px; font-size: 12px; cursor: pointer; font-weight: normal;";

        // Item Groups
        let $groupContainer = $('#item-group-checkboxes').empty();
        options.item_groups.forEach(g => {
            let isChecked = checkedGroups.includes(g) ? 'checked' : '';
            $groupContainer.append(`
                <label style="${cbStyle}" title="${g}">
                    <input type="checkbox" class="filter-checkbox item-group-cb" value="${g}" ${isChecked} style="margin-right: 5px;"> ${g}
                </label>
            `);
        });

        // Warehouses (grey out or disable if invalid under current filter combination)
        let $whContainer = $('#warehouse-checkboxes').empty();
        // To find all absolute master warehouses, we check options or let valid list handle active ones
        options.warehouses.forEach(w => {
            let isChecked = checkedWarehouses.includes(w) ? 'checked' : '';
            $whContainer.append(`
                <label style="${cbStyle}" title="${w}">
                    <input type="checkbox" class="filter-checkbox warehouse-cb" value="${w}" ${isChecked} style="margin-right: 5px;"> ${w}
                </label>
            `);
        });

        // Items
        let $itemContainer = $('#item-checkboxes').empty();
        options.items.forEach(i => {
            let isChecked = checkedItems.includes(i) ? 'checked' : '';
            $itemContainer.append(`
                <label style="${cbStyle}" title="${i}">
                    <input type="checkbox" class="filter-checkbox item-cb" value="${i}" ${isChecked} style="margin-right: 5px;"> ${i}
                </label>
            `);
        });

        updateDropdownLabels();
    }

    function updateDropdownLabels() {
        let selectedGroups = $('.item-group-cb:checked').map(function() { return this.value; }).get();
        let selectedWarehouses = $('.warehouse-cb:checked').map(function() { return this.value; }).get();
        let selectedItems = $('.item-cb:checked').map(function() { return this.value; }).get();

        $('#item-group-dropdown-btn .selected-text').text(
            selectedGroups.length === 0 ? 'All Item Groups' : `${selectedGroups.length} selected`
        );
        $('#warehouse-dropdown-btn .selected-text').text(
            selectedWarehouses.length === 0 ? 'All Warehouses' : `${selectedWarehouses.length} selected`
        );
        $('#item-dropdown-btn .selected-text').text(
            selectedItems.length === 0 ? 'All Items' : `${selectedItems.length} selected`
        );
    }

    $(document).on('change', '.filter-checkbox', function() {
        updateDropdownLabels();

        let selectedGroups = $('.item-group-cb:checked').map(function() { return this.value; }).get();
        let selectedWarehouses = $('.warehouse-cb:checked').map(function() { return this.value; }).get();
        let selectedItems = $('.item-cb:checked').map(function() { return this.value; }).get();

        updateDashboard({
            item_groups: selectedGroups,
            warehouses: selectedWarehouses,
            items: selectedItems
        });
    });

    $('#reset-filters').on('click', function() {
        $('.filter-checkbox').prop('checked', false);
        updateDropdownLabels();
        updateDashboard({});
    });

    function renderAllCharts(data) {
        renderItemGroupChart(data);
        renderItemChart(data);
        renderWarehouseChart(data);
    }

    function renderItemGroupChart(data) {
        let groupData = {};
        data.forEach(row => {
            let group = row.item_group || 'Unassigned';
            groupData[group] = (groupData[group] || 0) + flt(row.actual_qty);
        });

        let chartDom = document.getElementById('item-group-chart');
        let myChart = echarts.init(chartDom);
        
        let option = {
            title: { text: 'Stock by Item Group', left: 'center', textStyle: { fontSize: 14 } },
            tooltip: { trigger: 'axis' },
            grid: { top: '15%', bottom: '25%', left: '10%', right: '5%' },
            xAxis: { type: 'category', data: Object.keys(groupData), axisLabel: { interval: 0, rotate: 25, fontSize: 10 } },
            yAxis: { type: 'value', name: 'Qty' },
            series: [{ data: Object.values(groupData), type: 'bar', itemStyle: { color: '#4caf50' } }]
        };
        myChart.setOption(option, true);
        window.addEventListener('resize', () => myChart.resize());
    }

    function renderItemChart(data) {
        let chartData = {};
        data.forEach(row => {
            chartData[row.item_name] = (chartData[row.item_name] || 0) + flt(row.actual_qty);
        });

        let chartDom = document.getElementById('brick-chart');
        let myChart = echarts.init(chartDom);
        
        let option = {
            title: { text: 'Stock by Brick Item', left: 'center', textStyle: { fontSize: 14 } },
            tooltip: { trigger: 'axis' },
            grid: { top: '15%', bottom: '25%', left: '10%', right: '5%' },
            xAxis: { type: 'category', data: Object.keys(chartData), axisLabel: { interval: 0, rotate: 25, fontSize: 10 } },
            yAxis: { type: 'value', name: 'Qty' },
            series: [{ data: Object.values(chartData), type: 'bar', itemStyle: { color: '#ff5722' } }]
        };
        myChart.setOption(option, true);
        window.addEventListener('resize', () => myChart.resize());
    }

    function renderWarehouseChart(data) {
        let warehouseData = {};
        data.forEach(row => {
            warehouseData[row.warehouse] = (warehouseData[row.warehouse] || 0) + flt(row.actual_qty);
        });

        let chartDom = document.getElementById('warehouse-chart');
        let myChart = echarts.init(chartDom);
        
        let option = {
            title: { text: 'Stock Balance by Warehouse', left: 'center', textStyle: { fontSize: 15 } },
            tooltip: { trigger: 'axis' },
            grid: { top: '15%', bottom: '20%', left: '8%', right: '3%' },
            xAxis: { type: 'category', data: Object.keys(warehouseData), axisLabel: { interval: 0, rotate: 20, fontSize: 11 } },
            yAxis: { type: 'value', name: 'Actual Qty' },
            series: [{ data: Object.values(warehouseData), type: 'bar', itemStyle: { color: '#3f51b5' } }]
        };
        myChart.setOption(option, true);
        window.addEventListener('resize', () => myChart.resize());
    }
};