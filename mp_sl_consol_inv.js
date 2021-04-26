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

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format', 'N/render'],
    function (ui, email, runtime, search, record, http, log, redirect, format, render) {
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
                var zee_id = 0;
                var custid = 0;
                var consol_method;
                var period;

                if (!isNullorEmpty(params)) {
                    is_params == true;

                    zee_id = params.zee;
                    custid = params.custid;
                    consol_method = params.method;
                    period = params.period;

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
                inlineHtml += '<div id="home" style="background-color: #CFE0CE; width: 100%; height: 100%"><style>.background-color{color:#CFE0CE;}</style>';

                // New Website Color Schemes
                // Main Color: #379E8F
                // Background Color: #CFE0CE
                // Button Color: #FBEA51
                // Text Color: #103D39
                

                // Popup Notes Section
                inlineHtml += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Notes Section</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
                inlineHtml += '<div id="myModal2" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Snooze Timers</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

                // Click for Instructions
                inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #CFE0CE !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
                inlineHtml += '<ul><li><input type="button" class="btn-xs" style="background-color: #fff; color: black;" disabled value="Submit Search" /> - <ul><li>Click "Submit Search" to load Datatable using current parameters</li></ul></li>'
                inlineHtml += '<li>Functionalities available on the Debt Collections Table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort collections invoices according to the values in the columns. This is default to "Days Overdue".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific Customer or Invoice by typing into the "Search" field</li></ul></li></ul></li>';
                inlineHtml += '<li>Table Filters:<ul><li><b>Matching MAAP Allocation</b><ul><li><button type="button" class="btn-xs btn-success " disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li><li><button type="button" class="btn-xs btn-danger " disabled><span class="glyphicon glyphicon-minus"></span></button> - Click to remove MAAP Allocation search filter from table. This is set default to "Days Overdue".</li></ul></li> <li><b>MP Ticket Column</b><ul><button type="button" class="btn-xs btn-success" disabled><span class="glyphicon glyphicon-plus"></span></button> - Click to apply MAAP Allocation filters search filters on table. ONLY click once. </li></ul></li></ul></li><li>Clickable Actions Available Per Invoice in DataTable:</li>';
                inlineHtml += '<ul><li><button type="button" class="btn-xs" disabled><span class="span_class glyphicon glyphicon-pencil"></span></button> - Click to open Notes Section for Selected Invoice. (Notes Section is seperate from User Notes)</li>';
                inlineHtml += '<li><button type="button" class="btn-xs btn-secondary" disabled><span class="glyphicon glyphicon-eye-open"></span></button> - Click to Set Invoice has "Viewed" by a member of the Finance Team.</li>';
                inlineHtml += '<li><button type="button" class="btn-xs btn-info" disabled><span class="glyphicon glyphicon-time"></span></button> - Click to view Snooze Timers</li><li><button type="button" class="timer-1day form=control btn-xs btn-info" disabled><span class="span_class">1 Day</span></button> - Click to select Snooze duration of invoice from Debt Collections Page.</li>';
                inlineHtml += '</li></ul></div>';

                inlineHtml += invTypeDropdownSection();
                inlineHtml += zeeDropdownSection();
                inlineHtml += parentDropdownSection();
                inlineHtml += custDropdownSection();
                inlineHtml += subCustDropdownSection();
                inlineHtml += generateInvoice();

                inlineHtml += '</div>'

                var response = context.response;

                function pdfLoad(response){
                    var filePDF = file.load('Templates/PDF Templates/Consolidation Invoice - ' + consol_method + ' Template.pdf');
                    var myPDFFile = render.create();
                    mpyPDFFile.templateContent = filePDF.getContents();
                    myPDFFile.addCustomDataSource({
                        alias: 'JSON',
                        format: render.DataSource.OBJECT,
                        data: JSON.parse(merge)
                    });
                    myPDFFile.setFolder(2775794);
                    var newPDF = myPDFFile.renderAsPdf();
                    log.debug({
                        title: 'New PDF',
                        details: newPDF
                    });
                    response.writeFile(newPDF, false);
                }
                

                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineHtml;

                var zee_id = 0;
                var custid = 0;
                var sub_custid;
                var consol_method;
                var period;

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
                    id: 'custpage_consol_inv_method',
                    label: 'Invoice Type',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = consol_method;
                form.addField({
                    id: 'custpage_consol_inv_period',
                    label: 'Period',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = period;

                form.clientScriptFileId = 4750772; // 4607145

                context.response.writePage(form);

            } else {

            }
        }

        function invTypeDropdownSection() {
            var inlineQty = '<div class="col-lg-12 invTypeDropdownSection">';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group"><span class="input-group-addon" id="showMAAP_box">Invoice Type</span></div>';
            inlineQty += '<select id="zee_dropdown" class="form-control">';
            inlineQty += '<option value="1">Branch</option>';
            inlineQty += '<option value="2">Invoice Type</option>';
            inlineQty += '<option value="3">State</option>';
            inlineQty += '<option value="4">Multi-Parent</option>';
            inlineQty += '</select>';
            inlineQty += '</div></div>';

            return inlineQty;
        }

        function zeeDropdownSection() {
            var inlineQty = '<div class="col-lg-12 zeeDropdown">';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group"><span class="input-group-addon" id="showMAAP_box">Franchisee</span></div>';
            inlineQty += '<select id="zee_dropdown" class="form-control" required>';
            inlineQty += '<option></option>';
            var zeesSearch = search.load({ type: 'partner', id: 'customsearch_job_inv_process_zee' });
            var zeesSearchResults = zeesSearch.run();
            zeesSearchResults.each(function(zeesSearchResult) {
                var zee_id = zeesSearchResult.getValue({ name: 'internalid', summmary: search.Operator.GROUP });
                var zee_name = zeesSearchResult.getValue({ name: 'companyname', summmary: search.Operator.GROUP });
                inlineQty += '<option value="' + zee_id + '">' + zee_name + '</option>';
                return true;
            });
            inlineQty += '</select>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function parentDropdownSection(consol_method, zee_id) {
            var inlineQty = '<div class="col-lg-12 custDropdownSection">';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group"><span class="input-group-addon" id="showMAAP_box">Parent</span></div>';
            inlineQty += '<select id="zee_dropdown" class="form-control">';

            // var customerSearch = search.load({
            //     id: ''
            //     type: string
            // })

            inlineQty += '<option value="1">Branch</option>';
            inlineQty += '</select>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function custDropdownSection(consol_method, zee_id, parent_id) {
            var inlineQty = '<div class="col-lg-12 subCustDropdownSection">';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group"><span class="input-group-addon" id="showMAAP_box">Customer</span></div>';
            inlineQty += '<select id="zee_dropdown" class="form-control">';

            // var search = search.load({
            //     id: string,
            //     type: string
            // });

            inlineQty += '<option value="1">Branch</option>';
            inlineQty += '</select>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function subCustDropdownSection(consol_method, zee_id, parent_id, cust_id) {
            var inlineQty = '<div class="col-lg-12 subCustDropdownSection">';
            inlineQty += '<div class="col-xs-6">';
            inlineQty += '<div class="input-group"><span class="input-group-addon" id="showMAAP_box">Sub-Customer</span></div>';
            inlineQty += '<select id="zee_dropdown" class="form-control">';

            // var search = search.load({
            //     id: string,
            //     type: string
            // });

            inlineQty += '<option value="1">Branch</option>';
            inlineQty += '</select>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            return inlineQty;
        }

        function generateInvoice(consol_method, zee_id, parent_id, cust_id) {

            // var consol_record = search.load({
            //     id: 'customsearch_consol_inv_record',
            //     type: 'customrecord_consol_inv_data'
            // });
            // consol_record.filters.push(search.createFilter({
            //     name: 'custrecord_consol_inv_zee',
            //     operator: search.Operator.IS,
            //     values: zee
            // }));

            var inlineQty = '<div class="col-lg-12 generateInvoiceSection" style="text-align:center">';
            inlineQty += '<div class="col-xs-6" >';
            inlineQty += '<button type="button" id="generateInvoice" class="btn btn-primary" onclick="pdfLoad()">Generate Invoice</button>';
            inlineQty += '</div>';
            inlineQty += '</div>';
            inlineQty += '';

            return inlineQty;
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