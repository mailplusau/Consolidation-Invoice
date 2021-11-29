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

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format', 'N/render', 'N/file', 'N/task', 'N/ui/dialog', 'N/encode'],
    function(ui, email, runtime, search, record, http, log, redirect, format, render, file, task, dialog, encode) {
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

                var params_params = context.request.parameters
                if (!isNullorEmpty(params_params.custparam_params)){
                    var params = JSON.parse(context.request.parameters.custparam_params);
                }
                
                // var date_from = context.request.parameters.custpage_consol_inv_date_from;
                // if (!date_from){
                //     date_from = '';
                // }
                // log.debug({
                //     title: 'date_from',
                //     details: date_from
                // })
                // var date_to = context.request.parameters.custpage_consol_inv_date_to;
                // if (!date_to){
                //     date_to = '';
                // }
                // log.debug({
                //     title: 'date_to',
                //     details: date_to
                // })
                
                var zee_id;
                var custid;
                var custname = '';
                var sub_custid;
                var sub_subcustid;
                var consol_method;
                var consol_method_id;
                var period = '';
                // period = 'May 21';
                // var date_from;
                // var date_to;

                if (!isNullorEmpty(params)) {
                    is_params == true;

                    consol_method_id = parseInt(params.method);
                    zee_id = parseInt(params.zeeid);
                    custid = parseInt(params.custid);
                    sub_custid = parseInt(params.subcustid)
                    sub_subcustid = parseInt(params.subsubcustid)
                    period = params.period;
                    date_from = params.date_from;
                    date_to = params.date_to;

                }

                log.debug({
                    title: 'consol_method_id',
                    details: consol_method_id
                })
                if (!isNullorEmpty(consol_method)) {
                    switch (consol_method_id) {
                        case '1':
                            consol_method = 'Branch';
                            break;
                        case '2':
                            consol_method = 'State';
                            break;
                        case '3':
                            consol_method = 'Invoice Type';
                            break;
                        case '4':
                            consol_method = 'Multi-Parent';
                            break;
                    }
                }

                var form = ui.createForm({ title: ' ' });

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
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/rowgroup/1.1.3/js/dataTables.rowGroup.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/dataTables.buttons.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/buttons.html5.min.js"></script> '
                inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/buttons/2.0.0/js/buttons.print.min.js"></script> '

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

                // inlineHtml += '<div class="a" style="width: 100%; background-color: #CFE0CE; padding: 20px; min-height: 100vh; height: 100%; ">'; // margin-top: -40px
                // // inlineHtml += '<h1 style="text-align: center; color: #103D39; display: inline-block; font-size: 22px; font-weight: bold; line-height: 33px; vertical-align: top; margin-bottom: 4px;">Consolidation Invoice</h1>';
                // inlineHtml += '<style>.nav > li.active > a, .nav > li.active > a:focus, .nav > li.active > a:hover { background-color: #379E8F; color: #fff }';
                // inlineHtml += '.nav > li > a, .nav > li > a:focus, .nav > li > a:hover { margin-left: 5px; margin-right: 5px; border: 2px solid #379E8F; color: #379E8F; }';
                // inlineHtml += '</style>';

                // Define alert window.
                inlineHtml += '<div class="container" style="margin-top:14px;" hidden><div id="alert" class="alert alert-danger fade in"></div></div>';

                // Define information window.
                inlineHtml += '<div class="container" hidden><p id="info" class="alert alert-info"></p></div>';

                inlineHtml += '<div style="margin-top: -40px"><br/>';

                // Buttons
                // inlineHtml += '<button style="margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="new_agreement" onclick="">New Franchisee Agreement</button>';
                inlineHtml += '<h1 style="font-size: 25px; font-weight: 700; color: #103D39; text-align: center">Consolidation Invoicing</h1>';

                // Click for Instructions
                // inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #CFE0CE !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
                // inlineHtml += '<ul><li><input type="button" class="btn-xs" style="background-color: #fff; color: black;" disabled value="Submit Search" /> - <ul><li>Click "Submit Search" to load Datatable using current parameters</li></ul></li>'
                // inlineHtml += '<li>Functionalities available on the Debt Collections Table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort collections invoices according to the values in the columns. This is default to "Days Overdue".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific Customer or Invoice by typing into the "Search" field</li></ul></li></ul></li>';
                // inlineHtml += '<li>Table Filters:<ul><li><b>Matching MAAP Allocation</b><ul><li><button type="button" class="btn-xs btn-success " disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li><li><button type="button" class="btn-xs btn-danger " disabled><span class="glyphicon glyphicon-minus"></span></button> - Click to remove MAAP Allocation search filter from table. This is set default to "Days Overdue".</li></ul></li> <li><b>MP Ticket Column</b><ul><button type="button" class="btn-xs btn-success" disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li></ul></li></ul></li><li>Clickable Actions Available Per Invoice in DataTable:</li>';
                // inlineHtml += '<ul><li><button type="button" class="btn-xs" disabled><span class="span_class glyphicon glyphicon-pencil"></span></button> - Click to open Notes Section for Selected Invoice. (Notes Section is seperate from User Notes)</li>';
                // inlineHtml += '<li><button type="button" class="btn-xs btn-secondary" disabled><span class="glyphicon glyphicon-eye-open"></span></button> - Click to Set Invoice has "Viewed" by a member of the Finance Team.</li>';
                // inlineHtml += '<li><button type="button" class="btn-xs btn-info" disabled><span class="glyphicon glyphicon-time"></span></button> - Click to view Snooze Timers</li><li><button type="button" class="timer-1day form=control btn-xs btn-info" disabled><span class="span_class">1 Day</span></button> - Click to select Snooze duration of invoice from Debt Collections Page.</li>';
                // inlineHtml += '</li></ul></div>';

                inlineHtml += method_periodDropdownSection();
                // inlineHtml += dateDropdownSection();
                // inlineHtml += zeeDropdownSection(zee_id);
                if (!isNullorEmpty(consol_method_id)){

                    inlineHtml += generateInvoice();

                    inlineHtml += dataTable();

                    // inlineHtml += totalAmount();

                    inlineHtml += downloadButtons();
                }

                inlineHtml += '</div>';

                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineHtml;

                // form.addField({
                //     id: 'custpage_consol_inv_zee',
                //     label: 'Zee ID',
                //     type: ui.FieldType.TEXT
                // }).updateDisplayType({
                //     displayType: ui.FieldDisplayType.HIDDEN
                // }).defaultValue = zee_id;

                // form.addField({
                //     id: 'custpage_consol_inv_custid',
                //     label: 'Customer ID',
                //     type: ui.FieldType.TEXT
                // }).updateDisplayType({
                //     displayType: ui.FieldDisplayType.HIDDEN
                // }).defaultValue = custid;

                // form.addField({
                //     id: 'custpage_consol_inv_custname',
                //     label: 'Customer Name',
                //     type: ui.FieldType.TEXT
                // }).updateDisplayType({
                //     displayType: ui.FieldDisplayType.HIDDEN
                // }).defaultValue = custname;

                // form.addField({
                //     id: 'custpage_consol_inv_sub_custid',
                //     label: 'Sub-Customer ID',
                //     type: ui.FieldType.TEXT
                // }).updateDisplayType({
                //     displayType: ui.FieldDisplayType.HIDDEN
                // }).defaultValue = sub_custid;

                // form.addField({
                //     id: 'custpage_consol_inv_sub_subcustid',
                //     label: 'Sub-Sub Customer ID',
                //     type: ui.FieldType.TEXT
                // }).updateDisplayType({
                //     displayType: ui.FieldDisplayType.HIDDEN
                // }).defaultValue = sub_subcustid;

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

                // form.addField({
                //     id: 'custpage_consol_inv_date_from',
                //     label: 'Date From',
                //     type: ui.FieldType.TEXT
                // }).updateDisplayType({
                //     displayType: ui.FieldDisplayType.HIDDEN
                // }).defaultValue = date_from;

                // form.addField({
                //     id: 'custpage_consol_inv_date_to',
                //     label: 'Date To',
                //     type: ui.FieldType.TEXT
                // }).updateDisplayType({
                //     displayType: ui.FieldDisplayType.HIDDEN
                // }).defaultValue = date_to;

                form.addField({
                    id: 'custpage_table_csv',
                    label: 'Table CSV',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                })

                form.addSubmitButton({
                    label: ' '
                });

                form.clientScriptFileId = 4750772; // 4607145

                context.response.writePage(form);

            } else {
                var params = context.request.parameters;

                var consol_method_id = parseInt(context.request.parameters.custpage_consol_inv_method_id);
                var custid = parseInt(context.request.parameters.custpage_consol_inv_custid);
                var sub_custid = parseInt(context.request.parameters.custpage_consol_inv_sub_custid);
                // var zee_id = parseInt(context.request.parameters.custpage_consol_inv_zee);
                var period = parseInt(context.request.parameters.custpage_consol_inv_period);
                // var date_from = context.request.parameters.custpage_consol_inv_date_from;
                // var date_to = context.request.parameters.custpage_consol_inv_date_to;

                log.debug({
                    title: 'Parameter: Method ID',
                    details: consol_method_id
                });

                // CALL SCHEDULED SCRIPT
                var params2 = {
                    custscript_consol_inv_custid_1: custid,
                    custscript_consol_inv_sub_custid_1: sub_custid,
                    custscript_consol_inv_method_id_1: consol_method_id,
                    custscript_consol_inv_period_1: period,
                    // custscript_consol_inv_date_from_1: date_from,
                    // custscript_consol_inv_date_to_1: date_to
                }
                var scriptTask = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: 'customscript_ss_consol_inv_1',
                    deploymentId: 'customdeploy_ss_consol_inv_1',
                    params: params2
                });

                var ss_id = scriptTask.submit();
                var myTaskStatus = task.checkStatus({
                    taskId: ss_id
                });
                log.audit({
                    title: 'Task Status',
                    details: myTaskStatus
                });
                log.audit({
                    title: 'Task Submit: Params',
                    details: scriptTask.params
                })
                log.audit({
                    title: 'Task Submit: Params Customer ID',
                    details: scriptTask.params.custscript_consol_inv_custid_1
                })

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
                // inlineHtml += loadpdf();
                inlineHtml += downloadPDF(context);
                inlineHtml += errorSection(e);

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
            
            inlineQty += '<table id="inv_preview" class="table table-responsive table-striped customer tablesorter " style="width: 100%;">';
            inlineQty += '<thead style="color: white; background-color: #379E8F;">';
            inlineQty += '<tr class="text-center">';
            inlineQty += '</tr>';
            inlineQty += '</thead>';

            inlineQty += '<tbody id="result_inv" class="result-inv"></tbody>';

            inlineQty += '</table>';
            return inlineQty;
        }

        function method_periodDropdownSection() {
            var inlineQty = '<div class="form-group container methodDropdownSection style="margin-top: 10px; text-align:center;">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #379E8F; color: white;">Table Filters</span></h4></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container methodDropdownSection">';
            inlineQty += '<div class="row">';

            inlineQty += '<div class="col-xs-6 method_section">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="method_section_text">Method Selection</span>';
            inlineQty += '<select id="method_dropdown" class="form-control">';
            inlineQty += '<option value="1">Branch</option>';
            inlineQty += '<option value="2">State</option>';
            inlineQty += '<option value="3">Invoice Type</option>';
            inlineQty += '<option value="4">Multi-Parent</option>';
            inlineQty += '</select>';
            inlineQty += '</div></div>';

            inlineQty += '<div class="col-xs-6 period_section">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Period</span>';
            inlineQty += '<select id="period_dropdown" class="form-control" disabled>';
            inlineQty += '<option selected></option>';
            inlineQty += '<option value="0" selected>Last Period</option>';
            inlineQty += '<option value="1">Before Last Period</option>';
            inlineQty += '<option value="2">3 Months Ago</option>';
            // inlineQty += '<option value="3">Apr</option>';
            // inlineQty += '<option value="4">May</option>';
            // inlineQty += '<option value="5">Jun</option>';
            // inlineQty += '<option value="6">Jul</option>';
            // inlineQty += '<option value="7">Aug</option>';
            // inlineQty += '<option value="8">Sep</option>';
            // inlineQty += '<option value="9">Oct</option>';
            // inlineQty += '<option value="10">Nov</option>';
            // inlineQty += '<option value="11">Dec</option>';
            inlineQty += '</select>';
            inlineQty += '</div></div>';

            inlineQty += '</div>';
            inlineQty += '</div>';


            return inlineQty;
        }

        function dateDropdownSection() {
            var inlineQty = '<div class="form-group container date_filter_section">';
            inlineQty += '<div class="row">';
            // Date from field
            inlineQty += '<div class="col-xs-6 date_from">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="date_from_text">From</span>';
            inlineQty += '<input id="date_from" class="form-control date_from" type="date" disabled/>';
            inlineQty += '</div></div>';
            // Date to field
            inlineQty += '<div class="col-xs-6 date_to">';
            inlineQty += '<div class="input-group">';
            inlineQty += '<span class="input-group-addon" style="background-color: #379E8F; color: white;" id="date_to_text">To</span>';
            inlineQty += '<input id="date_to" class="form-control date_to" type="date" disabled>';
            inlineQty += '</div></div>'
            inlineQty += '</div></div>';

            return inlineQty;
        }

        function zeeDropdownSection(zeeid) {
            var inlineQty = '<div class="form-group container zeeDropdown">';
            inlineQty += '<div class="row col-xs-6" style="left: 25%;">'; //col-xs-6 d-flex justify-content-center

            inlineQty += '<div class="input-group">';
            inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Franchisee</span>';
            inlineQty += '<select id="zee_dropdown" class="form-control" required>';
            inlineQty += '<option></option>';
            var zeesSearch = search.load({ type: 'partner', id: 'customsearch_smc_franchisee' });

            var zeesSearchResults = zeesSearch.run();
            log.audit({
                title: 'JSON Stringify - zeesSearchResults',
                details: JSON.stringify(zeesSearchResults)
            })
            zeesSearchResults.each(function(zeesSearchResult) {
                var zee_id = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Summary.GROUP });
                var zee_name = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Summary.GROUP });
                if (!isNullorEmpty(zeeid)) {
                    inlineQty += '<option value="' + zee_id + '" selected>' + zee_name + '</option>';
                } else {
                    inlineQty += '<option value="' + zee_id + '">' + zee_name + '</option>';
                }
                return true;
            });
            inlineQty += '</select>';
            inlineQty += '</div>';

            inlineQty += '</div></div>';

            return inlineQty;
        }

        function parentDropdownSection(consol_method_id, zee_id, custid) { // Value = custid
            var inlineQty = '<div class="form-group container parentDropdown">';
            inlineQty += '<div class="row col-xs-6" style="left: 25%;">'; //col-xs-6 d-flex justify-content-center

            inlineQty += '<div class="input-group">';
            inlineQty += '<span style="background-color: #379E8F; color: white; font-weight: bold;" class="input-group-addon">Parent</span>';
            inlineQty += '<select id="parent_dropdown" class="form-control">';
            inlineQty += '<option></option>';

            var customerSearch = search.load({
                id: 'customsearch_consol_inv_lineitem',
                type: 'invoice'
            })
            // if (!isNaN(zee_id)){
            //     customerSearch.filters.push(search.createFilter({
            //         name: 'partner',
            //         operator: search.Operator.IS,
            //         join: 'subCustomer',
            //         values: zee_id
            //     }));
            // }
            // if (!isNaN(custid)) {
            // customerSearch.filters.push(search.createFilter({
            //     name: 'internalid',
            //     operator: search.Operator.IS,
            //     values: 632197 // Decujba 
            // }));
            // }
            // if (consol_method_id != 0) {
            //     customerSearch.filters.push(search.createFilter({
            //         name: 'custentity_inv_consolidation_mtd',
            //         operator: search.Operator.IS,
            //         // join: 'subCustomer',
            //         values: consol_method_id
            //     }));
            // }
            var cust_list = [];
            customerSearch.run().each(function(custResult) {
                // var cust_id = custResult.getValue({ name: 'internalid' }); // , summary: search.Operator.GROUP 
                var cust_id = line_item.getValue({ name: "internalid", join: "customer" })

                var invoice_id = line_item.getValue({ name: 'internalid' });
                var subparent = line_item.getValue({ name: 'internalid', join: 'customer' });
                var company_name = line_item.getValue({ name: "formulatext", formula: "{customer.parent}"});

                log.debug({
                    title: 'GROUPED Cust ID',
                    details: cust_id
                })
                if (cust_list.indexOf(cust_id) == -1) {
                    cust_list.push(cust_id);

                    // var cust_name = custResult.getValue({ name: 'companyname' }); // , summary: search.Operator.GROUP
                    var cust_name = line_item.getValue({ name: "companyname", join: "customer" })
                    // if (!isNullorEmpty(custid)) {
                    //     inlineQty += '<option value="' + cust_id + '" selected>' + cust_name + '</option>';
                    // } else {
                        inlineQty += '<option value="' + cust_id + '">' + cust_name + '</option>';
                    // }

                    return true;
                }
            });

            inlineQty += '</select>';
            inlineQty += '</div>';

            inlineQty += '</div></div>';

            return inlineQty;
        }

        function custDropdownSection(consol_method_id, zee_id, custid, sub_custid, form) { // Value = sub_custid
            var inlineQty = '<div class="form-group container subCustDropdownSection">';
            inlineQty += '<div class="row col-xs-6" style="left: 25%;">'; //col-xs-6 d-flex justify-content-center

            inlineQty += '<div class="input-group">';
            inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Customer</span></div>';
            inlineQty += '<select id="cust_dropdown" class="form-control">';

            var customerSearch = search.load({
                id: 'customsearch_consol_inv_custlist',
                type: 'customer'
            });
            // if (zee_id != 0){
            //     customerSearch.filters.push(search.createFilter({
            //         name: 'partner',
            //         operator: search.Operator.IS,
            //         join: 'subCustomer',
            //         values: zee_id
            //     }));
            // }
            // if (custid != 0 || !isNullorEmpty(custid) || !isNaN(custid)) {
            //     customerSearch.filters.push(search.createFilter({
            //         name: 'internalid',
            //         operator: search.Operator.IS,
            //         values: custid
            //     }));
            // }
            // if (consol_method_id != 0) {
            //     customerSearch.filters.push(search.createFilter({
            //         name: 'custentity_inv_consolidation_mtd',
            //         join: "subCustomer",
            //         operator: search.Operator.ANYOF,
            //         values: consol_method_id
            //     }));
            // }

            customerSearch.run().each(function(custResult) {
                var cust_id = custResult.getValue({ name: 'internalid', join: 'subCustomer' })
                var cust_name = custResult.getValue({ name: 'companyname', join: 'subCustomer' });
                if (custid != 0) {
                    inlineQty += '<option value="' + cust_id + '" selected>' + cust_name + '</option>';
                } else {
                    inlineQty += '<option value="' + cust_id + '">' + cust_name + '</option>';
                }

                return true;
            });

            inlineQty += '</select>';
            inlineQty += '</div>';

            inlineQty += '</div></div>';

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
            if (custid != 0) {
                subCustSearch.filters.push(search.createFilter({
                    name: 'internalid',
                    join: 'customer',
                    operator: search.Operator.IS,
                    values: custid
                }));
            }
            if (consol_method_id != 0) {
                subCustSearch.filters.push(search.createFilter({
                    name: 'custentity_inv_consolidation_mtd',
                    operator: search.Operator.ANYOF,
                    values: consol_method_id
                }));
            }
            subCustSearch.run().each(function(subCustResult) {
                var cust_id = subCustResult.getValue({ name: 'internalid' })
                var cust_name = subCustResult.getValue({ name: 'companyname' });
                if (custid) {
                    inlineQty += '<option value="' + cust_id + '" selected>' + cust_name + '</option>';
                } else {
                    inlineQty += '<option value="' + cust_id + '">' + cust_name + '</option>';
                }

                return true;
            });
            inlineQty += '</select>';
            inlineQty += '</div></div>';
            inlineQty += '</div></div>';

            return inlineQty;
        }

        function progress(taskStatus) {
            var inlineQty = '<div class="form-group container progressSection" style="text-align:center">';
            inlineQty += '<div class="row">'

            inlineQty += '<h1>' + taskStatus.status + '</h1>'

            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function errorSection(e) {
            var inlineQty = '<div class="form-group container errorSection" style="text-align:center">';
            inlineQty += '<div class="row">'

            inlineQty += '<div class="alert alert-warning alert-dismissible fade show" role="alert"><strong>An Error Has Occured!</strong> You should check in on some of those fields below.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><h2 class="color--primary-1 page-header-text" style="margin-bottom: 20px !important; text-align: center;  font-size: 40px !important;">' + e + '</h2></div>' // color: #379e8f !important;

            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function generateInvoice() {

            var inlineQty = '<div class="form-group container generateInvoiceSection" style="text-align:center">';
            inlineQty += '<div class="row">'
            inlineQty += '<div class="col-xs-12" >';
            inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="generateInvoice" class="btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Generate Table</button>';
            // inlineQty += '<button style="float: left; margin-left: 10px; margin-right: 5px; background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="updateticketbutton" onclick="">Update Ticket</button>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            inlineQty += '';

            return inlineQty;
        }

        function downloadPDF(context) {
            var inlineQty = '<div class="form-group container generateInvoiceSection" style="text-align:center">';
            inlineQty += '<div class="row">'
            // inlineQty += '<div class="col-xs-6" >';
            // inlineQty += '<h2 id="fileLoading" class="color--primary-1 page-header-text" style="margin-bottom: 20px !important; text-align: center; color: #379e8f !important; font-size: 40px !important;"><strong>File is Still Loading...</strong></h2>';
            inlineQty += '<h2 id="fileReady" class="color--primary-1 page-header-text" style="margin-bottom: 20px !important; text-align: center; color: #379e8f !important; font-size: 40px !important;"><strong>File is Ready to be Downloaded</strong></h2>'
            inlineQty += '<br><br>';
            inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="downloadAsPDF" class="btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit" onclick="' + loadpdf() + '">Download PDF</button>';
            // inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="download" class="btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit" onclick="' + loadExcel(context) + '">Download PDF</button>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            inlineQty += '';


            return inlineQty;
        }

        function downloadButtons() {
            var inlineQty = '<div class="form-group container generateInvoiceSection" style="text-align:center">';
            inlineQty += '<div class="row">'
            inlineQty += '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="downloadExcel" class="btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit hide">Download Excel</button>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            inlineQty += '';
            return inlineQty;
        }

        // function totalAmount() {
        //     var inlineQty = '<div class="form-group container generateInvoiceSection hide" style="text-align:center">';
        //     inlineQty += '<div class="row">'

        //     inlineQty += '<div class="col-xs-3" >';
        //     inlineQty += '<div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon">Sub Total</span>';
        //     inlineQty += '<input class="form-control" type="text">';
        //     inlineQty += '</div>';
        //     inlineQty += '</div>';

        //     inlineQty += '<div class="col-xs-3" >';
        //     inlineQty += '<div class="input-group"><span style="background-color: #379E8F; color: white;" class="input-group-addon">Total GST</span>';
        //     inlineQty += '<input class="form-control" type="text">';
        //     inlineQty += '</div>';
        //     inlineQty += '</div>';

        //     inlineQty += '<div class="col-xs-3" >';
        //     inlineQty += '<div class="input-group">';
        //     inlineQty += '<span style="background-color: #379E8F; color: white;" class="input-group-addon">Total Amount</span>';
        //     inlineQty += '<input class="form-control" type="text" placeholder="$">';
        //     inlineQty += '</div>';
        //     inlineQty += '</div>';

        //     inlineQty += '</div>';
        //     inlineQty += '</div>';

        //     return inlineQty;
        // }

        function loadpdf() {
            log.debug({
                title: 'Button Has Been Clicked'
            });
            var file_search = search.load({
                id: 'customsearch_consol_inv_file',
                type: 'file'
            });
            file_search.run().each(function(res) {
                var internalid = res.getValue({ name: 'internalidnumber' });
                log.debug({
                    title: 'File: Internalid Number',
                    details: internalid
                });
                var id = res.getValue({ name: 'internalid' });
                log.debug({
                    title: 'File: Internalid',
                    details: id
                })
                var pdf = file.load({
                    id: internalid
                });

                var fileLoaded = response.writeFile(pdf, true);
                return fileLoaded;
            });
        }

        // function loadExcel(scriptContext) {
        //     // dialog.alert({
        //     //     title: "Alert",
        //     //     message: "You click this export button!"
        //     // });

        //     // XML content of the file
        //     var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
        //     xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
        //     xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
        //     xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
        //     xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
        //     xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
        //     xmlStr += '<Worksheet ss:Name="Sheet1">';
        //     xmlStr += '<Table>' +
        //         '<Row>' +
        //         '<Cell><Data ss:Type="String"> First Header </Data></Cell>' +
        //         '<Cell><Data ss:Type="String"> Second Header </Data></Cell>' +
        //         '<Cell><Data ss:Type="String"> Third Header </Data></Cell>' +
        //         '<Cell><Data ss:Type="String"> Fourth Header </Data></Cell>' +
        //         '<Cell><Data ss:Type="String"> Fifth Header </Data></Cell>' +
        //         '</Row>';
        //     xmlStr += '</Table></Worksheet></Workbook>';

        //     // Encode Contents
        //     var base64EncodedString = encode.convert({
        //         string: xmlStr,
        //         inputEncoding: encode.Encoding.UTF_8,
        //         outputEncoding: encode.Encoding.BASE_64
        //     });

        //     // Create File 
        //     var xlsFile = file.create({
        //         name: 'TEST.xls',
        //         fileType: 'EXCEL',
        //         contents: base64EncodedString
        //     });

        //     log.debug({
        //         details: "File ID: " + xlsFile
        //     });

        //     var saveFile = xlsFile.folder = 2775794;

        //     log.debug({
        //         title: 'Save File ID:',
        //         details: saveFile
        //     })
        //     var response = scriptContext.response.writeFile({
        //         file: xlsFile
        //     });

        //     log.debug({
        //         title: 'response',
        //         details: response
        //     })
        // }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        /**
         * [getDate description] - Get the current date
         * @return {[String]} [description] - return the string date
         */
        function getDate() {
            var date = new Date();
            date = format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            });

            return date;
        }

        return {
            onRequest: onRequest
        };
    });