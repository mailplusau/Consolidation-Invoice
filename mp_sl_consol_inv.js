/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 2.00         2020-03-26 09:30:38         Anesu
 *
 * Description: Automation of Consolidation Invoice Process 
 * 
 * @Last Modified by:   Anesu
 * @Last Modified time: 2020-03-26 17:01:33
 * 
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format', 'N/render', 'N/file', 'N/task'],
    function (ui, email, runtime, search, record, http, log, redirect, format, render, file, task) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var zee = 0;
        var role = runtime.getCurrentUser().role;
        if (role == 1000) {
            //Franchisee
            zee = runtime.getCurrentUser();
        }

        function onRequest(context) {
            if (context.request.method === 'GET') {
                var is_params = false;

                var params = context.request.parameters;
                var zee_id;
                var custid;
                var custname = '';
                var sub_custid;
                var sub_subcustid;
                var consol_method;
                var consol_method_id;
                var period = 'May 21';

                if (!isNullorEmpty(params)) {
                    is_params == true;

                    consol_method_id = parseInt(params.method) ;
                    zee_id = parseInt(params.zeeid);
                    custid = parseInt(params.custid);
                    sub_custid = parseInt(params.subcustid)
                    sub_subcustid = parseInt(params.subsubcustid)
                    period = params.period;

                }

                if (!isNullorEmpty(consol_method)){
                    switch (consol_method_id) {
                        case '1' : consol_method = 'Branch'; break;
                        case '2' : consol_method = 'State'; break;
                        case '3' : consol_method = 'Invoice Type'; break;
                        case '4' : consol_method = 'Multi-Parent'; break;
                        default: consol_method = 'State';
                    }
                }
                
                var form = ui.createForm({title: 'Consolidation Invoice'});

                // Load jQuery
                var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
                // Load Tooltip
                inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';

                // Load Bootstrap
                inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
                // Load DataTables
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

                // Load Bootstrap-Select
                inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
                inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

                // Load Netsuite stylesheet and script
                inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
                inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
                inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<style>.mandatory{color:red;}</style>';

                // New Website Color Schemes
                // Main Color: #379E8F
                // Background Color: #CFE0CE
                // Button Color: #FBEA51
                // Text Color: #103D39

                inlineHtml += '<div class="a" style="width: 100%; background-color: #CFE0CE; padding: 20px; min-height: 100vh; height: 100%; margin-top: -40px">';
                // inlineHtml += '<h1 style="text-align: center; color: #103D39; display: inline-block; font-size: 22px; font-weight: bold; line-height: 33px; vertical-align: top; margin-bottom: 4px;">Consolidation Invoice</h1>';
                inlineHtml += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
                inlineHtml += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
                inlineHtml += '</style>';

                // Popup Notes Section
                inlineHtml += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Notes Section</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
                inlineHtml += '<div id="myModal2" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Snooze Timers</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

                // Click for Instructions
                // inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #CFE0CE !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
                // inlineHtml += '<ul><li><input type="button" class="btn-xs" style="background-color: #fff; color: black;" disabled value="Submit Search" /> - <ul><li>Click "Submit Search" to load Datatable using current parameters</li></ul></li>'
                // inlineHtml += '<li>Functionalities available on the Debt Collections Table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort collections invoices according to the values in the columns. This is default to "Days Overdue".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific Customer or Invoice by typing into the "Search" field</li></ul></li></ul></li>';
                // inlineHtml += '<li>Table Filters:<ul><li><b>Matching MAAP Allocation</b><ul><li><button type="button" class="btn-xs btn-success " disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li><li><button type="button" class="btn-xs btn-danger " disabled><span class="glyphicon glyphicon-minus"></span></button> - Click to remove MAAP Allocation search filter from table. This is set default to "Days Overdue".</li></ul></li> <li><b>MP Ticket Column</b><ul><button type="button" class="btn-xs btn-success" disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li></ul></li></ul></li><li>Clickable Actions Available Per Invoice in DataTable:</li>';
                // inlineHtml += '<ul><li><button type="button" class="btn-xs" disabled><span class="span_class glyphicon glyphicon-pencil"></span></button> - Click to open Notes Section for Selected Invoice. (Notes Section is seperate from User Notes)</li>';
                // inlineHtml += '<li><button type="button" class="btn-xs btn-secondary" disabled><span class="glyphicon glyphicon-eye-open"></span></button> - Click to Set Invoice has "Viewed" by a member of the Finance Team.</li>';
                // inlineHtml += '<li><button type="button" class="btn-xs btn-info" disabled><span class="glyphicon glyphicon-time"></span></button> - Click to view Snooze Timers</li><li><button type="button" class="timer-1day form=control btn-xs btn-info" disabled><span class="span_class">1 Day</span></button> - Click to select Snooze duration of invoice from Debt Collections Page.</li>';
                // inlineHtml += '</li></ul></div>';

                form.addField({
                    id: 'custpage_consol_inv_custname',
                    label: 'Customer Name',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = custname;
                
                
                inlineHtml += methodDropdownSection();
                inlineHtml += periodDropdownSection();
                
                // inlineHtml += zeeDropdownSection(zee_id);
                try {
                    if (zee_id != 0){
                        inlineHtml += parentDropdownSection(consol_method_id, zee_id, custid, period);
                        // inlineHtml += custDropdownSection(consol_method_id, zee_id, custid);
                    }
                    
                } catch(e){
                    // inlineHtml += errorSection(e);
                    // console.log(e.message);
                    log.error({
                        title: 'Error Message',
                        details: e.message
                    })
                }
                // if (consol_method_id = 4){ // 'Multi-Parent'
                //     inlineHtml += subCustDropdownSection(consol_method, zee_id, custid, sub_custid);
                // }
                
                inlineHtml += generateInvoice();

                inlineHtml += dataTable();

                // inlineHtml += '</div>'
                inlineHtml += '</div>'

                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineHtml;

                form.addField({
                    id: 'custpage_consol_inv_zee',
                    label: 'Zee ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee_id;

                form.addField({
                    id: 'custpage_consol_inv_custid',
                    label: 'Customer ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = custid;

                form.addField({
                    id: 'custpage_consol_inv_sub_custid',
                    label: 'Sub-Customer ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = sub_custid;

                form.addField({
                    id: 'custpage_consol_inv_sub_subcustid',
                    label: 'Sub-Sub Customer ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = sub_subcustid;

                form.addField({
                    id: 'custpage_consol_inv_method_id',
                    label: 'Conoslidation Method',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = parseInt(consol_method_id);

                form.addField({
                    id: 'custpage_consol_inv_period',
                    label: 'Period',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = period;

                form.addSubmitButton({
                    label: 'Generate Consolidation Invoice'
                });

                form.clientScriptFileId = 4750772; // 4607145

                context.response.writePage(form);

            } else {
                // CALL SCHEDULED SCRIPT
                var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
                scriptTask.scriptId = 'customscript_ss_consol_inv_1';
                scriptTask.deploymentId = 'customdeploy_ss_consol_inv_1';
                scriptTask.params = {
                    custscript_consol_inv_custid: custid,
                    custscript_consol_inv_sub_custid: sub_custid,
                    custscript_consol_inv_zee_id: zee_id,
                    custscript_consol_inv_method: consol_method,
                    custscript_consol_inv_period: period,
                    custscript_consol_inv_method_id: consol_method_id
                }
                if (!isNullorEmpty(sub_subcustid)){
                    scriptTask.params.push({custscript_consol_inv_sub_subcustid: sub_subcustid});
                }
                var ss_id = scriptTask.submit();
                var myTaskStatus = task.checkStatus({
                    taskId: ss_id
                });

                log.audit({
                    title: 'Task Status',
                    details: myTaskStatus
                });

                var form = ui.createForm({ title: 'Consolidation - PDF Download' });

                var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
                // Load Tooltip
                inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';

                // Load Bootstrap
                inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
                inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
                // Load DataTables
                inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

                // Load Bootstrap-Select
                // inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
                // inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

                // Load Netsuite stylesheet and script
                inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
                inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
                inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
                inlineHtml += '<style>.mandatory{color:red;}</style>';

                inlineHtml += '<div class="a" style="width: 100%; background-color: #CFE0CE; padding: 20px; min-height: 100vh; height: 100%; margin-top: -40px">';
                // inlineHtml += '<h1 style="text-align: center; color: #103D39; display: inline-block; font-size: 22px; font-weight: bold; line-height: 33px; vertical-align: top; margin-bottom: 4px;">Consolidation Invoice</h1>';
                inlineHtml += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
                inlineHtml += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
                inlineHtml += '</style>';

                // inlineHtml += progress(myTaskStatus);
                inlineHtml += downloadPDF();
                inlineHtml += errorSection();

                inlineHtml += '</div></div>'

                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineHtml;

                // form.addButton({
                //     id: 'back',
                //     label: 'Back',
                //     functionName: 'onClick_Back()'
                // })

                // form.addResetButton({
                //     label: 'Reset'
                // });

                form.clientScriptFileId = 4750772; // 4607145
                
                context.response.writePage(form);
            }
        }

        /**
         * The table that will display the differents invoices linked to the franchisee and the time period.
         * @return  {String}    inlineQty
         */
         function dataTable() {
            var inlineQty = '<style>table#inv_preview {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#inv_preview th{text-align: center;} .bolded{font-weight: bold;}</style>';
            inlineQty += '<table id="inv_preview" class="table table-responsive table-striped customer tablesorter hide" style="width: 100%;">';
            inlineQty += '<thead style="color: white; background-color: #379E8F;">';
            inlineQty += '<tr class="text-center">';
            inlineQty += '</tr>';
            inlineQty += '</thead>';

            inlineQty += '<tbody id="result_inv" class="result-inv"></tbody>';

            inlineQty += '</table>';
            return inlineQty;
        }

        function periodDropdownSection() {
            var inlineQty = '<div class="form-group container periodDropdownSection">';
            inlineQty += '<div class="col-xs-6 d-flex justify-content-center">';
            inlineQty += '<div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon">Period</span></div>';
            inlineQty += '<select id="period_dropdown" class="form-control">';
            inlineQty += '<option></option>';

            // for (var i = 0; i <= 100; i++){
            //     var i_name = '';
            //     var i_id = i;

            //     switch (i_id) {
            //         case 1 : i_name = 'Jan';
            //         case 2 : i_name = 'Feb';
            //         case 3 : i_name = 'Mar';
            //         case 4 : i_name = 'Apr';
            //         case 5 : i_name = 'May';
            //         case 6 : i_name = 'Jun';
            //         case 7 : i_name = 'Jul';
            //         case 8 : i_name = 'Aug';
            //         case 9 : i_name = 'Sep';
            //         case 10 : i_name = 'Oct';
            //         case 11 : i_name = 'Nov';
            //         case 12 : i_name = 'Dec';
            //     }
                
            //     for (var y = 2021; y <= 2121; y++){
            //         i_name += y;
                    
            //         if (i_id % 12 == 1){
            //             switch (i){
            //                 case 'Jan' : i_id = y;
            //             }
            //         }

            //     }

            //     inlineQty += '<option value="'+ i_id +'">' + i_name + '</option>';

            //     return true;
            // }

            inlineQty += '<option value="1">Jan</option>';
            inlineQty += '<option value="2">Feb</option>';
            inlineQty += '<option value="3">Mar</option>';
            inlineQty += '<option value="4">Apr</option>';
            inlineQty += '<option value="5">May</option>';
            inlineQty += '<option value="6">Jun</option>';
            inlineQty += '<option value="7">Jul</option>';
            inlineQty += '<option value="8">Aug</option>';
            inlineQty += '<option value="9">Sep</option>';
            inlineQty += '<option value="10">Oct</option>';
            inlineQty += '<option value="11">Nov</option>';
            inlineQty += '<option value="12">Dec</option>';
            inlineQty += '</select>';
            inlineQty += '</div></div>';

            return inlineQty;
        }

        function methodDropdownSection() {
            var inlineQty = '<div class="form-group container methodDropdownSection style="margin-top: 10px; text-align:center;">';
            inlineQty += '<div class="col-xs-6 d-flex justify-content-center">';
            inlineQty += '<div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon">Invoice Consolidation Method</span></div>';
            inlineQty += '<select id="method_dropdown" class="form-control">';
            inlineQty += '<option value="1">Branch</option>';
            inlineQty += '<option value="2">State</option>';
            inlineQty += '<option value="3">Invoice Type</option>';
            inlineQty += '<option value="4">Multi-Parent</option>';
            inlineQty += '</select>';
            inlineQty += '</div></div>';

            return inlineQty;
        }

        function zeeDropdownSection(zeeid) {
            var inlineQty = '<div class="form-group container zeeDropdown">';
            inlineQty += '<div class="col-xs-6 d-flex justify-content-center">';
            inlineQty += '<div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon">Franchisee</span></div>';
            inlineQty += '<select id="zee_dropdown" class="form-control" required>';
            inlineQty += '<option></option>';
            var zeesSearch = search.load({ type: 'partner', id: 'customsearch_smc_franchisee' });

            var zeesSearchResults = zeesSearch.run();
            log.audit({
                title: 'JSON Stringify - zeesSearchResults',
                details: JSON.stringify(zeesSearchResults)
            })
            zeesSearchResults.each(function(zeesSearchResult) {
                var zee_id = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Operator.GROUP });
                var zee_name = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Operator.GROUP });
                if (!isNullorEmpty(zeeid)){
                    inlineQty += '<option value="' + zee_id + '" selected>' + zee_name + '</option>';
                } else {
                    inlineQty += '<option value="' + zee_id + '">' + zee_name + '</option>';
                }
                return true;
            });
            inlineQty += '</select>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function parentDropdownSection(consol_method_id, zee_id, custid) { // Value = custid
            var inlineQty = '<div class="form-group container parentDropdownSection">';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon">Parent</span></div>';
            inlineQty += '<select id="parent_dropdown" class="form-control">';
            // inlineQty += '<option></option>';

            var customerSearch = search.load({
                id: 'customsearch_consol_inv_custlist',
                type: 'customer'
            })
            if (zee_id != 0){
                customerSearch.filters.push(search.createFilter({
                    name: 'partner',
                    operator: search.Operator.IS,
                    join: 'subCustomer',
                    values: zee_id
                }));
            }
            if (custid != 0){
                customerSearch.filters.push(search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: custid
                }));
            }
            if (consol_method_id != 0){
                customerSearch.filters.push(search.createFilter({
                    name: 'custentity_inv_consolidation_mtd',
                    operator: search.Operator.ANYOF,
                    values: consol_method_id
                }));
            }
            var cust_list = [];
            customerSearch.run().each(function(custResult){
                var cust_id = custResult.getValue({ name: 'internalid', summary: search.Operator.GROUP });
                if (cust_list.indexOf(cust_id) == -1) {
                    cust_list.push(cust_id);

                    var cust_name = custResult.getValue({ name: 'companyname'});
                    if (!isNullorEmpty(custid)){
                        inlineQty += '<option value="'+ cust_id + '" selected>' + cust_name +'</option>';
                    } else {
                        inlineQty += '<option value="'+ cust_id + '">' + cust_name +'</option>';
                    }
                    
                    return true;
                }
            });
            
            inlineQty += '</select>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function custDropdownSection(consol_method_id, zee_id, custid, sub_custid, form) { // Value = sub_custid
            var inlineQty = '<div class="form-group container subCustDropdownSection">';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon">Customer</span></div>';
            inlineQty += '<select id="cust_dropdown" class="form-control">';

            var customerSearch = search.load({
                id: 'customsearch_consol_inv_custlist',
                type: 'customer'
            })
            if (zee_id != 0){
                customerSearch.filters.push(search.createFilter({
                    name: 'partner',
                    operator: search.Operator.IS,
                    join: 'subCustomer',
                    values: zee_id
                }));
            }
            if (custid != 0){
                customerSearch.filters.push(search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: custid
                }));
            }
            if (consol_method_id != 0){
                customerSearch.filters.push(search.createFilter({
                    name: 'custentity_inv_consolidation_mtd',
                    operator: search.Operator.ANYOF,
                    values: consol_method_id
                }));
            }
            
            customerSearch.run().each(function(custResult){
                var cust_id = custResult.getValue({ name: 'internalid', join: 'subCustomer'})
                var cust_name = custResult.getValue({ name: 'companyname', join: 'subCustomer'});
                if (custid != 0){
                    inlineQty += '<option value="'+ cust_id + '" selected>' + cust_name +'</option>';
                } else {
                    inlineQty += '<option value="'+ cust_id + '">' + cust_name +'</option>';
                }

                return true;
            });
            
            inlineQty += '</select>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function subCustDropdownSection(consol_method_id, zee_id, custid, sub_custid, sub_subcustid) { // Value = sub_subcustid
            var inlineQty = '<div class="form-group container subCustDropdownSection hide">';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group"><span style="background-color: #379E8F" class="input-group-addon">Sub-Customer</span></div>';

            inlineQty += '<div class="row">';
            inlineQty += '<select id="sub_cust_dropdown" class="form-control">';
            inlineQty += '<option></option>';

            var subCustSearch = search.load({
                id: 'customsearch_consol_inv_custlist',
                type: 'customer'
            });
            if (custid != 0){
                subCustSearch.filters.push(search.createFilter({
                    name: 'internalid',
                    join: 'customer',
                    operator: search.Operator.IS,
                    values: custid
                }));
            }
            if (consol_method_id != 0){
                subCustSearch.filters.push(search.createFilter({
                    name: 'custentity_inv_consolidation_mtd',
                    operator: search.Operator.ANYOF,
                    values: consol_method_id
                }));  
            }            
            subCustSearch.run().each(function(subCustResult){
                var cust_id = subCustResult.getValue({ name: 'internalid'})
                var cust_name = subCustResult.getValue({ name: 'companyname'});
                if (custid){
                    inlineQty += '<option value="'+ cust_id + '" selected>' + cust_name +'</option>';
                } else {
                    inlineQty += '<option value="'+ cust_id + '">' + cust_name +'</option>';
                }
                
                return true;
            });
            inlineQty += '</select>';
            inlineQty += '<>';


            inlineQty += '</div>';

            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function progress(taskStatus){
            var inlineQty = '<div class="form-group container progressSection" style="text-align:center">';
            inlineQty += '<div class="row">'

            inlineQty += '<h1>' + taskStatus.status + '</h1>'

            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function errorSection(e){
            var inlineQty = '<div class="form-group container errorSection" style="text-align:center">';
            inlineQty += '<div class="row">'

            inlineQty += '<div class="alert alert-warning alert-dismissible fade show" role="alert"><strong>An Error Has Occured!</strong> You should check in on some of those fields below.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><h2 class="color--primary-1 page-header-text" style="margin-bottom: 20px !important; text-align: center; color: #379e8f !important; font-size: 40px !important;">'+ e + '</h2></div>'

            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function generateInvoice() {

            var inlineQty = '<div class="form-group container generateInvoiceSection" style="text-align:center">';
            inlineQty += '<div class="row">'
            inlineQty += '<div class="col-xs-6" >';
            inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="generateInvoice" class="btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Generate Table</button>';
            // inlineQty += '<button style="float: left; margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="updateticketbutton" onclick="">Update Ticket</button>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            inlineQty += '';

            return inlineQty;
        }

        function downloadPDF(){
            var inlineQty = '<div class="form-group container generateInvoiceSection" style="text-align:center">';
            inlineQty += '<div class="row">'
            inlineQty += '<div class="col-xs-6" >';
            // inlineQty += '<h2 id="fileLoading" class="color--primary-1 page-header-text" style="margin-bottom: 20px !important; text-align: center; color: #379e8f !important; font-size: 40px !important;"><strong>File is Still Loading...</strong></h2>';
            inlineQty += '<h2 id="fileReady" class="color--primary-1 page-header-text" style="margin-bottom: 20px !important; text-align: center; color: #379e8f !important; font-size: 40px !important;"><strong>File is Ready to be Downloaded</strong></h2>'

            inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="downloadPDF" class="btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit" onclick"loadpdf()">Download PDF</button>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            inlineQty += '';

            return inlineQty;
        }

        function loadpdf(){
            log.debug({
                title: 'Button Has Been Clicked'
            });
            var file_search = search.load({
                id: 'customsearch_consol_inv_file',
                type: 'file'
            });
            file_search.run().each(function(res){
                var internalid = res.getValue({ name: 'internalid'});
                var pdf = file.load({
                    id: internalid
                });
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.style = 'display: none';
                var content_type = 'text/pdf';
                var pdfFile = new Blob([pdf], { type: content_type });
                var url = window.URL.createObjectURL(pdfFile);
                var filename = 'consolidation_invoice_' + custname + '.pdf';
                var filename = 'consolidation_invoice.pdf';
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);

                // var file = response.writeFile(pdf, true);
                // return file;
            });

            
        }

        // function Create_Pdf_files(recType, recordInternalId) { try { 
        //     nlapiLogExecution('debug', "Printing " + recType + " Internal ID " + recordInternalId); 
        //     var transNumber = nlapiLookupField('transaction', recordInternalId, 'transactionnumber'); 
        //     var fileName = transNumber + '.PDF'; 
        //     var Pdf_Object = nlapiPrintRecord('TRANSACTION', recordInternalId, 'PDF'); 
        //     Pdf_Object.setFolder(XXX); 
        //     Pdf_Object.setName(fileName); 
        //         nlapiSubmitFile(Pdf_Object); /nlapiSendEmail(XXX,XXX,'This Record Has Been Printed','Test',your_email_address@gmail.com',null)/ 
        //     } catch (err) { 
        //         nlapiLogExecution('debug', "Error Printing " + recType + " Internal ID " + recordInternalId, err); 
        //     } 
        // }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            onRequest: onRequest
        };

    });