/**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
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


/**************************
 *  
 *  Workflow: Code Edition
 *  
 **************************
* 
* User Input:
* 
* 1. Accounts Selects Zee to View. Customer dropdown appears
* 2. Accounts Selects Parent Consolidation Customer - Search = 2722
* 3. User Selects Invoice Type (Branch, Invoice Type, State, Multi-Parent)
* 4. User clicks Generate Invoice
*  
* 
*  Script Output:
*  1. Generate Invoice
*/
define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function (error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }

        var role = runtime.getCurrentUser().role;
        var ctx = runtime.getCurrentScript();
        var currRec = currentRecord.get();

        // var invDataSet = [];
        var csvTableSet = [];
        var csvDataSet = [];

        var csvBillSet = [];
        var csvTaxSet = [];
        var csvOrder = []

        var invDataSet = JSON.parse(JSON.stringify([]));

        var load_record_interval;

        var consol_method_id = currRec.getValue({
            fieldId: 'custpage_consol_inv_method_id'
        });
        var consol_method = '';
        if (!isNullorEmpty(consol_method_id)) {
            consol_method_id = parseInt(consol_method_id);
            console.log('Method ID: ' + consol_method_id)
            switch (consol_method_id) {
                case 1:
                    consol_method = 'Branch';
                    break;
                case 2:
                    consol_method = 'State';
                    break;
                case 3:
                    consol_method = 'Invoice Type';
                    break;
                case 4:
                    consol_method = 'Multi-Parent';
                    break;
            }
        }
        console.log('Method: ' + consol_method)
        var period = currRec.getValue({
            fieldId: 'custpage_consol_inv_period'
        });
        // if (!isNullorEmpty(period)){
        //     period = parseInt(period);
        // };

        /**
         * On page initialisation
         */
        function pageInit() {
            // Background-Colors
            $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            $("#body").css("background-color", "#CFE0CE");
            $("#tr_submitter").css("margin-left", "10px");

            // // Hide Netsuite Submit Button
            $('#submitter').css("background-color", "#CFE0CE");
            $('#submitter').hide();
            $('#tbl_submitter').hide();

            /**
             *  Click for Instructions Section Collapse
             */
            // $('.collapse').on('shown.bs.collapse', function () {
            //     $("#invTypeDropdownSection").css("padding-top", "500px");
            // });
            // $('.collapse').on('hide.bs.collapse', function () {
            //     $("#invTypeDropdownSection").css("padding-top", "0px");
            // });

            $('#method_dropdown').val(consol_method_id)

            $(document).on('change', '#method_dropdown', function () {
                consol_method_id = $(this).val();
                var params = {
                    method: consol_method_id,
                    period: period
                }
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_consol_inv', scriptId: 'customscript_sl_consol_inv' }) + '&custparam_params=' + params;
                currRec.setValue({ fieldId: 'custpage_consol_inv_method_id', value: consol_method_id });
                window.location.href = upload_url
            });

            $('#generateInvoice').click(function () {
                $('#downloadExcel').removeClass('hide'); // Excel Download Button.
                $('.generateInvoiceSection').removeClass('hide');
                $('#inv_preview').show();

                if (consol_method_id == 1) { // Branch
                    var dataTable = $('#inv_preview').DataTable({
                        data: invDataSet,
                        pageLength: 100,
                        order: [
                            [0, 'asc'] // , [2, 'asc']
                        ],
                        columns: [
                            { title: 'Matched Parent' }, //0
                            // { title: 'State' },
                            { title: 'Location' },
                            { title: 'Type' },
                            { title: 'Item' },
                            { title: 'Details' },
                            { title: 'Ref#' },
                            { title: 'Qty' },
                            { title: 'Rate' },
                            { title: 'Amount' },
                            { title: 'GST' },
                            { title: 'Gross' }
                        ],
                    });
                } else if (consol_method_id == 2) { // State
                    var dataTable = $('#inv_preview').DataTable({
                        data: invDataSet,
                        pageLength: 100,
                        order: [
                            [0, 'asc'], [2, 'asc']
                        ],
                        columns: [
                            { title: 'Matched Parent-1' }, // 00
                            { title: 'Matched Parent-2' },//1
                            { title: 'State' }, // 2
                            { title: 'Location' }, // 3
                            // { title: 'Type' }, // 4
                            { title: 'Item' }, // 5
                            { title: 'Details' }, // 6
                            { title: 'Ref#' }, // 7
                            { title: 'Qty' }, // 8
                            { title: 'Rate' }, // 9
                            { title: 'Amount' }, // 10
                            { title: 'GST' }, // 11
                            { title: 'Gross' } // 12  
                        ],
                        // columnDefs: [
                        //     {
                        //         target: [11, 12],
                        //         visible: false
                        //     }
                        // ],
                        autoWidth: false,
                        responsive: true,
                    });
                } else if (consol_method_id == 3) { // Invoice Type
                    var dataTable = $('#inv_preview').DataTable({
                        data: invDataSet,
                        pageLength: 100,
                        order: [
                            [0, 'asc'], [2, 'asc']
                        ],
                        columns: [
                            { title: 'Matched Parent' },
                            // { title: 'State' }, // 0
                            { title: 'Location' }, // 1
                            { title: 'Type' }, // 2
                            { title: 'Item' }, // 3
                            { title: 'Details' }, // 4
                            { title: 'Ref#' }, // 5
                            { title: 'Qty' }, // 6 
                            { title: 'Rate' }, // 7
                            { title: 'Amount' }, // 8
                            { title: 'GST' }, // 9
                            { title: 'Gross' } // 10,
                            // 11
                            // 12 Company ID
                        ],
                    });
                } else if (consol_method_id == 4) { // Multi-Parent
                    var dataTable = $('#inv_preview').DataTable({
                        data: invDataSet,
                        pageLength: 100,
                        // order: [
                        //     [0, 'asc'], [2, 'asc']
                        // ],
                        columns: [
                            { title: 'Matched Parent-1' }, //0
                            { title: 'Matched Parent-2' },//1
                            { title: 'State' },//2
                            { title: 'Location' },//3
                            // { title: 'Type' },//4
                            { title: 'Item' },//5
                            { title: 'Details' },//6
                            { title: 'Ref#' },//7
                            { title: 'Qty' },//8
                            { title: 'Rate' },//9
                            { title: 'Amount' },//10
                            { title: 'GST' },//11
                            { title: 'Gross' }//12
                        ],
                    });
                }

                // if (consol_method_id == 4) {
                loadInvRecord(consol_method_id);
                // } else {
                // loadMultiParentScript(consol_method_id, period);
                // }
            });

            // $('#downloadAsPDF').click(function () {
            //     downloadPDF();
            // });

            $('#downloadExcel').click(function () {
                downloadCsv();
            });

            $(document).on('click', '.downloadCompExcel', function () {
                var company_number = $(this).id();

            })

            // $('.downloadPDF').click(function () {
            //     var cust_id = $(this).attr("id");
            //     console.log('Cust ID ' + cust_id);

            //     currRec.setValue({ fieldId: 'custpage_consol_inv_custid', value: cust_id });
            //     if (!isNullorEmpty(sub_custid)) {
            //         currRec.setValue({ fieldId: 'custpage_consol_inv_sub_custid', value: sub_custid });
            //     }
            //     saveExcel(cust_id);
            // });
        }

        function loadInvRecord(consol_method_id) {
            console.log('Load Record Table');

            var csvBillSet = [];
            var csvTaxSet = [];
            var csvTotalSet = [];
            var csvOrder = []

            var invDataSet = JSON.parse(JSON.stringify([]));

            // var amount, gst, gross;
            var tot_rate = 0;
            var sub_total = 0;
            var tot_GST = 0;
            var total = 0;
            var tot_rate_index = 1;

            //State
            var state_tot_rate = 0;
            var state_sub_total = 0;
            var state_tot_GST = 0;
            var state_total = 0;
            var state_tot_rate_index = 1;

            //Branch
            var branch_tot_rate = 0;
            var branch_sub_total = 0;
            var branch_tot_GST = 0;
            var branch_total = 0;
            var branch_tot_rate_index = 1;

            //Type
            var type_tot_rate = 0;
            var type_sub_total = 0;
            var type_tot_GST = 0;
            var type_total = 0;
            var type_tot_rate_index = 1;

            if (consol_method_id == 1) {
                var consolInvItemSearch = search.load({
                    type: 'invoice',
                    id: 'customsearch_consol_inv_lineitem_2'
                });
            } else if (consol_method_id == 2) {
                var consolInvItemSearch = search.load({
                    type: 'invoice',
                    id: 'customsearch_consol_inv_lineitem_3'
                });
            } else if (consol_method_id == 3) {
                var consolInvItemSearch = search.load({
                    type: 'invoice',
                    id: 'customsearch_consol_inv_lineitem_4'
                });
            }
            else if (consol_method_id == 4) {
                var consolInvItemSearch = search.load({
                    type: 'customer',
                    id: 'customsearch_consol_inv_custinv_multi'
                });
            }

            // console.log('Consolidation Method ID: ' + parseInt(consol_method_id));
            if (consol_method_id == 1 || consol_method_id == 3){
                consolInvItemSearch.filters.push(search.createFilter({
                    name: 'custentity_inv_consolidation_mtd',
                    join: 'customer',
                    operator: search.Operator.ANYOF,
                    values: parseInt(consol_method_id)
                }));
                if (consol_method_id) {
                    consolInvItemSearch.columns.push(search.createColumn({
                        name: "formulatext",
                        formula: "{customer.parent}",
                        label: "Formula (Text)",
                        sort: search.Sort.ASC
                    }));
                }
            } else {
                if (consol_method_id == 4){
                    consolInvItemSearch.filters.push(search.createFilter({
                        name: 'custentity_inv_consolidation_mtd',
                        operator: search.Operator.ANYOF,
                        values: parseInt(consol_method_id)
                    }));  
                } else {
                    consolInvItemSearch.filters.push(search.createFilter({
                        name: 'custentity_inv_consolidation_mtd',
                        join: 'customer',
                        operator: search.Operator.ANYOF,
                        values: parseInt(consol_method_id)
                    }));
                }
            }

            var consolInvItemResultsLength = consolInvItemSearch.runPaged().count; // console.log('Result Length: ' + consolInvItemResultsLength);
            var consolInvItemResults = consolInvItemSearch.run().getRange({ start: 240, end: 250 });
            // console.log('Results: ' + JSON.parse(JSON.stringify(consolInvItemResults)));
            var company_name_set = [];
            var location_name_set = [];
            var branch_name_set = [];
            var state_name_set = [];
            var type_name_set = [];
            var subparent_name_set = []
            var invoice_set = [];

            var index = 0;
            consolInvItemResults.forEach(function (line_item) {
                console.log('_________________________________________')
                console.log('Index Value: ' + index);

                if (consol_method_id == 1 || consol_method_id == 3) { // If Branch and Invoice Type, Use Search Get Result Type 1. Else use Search Get Result Type 2 
                    var gross = line_item.getValue({ name: "formulacurrency", formula: '{amount}+{taxamount}' });
                    if (gross == 0 || gross == '0.00' || gross == '.00') {
                        return true;
                    }

                    var invoice_id = line_item.getValue({ name: 'internalid' });
                    console.log('Invoice ID: ' + invoice_id)
                    invoice_set.push(invoice_id);
                    var cust_id = line_item.getValue({ name: 'internalid', join: 'customer' });

                    var subCustRecord = record.load({ type: 'customer', id: cust_id });
                    var sub_parent_id = subCustRecord.getValue({ fieldId: 'parent' })
                    var SubParentRecord = record.load({ type: 'customer', id: sub_parent_id });
                    var sub_parent_name = SubParentRecord.getValue({ fieldId: 'companyname' });
                    console.log('Sub Parent: ' + sub_parent_name);


                    if (index == 0) {
                        subparent_name_set.push(sub_parent_name);
                    }


                    // var type = line_item.getValue({ name: 'formulatext_1', formula: "DECODE({custbody_inv_type},'','Service','AP Products','Product',{custbody_inv_type})" });
                    var type = line_item.getText({ name: 'custbody_inv_type' });
                    if (isNullorEmpty(type)) {
                        type = 'Service';
                    }


                    var company_name = line_item.getValue({ name: "formulatext", formula: '{customer.parent}' });
                    console.log('Company Name: ' + company_name);
                    var company_id = company_name.split(" ")[0];
                    var company_id_length = parseInt(company_name.split(" ")[0].length);
                    company_name = company_name.slice(company_id_length + 1);

                    if (index == 0) {
                        company_name_set.push(company_name);
                        // csvTaxSet.push(["Date* " + date + '\n' + "Invoice #" + invoice_code + '\n' + 'Due Date ' + due_date + '\n' + 'ABN ' + abn + '\n' + 'Customer PO# ' + po_box + '\n' + 'Services From ' + service_from + '\n' + 'Services To ' + service_to + '\n' + 'Terms ' + terms]);
                        // csvBillSet.push([billaddress]);
                    }

                    /**
                     *  Tax Invoice Header
                     */
                    var date = line_item.getValue({ name: 'trandate' });
                    var date_object = new Date();
                    //Invoice Number - Code + Year Number + Month Number (ie: 'CODE'2104)
                    var location = line_item.getValue({ name: 'companyname', join: 'customer' });
                    var year = JSON.stringify(date_object.getFullYear()).split('');
                    var year_code = year[2] + year[3];
                    var month = date_object.getMonth();
                    if (month < 10) {
                        var month_code = '0' + month;
                    } else {
                        var month_code = month;
                    }
                    var name_match = JSON.stringify(location).match(/\b(\w)/g);
                    var name_code = name_match.join('');
                    var invoice_code = name_code + year_code + month_code

                    var due_date = line_item.getValue({ name: 'duedate' })
                    var abn = '45 609 801 194'; // MailPlus ABN
                    //var abn = line_item.getValue({ name: 'custbody_franchisee_abn'} });
                    var po_box = line_item.getValue({ name: 'custentity11', join: 'customer' });
                    var service_from = line_item.getValue({ name: 'custbody_inv_date_range_from' });
                    // service_from = date_from;
                    var service_to = line_item.getValue({ name: 'custbody_inv_date_range_to' });
                    // service_to = date_to;
                    var terms = line_item.getValue({ name: 'terms' });

                    /**
                     *  Bill To Header
                     */
                    var billaddress = line_item.getValue({ name: 'billaddress' });

                    // if (company_name_set.indexOf(company_name) == -1) {

                    // }

                    /**
                     *  Table
                     */
                    // var location = line_item.getValue({ name: 'billaddressee' }); // companyname
                    location_name_set.push(location);

                    var item_id = line_item.getValue({ name: 'item' });
                    var item = '';
                    // Item Record
                    if (!isNullorEmpty(item_id)) {
                        console.log('Item ID: ' + item_id + "\n" + 'Item Type: ' + type)
                        var service_type = '';
                        if (type == 'MPEX Products' || parseInt(item_id) == 108) {
                            service_type = "noninventoryitem";
                        } else {
                            service_type = 'serviceitem'
                        }
                        var itemRecord = record.load({
                            type: service_type,
                            id: item_id
                        });
                        if (!isNullorEmpty(itemRecord)) {
                            item = itemRecord.getValue({ fieldId: 'itemid' });
                        }
                        console.log('item: ' + item)
                    }
                    //  var item = 'Counter Bankings';
                    var details = line_item.getText({ name: 'custcol1' });

                    var ref_val = line_item.getValue({ name: 'tranid' })
                    var upload_url_inv = '/app/accounting/transactions/custinvc.nl?id=';
                    var ref = '<a href="' + baseURL + upload_url_inv + invoice_id + '" target="_blank">' + ref_val + '</a>';
                    var qty = line_item.getValue({ name: 'quantity' })
                    var rate = line_item.getValue({ name: 'rate' });
                    if (isNullorEmpty(rate)){
                        rate = 0;
                    }
                    var amount = line_item.getValue({ name: 'amount' });
                    var gst = line_item.getValue({ name: 'taxamount' });

                    // var state = line_item.getValue({ name: 'billstate' }); // location
                    var state = line_item.getText({ name: 'location', join: 'custbody_franchisee' });
                    console.log('State: ' + state)
                    if (index == 0) {
                        state_name_set.push(state);
                        branch_name_set.push(location);

                        csvOrder.push(invoice_code);
                    }
                    // if (state_tot_rate_index == 1) {
                    //     state_name_set.push(state);
                    // }
                    if (branch_tot_rate_index == 1) {
                        branch_name_set.push(location);
                    }
                    if (type_tot_rate_index == 1) {
                        type_name_set.push(type);
                    }

                    if (company_name_set.indexOf(company_name) != -1) {
                        tot_rate += parseFloat(rate.replace(/[]/g, '') * 1);
                        tot_rate_index++;
                        if (!isNullorEmpty(amount)) {
                            // console.log('Amount' + amount)
                            sub_total += parseFloat(amount.replace(/[]/g, '') * 1);
                            // console.log('Sub Total' + sub_total)
                        }
                        tot_GST += parseFloat(gst.replace(/[]/g, '') * 1);
                        total += parseFloat(gross.replace(/[]/g, '') * 1);
                    }

                    if (isNullorEmpty(gross)) {
                        type += ' Total'
                    }
                } else {
                    var gross = line_item.getValue({ name: "formulacurrency", formula: '{transaction.amount}+{transaction.taxamount}' });
                    if (gross == 0 || gross == '0.00' || gross == '.00') {
                        return true;
                    }

                    var invoice_id = line_item.getValue({ name: 'internalid', join: "transaction" });
                    invoice_set.push(invoice_id);

                    var sub_parent_name = line_item.getValue({ name: 'companyname', join: 'parentCustomer' });
                    console.log('Sub Parent: ' + sub_parent_name);

                    if (index == 0) {
                        subparent_name_set.push(sub_parent_name);
                    }

                    // var type = line_item.getValue({ name: 'formulatext_1', formula: "DECODE({custbody_inv_type},'','Service','AP Products','Product',{custbody_inv_type})" });
                    var type = line_item.getText({ name: 'custbody_inv_type', join: "transaction" });
                    if (isNullorEmpty(type)) {
                        type = 'Service';
                    }


                    var company_name = line_item.getValue({ name: "formulatext", formula: '{parent}' });
                    console.log('Company Name: ' + company_name);
                    var company_id = company_name.split(" ")[0];
                    var company_id_length = parseInt(company_name.split(" ")[0].length);
                    company_name = company_name.slice(company_id_length + 1);

                    if (index == 0) {
                        company_name_set.push(company_name);
                        // csvTaxSet.push(["Date* " + date + '\n' + "Invoice #" + invoice_code + '\n' + 'Due Date ' + due_date + '\n' + 'ABN ' + abn + '\n' + 'Customer PO# ' + po_box + '\n' + 'Services From ' + service_from + '\n' + 'Services To ' + service_to + '\n' + 'Terms ' + terms]);
                        // csvBillSet.push([billaddress]);
                    }

                    /**
                     *  Tax Invoice Header
                     */
                    // var date = line_item.getValue({ name: 'trandate' });
                    // var date_object = new Date();
                    // //Invoice Number - Code + Year Number + Month Number (ie: 'CODE'2104)
                    var location = line_item.getValue({ name: 'companyname'});
                    // var year = JSON.stringify(date_object.getFullYear()).split('');
                    // var year_code = year[2] + year[3];
                    // var month = date_object.getMonth();
                    // if (month < 10) {
                    //     var month_code = '0' + month;
                    // } else {
                    //     var month_code = month;
                    // }
                    // var name_match = JSON.stringify(location).match(/\b(\w)/g);
                    // var name_code = name_match.join('');
                    // var invoice_code = name_code + year_code + month_code

                    // var due_date = line_item.getValue({ name: 'duedate' })
                    // var abn = '45 609 801 194'; // MailPlus ABN
                    // //var abn = line_item.getValue({ name: 'custbody_franchisee_abn'} });
                    // var po_box = line_item.getValue({ name: 'custentity11', join: 'customer' });
                    // var service_from = line_item.getValue({ name: 'custbody_inv_date_range_from' });
                    // // service_from = date_from;
                    // var service_to = line_item.getValue({ name: 'custbody_inv_date_range_to' });
                    // // service_to = date_to;
                    // var terms = line_item.getValue({ name: 'terms' });

                    /**
                     *  Bill To Header
                     */
                    var billaddress = line_item.getValue({ name: 'billaddress', join: "transaction" });

                    /**
                     *  Table
                     */
                    // var location = line_item.getValue({ name: 'billaddressee' }); // companyname
                    location_name_set.push(location);

                    var item_id = line_item.getValue({ name: 'item', join: "transaction" });
                    var item = '';
                    // Item Record
                    if (!isNullorEmpty(item_id)) {
                        var service_type = '';
                        if (type == 'MPEX Products') {
                            service_type = "noninventoryitem";
                        } else {
                            service_type = 'serviceitem'
                        }
                        var itemRecord = record.load({
                            type: service_type,
                            id: item_id
                        });
                        if (!isNullorEmpty(itemRecord)) {
                            item = itemRecord.getValue({ fieldId: 'itemid' });
                        }
                        console.log('item: ' + item)
                    }
                    //  var item = 'Counter Bankings';
                    var details = line_item.getText({ name: 'custcol1', join: "transaction" });

                    var ref_val = line_item.getValue({ name: 'tranid', join: "transaction" })
                    var upload_url_inv = '/app/accounting/transactions/custinvc.nl?id=';
                    var ref = '<a href="' + baseURL + upload_url_inv + invoice_id + '" target="_blank">' + ref_val + '</a>';
                    var qty = line_item.getValue({ name: 'quantity', join: "transaction" })
                    var rate = line_item.getValue({ name: 'rate', join: "transaction" })
                    if (isNullorEmpty(rate)){
                        rate = 0;
                    }
                    var amount = line_item.getValue({ name: 'amount', join: "transaction" });
                    var gst = line_item.getValue({ name: 'taxamount', join: "transaction" });

                    // var state = line_item.getValue({ name: 'billstate' }); // location
                    var state = line_item.getText({ name: 'location', join: 'partner' });   
                    console.log('State: ' + state)
                    if (index == 0) {
                        state_name_set.push(state);
                        branch_name_set.push(location);

                        csvOrder.push(invoice_code);
                    }
                    // if (state_tot_rate_index == 1) {
                    //     state_name_set.push(state);
                    // }
                    if (branch_tot_rate_index == 1) {
                        branch_name_set.push(location);
                    }
                    if (type_tot_rate_index == 1) {
                        type_name_set.push(type);
                    }

                    if (company_name_set.indexOf(company_name) != -1) {
                        tot_rate += parseFloat(rate.replace(/[]/g, '') * 1);
                        tot_rate_index++;
                        if (!isNullorEmpty(amount)) {
                            // console.log('Amount' + amount)
                            sub_total += parseFloat(amount.replace(/[]/g, '') * 1);
                            // console.log('Sub Total' + sub_total)
                        }
                        tot_GST += parseFloat(gst.replace(/[]/g, '') * 1);
                        total += parseFloat(gross.replace(/[]/g, '') * 1);
                    }

                    if (isNullorEmpty(gross)) {
                        type += ' Total'
                    }
                }

                /**
                 *  BRANCH
                 *  if Location Name is Same {
                 *      Calcuate Totals
                 *  }   else {
                 *      Push Totals Line with Total Amount
                 *      Push New Line
                 *  }
                 */
                /**
                 *  STATE
                 * If Location Name is Same{
                 * Each Interation  
                 *  if State is the same {
                 *      Increment amount per customer. return true;
                 *  } else If state is different {
                 *      Push New State Value & Push State & Total Clear Previous Total Values Prior to Pushing Normal Value of New Element
                 *  }
                 * }else if location name is different {
                 * 
                 * }
                 * 
                 * if Company Name is Different, But State length = 1 {
                 *      Push New State Value & Push State Total Clear Previous Values
                 * }
                 */
                /**
                 *  INVOICE TYPE
                 *  if (location same){
                 *      if (service is same){
                 *          Increment amount
                 *      } else {
                 *          Push new invoice_type and totals
                 *      }
                 *  }
                 */
                if (consol_method_id == 1) { // Branch
                    if (branch_name_set.indexOf(location) != -1) {
                        branch_tot_rate += parseFloat(rate.replace(/[]/g, '') * 1);
                        branch_tot_rate_index++;
                        if (!isNullorEmpty(amount)) {
                            // console.log('Branch: Amount' + amount);
                            branch_sub_total += parseFloat(amount.replace(/[]/g, '') * 1);
                            // console.log('Branch: Sub Total' + sub_total);
                        }
                        branch_tot_GST += parseFloat(gst.replace(/[]/g, '') * 1);
                        branch_total += parseFloat(gross.replace(/[]/g, '') * 1);
                    } else {
                        // if (branch_tot_rate_index != 1 || branch_tot_rate_index != 0) {
                        branch_name_set.push(location);

                        branch_tot_rate = (branch_tot_rate / branch_tot_rate_index);
                        branch_tot_rate = branch_tot_rate.toFixed(2);
                        branch_sub_total = branch_sub_total.toFixed(2);
                        branch_tot_GST = branch_tot_GST.toFixed(2);
                        branch_total = branch_total.toFixed(2);

                        // console.log('Branch Function: Branch ' + company_name);
                        // console.log('Branch Function: Index ' + branch_name_set.indexOf(company_name))
                        // console.log('Branch Function: List ' + JSON.stringify(branch_name_set));

                        var branch_list_length = branch_name_set.length;
                        if (branch_list_length <= 1) {
                            var previous_branch_name = branch_name_set[branch_list_length - 1];
                        } else {
                            var previous_branch_name = branch_name_set[branch_list_length - 2];
                        }
                        // console.log('Branch Function: Pre-State Name ' + previous_branch_name);
                        var list_length = company_name_set.length;
                        var previous_company_name = company_name_set[list_length - 1];

                        if (branch_tot_rate_index >= 1) {
                            invDataSet.push(['', previous_branch_name + ' Total', '', '', '', '', '', branch_tot_rate, branch_sub_total, branch_tot_GST, branch_total]) //'', 
                            csvTableSet.push(['', previous_branch_name + ' Total', '', '', '', '', '', branch_tot_rate, branch_sub_total, branch_tot_GST, branch_total]) //'', 
                        } else {
                            invDataSet.push([previous_company_name, previous_branch_name + ' Total', '', '', '', '', '', branch_tot_rate, branch_sub_total, branch_tot_GST, branch_total]) //'', 
                            csvTableSet.push([previous_company_name, previous_branch_name + ' Total', '', '', '', '', '', branch_tot_rate, branch_sub_total, branch_tot_GST, branch_total]) //'', 
                        }
                        if (branch_tot_rate_index != 1) {
                            csvTableSet.push(['', '', '', '', '', '', '', '', '', '', '', '']);
                        }

                        // branch_name_set = [];
                        branch_tot_rate_index = 1;
                        branch_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                        branch_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                        branch_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                        branch_total = parseFloat(gross.replace(/[]/g, '') * 1);
                        // }
                    }
                } else if (consol_method_id == 2 || consol_method_id == 4) {
                    console.log('Sub-Parent Array: ' + JSON.stringify(subparent_name_set));
                    console.log('Sub-Parent Index: ' + subparent_name_set.indexOf(sub_parent_name));
                    // if (company_name_set.indexOf(company_name) != -1) { // if Company Name is in the list.
                    if (subparent_name_set.indexOf(sub_parent_name) != -1) { // if Sub-Company Name is in the list.
                        console.log('AONFPIAJWNEFUPBAWIDB AWD');

                        console.log('State Index: ' + state_name_set.indexOf(state));
                        console.log('State Array: ' + state_name_set)
                        console.log('Sub-Parent Index: ' + subparent_name_set.indexOf(sub_parent_name));

                        if (state_name_set.indexOf(state) != -1) { // If State is in the list. Increment total amount
                            state_tot_rate += parseFloat(rate.replace(/[]/g, '') * 1);
                            state_tot_rate_index++;
                            if (!isNullorEmpty(amount)) {
                                console.log('State: Amount' + amount);
                                state_sub_total += parseFloat(amount.replace(/[]/g, '') * 1);
                                console.log('State: Sub Total' + sub_total);
                            }
                            state_tot_GST += parseFloat(gst.replace(/[]/g, '') * 1);
                            state_total += parseFloat(gross.replace(/[]/g, '') * 1);
                        } else { // If state is not in the list, push new state, and push total data above.
                            console.log('State: New State');
                            state_name_set.push(state);

                            state_tot_rate = (state_tot_rate / state_tot_rate_index);
                            state_tot_rate = state_tot_rate.toFixed(2);
                            state_sub_total = state_sub_total.toFixed(2);
                            state_tot_GST = state_tot_GST.toFixed(2);
                            state_total = state_total.toFixed(2);

                            console.log('State Function: State ' + state);
                            console.log('State Function: Index ' + state_name_set.indexOf(state))
                            console.log('State Function: List ' + JSON.stringify(state_name_set));

                            var state_list_length = state_name_set.length;
                            if (state_list_length <= 1) {
                                var previous_state_name = state_name_set[state_list_length - 1];
                            } else {
                                var previous_state_name = state_name_set[state_list_length - 2];
                            }
                            console.log('State Function: Pre-State Name ' + previous_state_name);

                            var list_length = company_name_set.length;
                            var previous_company_name = company_name_set[list_length - 1];

                            var sub_parent_list_length = subparent_name_set.length;
                            var previous_sub_parent_name = subparent_name_set[sub_parent_list_length - 1];

                            console.log('State Function: Sub-Parent Name ' + previous_sub_parent_name);
                            console.log('State Function: Sub-Parent Array ' + JSON.stringify(subparent_name_set));

                            invDataSet.push([previous_company_name, previous_sub_parent_name, previous_state_name + ' Total', '', '', '', '', '', state_tot_rate, state_sub_total, state_tot_GST, state_total]) //'',
                            csvTableSet.push([previous_company_name, previous_sub_parent_name, previous_state_name + ' Total', '', '', '', '', '', state_tot_rate, state_sub_total, state_tot_GST, state_total]) //'',
                            csvTableSet.push(['', '', '', '', '', '', '', '', '', '', '', '']); //'',

                            // state_name_set = [];
                            state_tot_rate_index = 1;
                            state_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                            state_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                            state_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                            state_total = parseFloat(gross.replace(/[]/g, '') * 1);
                        }
                    } else if (invoice_set.indexOf(invoice_id) == -1) { // Sub-Parent is new  but state 
                        console.log('State: Different Sub-Parent');
                        console.log('State: Start State');

                        state_tot_rate = (state_tot_rate / state_tot_rate_index);
                        state_tot_rate = state_tot_rate.toFixed(2);
                        state_sub_total = state_sub_total.toFixed(2);
                        state_tot_GST = state_tot_GST.toFixed(2);
                        state_total = state_total.toFixed(2);

                        console.log('State End: State ' + state);
                        console.log('State End: Index ' + state_name_set.indexOf(state))
                        console.log('State End: List ' + JSON.stringify(state_name_set));

                        var state_list_length = state_name_set.length;
                        var previous_state_name = state_name_set[state_list_length - 1];
                        console.log('State End: Pre-State Name First ' + previous_state_name);
                        var list_length = company_name_set.length;
                        var previous_company_name = company_name_set[list_length - 1];

                        var sub_parent_list_length = subparent_name_set.length;
                        var previous_sub_parent_name = subparent_name_set[sub_parent_list_length - 1];
                        console.log('State End: Sub-Parent Name ' + previous_sub_parent_name);
                        console.log('State End: Sub-Parent Array ' + subparent_name_set);

                        var company_number = company_name_set.indexOf(company_name);

                        invDataSet.push([previous_company_name, previous_sub_parent_name, previous_state_name + ' Total', '', '', '', '', '<div class="col-xs-4"><input type="button" id="' + company_number + '" class="form-control btn-xs btn-danger downloadCompExcel"><span class="glyphicon glyphicon-eye-close"></span>Generate Company Excel</input></div>', state_tot_rate, state_sub_total, state_tot_GST, state_total]) //'',
                        csvTableSet.push([previous_company_name, previous_sub_parent_name, previous_state_name + ' Total', '', '', '', '', '', state_tot_rate, state_sub_total, state_tot_GST, state_total]) //'', 
                        csvTableSet.push(['', '', '', '', '', '', '', '', '', '', '', '']); //'',

                        state_name_set = [];
                        state_tot_rate_index = 1;
                        state_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                        state_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                        state_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                        state_total = parseFloat(gross.replace(/[]/g, '') * 1);

                        subparent_name_set.push(sub_parent_name);
                    }
                } else if (consol_method_id == 3) {
                    if (company_name_set.indexOf(company_name) != -1) {
                        if (location_name_set.indexOf(location) != -1) {
                            if (type_name_set.indexOf(type) != -1) {
                                type_tot_rate += parseFloat(rate.replace(/[]/g, '') * 1);
                                type_tot_rate_index++;
                                if (!isNullorEmpty(amount)) {
                                    console.log('type: Amount' + amount);
                                    type_sub_total += parseFloat(amount.replace(/[]/g, '') * 1);
                                    console.log('type: Sub Total' + sub_total);
                                }
                                type_tot_GST += parseFloat(gst.replace(/[]/g, '') * 1);
                                type_total += parseFloat(gross.replace(/[]/g, '') * 1);
                            } else {
                                console.log('type: New type');
                                type_name_set.push(type);

                                type_tot_rate = (type_tot_rate / type_tot_rate_index);
                                type_tot_rate = type_tot_rate.toFixed(2);
                                type_sub_total = type_sub_total.toFixed(2);
                                type_tot_GST = type_tot_GST.toFixed(2);
                                type_total = type_total.toFixed(2);

                                console.log('type Function: type ' + type);
                                console.log('type Function: Index ' + type_name_set.indexOf(type))
                                console.log('type Function: List ' + JSON.stringify(type_name_set));

                                var type_list_length = type_name_set.length;
                                if (type_list_length <= 1) {
                                    var previous_type_name = type_name_set[type_list_length - 1];
                                } else {
                                    var previous_type_name = type_name_set[type_list_length - 2];
                                }
                                console.log('type Function: Pre-type Name ' + previous_type_name);
                                var list_length = company_name_set.length;
                                var previous_company_name = company_name_set[list_length - 1];

                                var branch_list_length = branch_name_set.length;
                                if (branch_list_length <= 1) {
                                    var previous_branch_name = branch_name_set[branch_list_length - 1];
                                } else {
                                    var previous_branch_name = branch_name_set[branch_list_length - 2];
                                }

                                invDataSet.push([previous_company_name, '', previous_type_name + ' Total', '', '', '', '', type_tot_rate, type_sub_total, type_tot_GST, type_total]) //'', 
                                csvTableSet.push([previous_company_name, '', previous_type_name + ' Total', '', '', '', '', type_tot_rate, type_sub_total, type_tot_GST, type_total]) //'',

                                // type_name_set = [];
                                type_tot_rate_index = 1;
                                type_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                                type_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                                type_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                                type_total = parseFloat(gross.replace(/[]/g, '') * 1);
                            }
                        }
                    }
                    if (company_name_set.indexOf(company_name) == -1 && type_name_set.indexOf(type) == 0) {
                        console.log('type: End type');
                        // type_name_set.push(type);
                        type_tot_rate = (type_tot_rate / type_tot_rate_index);
                        type_tot_rate = type_tot_rate.toFixed(2);
                        type_sub_total = type_sub_total.toFixed(2);
                        type_tot_GST = type_tot_GST.toFixed(2);
                        type_total = type_total.toFixed(2);

                        console.log('type End: type ' + type);
                        console.log('type End: Index ' + type_name_set.indexOf(type))
                        console.log('type End: List ' + JSON.stringify(type_name_set));

                        var type_list_length = type_name_set.length;
                        var previous_type_name = type_name_set[type_list_length - 1];
                        console.log('type End: Pre-type Name First ' + previous_type_name);

                        var state_list_length = state_name_set.length;
                        var previous_state_name = state_name_set[state_list_length - 1];

                        var list_length = company_name_set.length;
                        var previous_company_name = company_name_set[list_length - 1];

                        var location_list_length = location_name_set.length;
                        var previous_location_name = location_name_set[location_list_length - 1]

                        invDataSet.push([previous_company_name, '', previous_type_name + ' Total', '', '', '', '', type_tot_rate, type_sub_total, type_tot_GST, type_total]) //'',
                        csvTableSet.push([previous_company_name, '', previous_type_name + ' Total', '', '', '', '', type_tot_rate, type_sub_total, type_tot_GST, type_total]) //'',
                        csvTableSet.push(['', '', '', '', '', '', '', '', '', '', '', '']);

                        type_name_set = [];
                        type_tot_rate_index = 1;
                        type_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                        type_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                        type_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                        type_total = parseFloat(gross.replace(/[]/g, '') * 1);
                    }
                }

                console.log('State Index Outside of Loops: ' + state_name_set.indexOf(state));

                if ((company_name_set.indexOf(company_name) == -1 && index != 0) || index == (consolInvItemResultsLength - 1)) { // When Company Name is New
                    /**
                     * Totals
                     */
                    tot_rate = (tot_rate / tot_rate_index);
                    tot_rate = tot_rate.toFixed(2);
                    sub_total = sub_total.toFixed(2);
                    tot_GST = tot_GST.toFixed(2);
                    total = total.toFixed(2);

                    var list_length = company_name_set.length;
                    console.log('Company Name Set Length: ' + list_length)
                    var previous_company_name = company_name_set[list_length - 1];
                    console.log('Load New Line' + company_name_set, company_name, tot_rate, sub_total, tot_GST, total)
                    company_name_set.push(company_name);

                    var state_list_length = state_name_set.length;
                    if (state_list_length <= 1) {
                        var previous_state_name = state_name_set[state_list_length - 1];
                    } else {
                        var previous_state_name = state_name_set[state_list_length - 2];
                    }

                    // csvTaxSet.push(["Date* " + date +'\n'+  "Invoice #" + invoice_code +'\n'+ 'Due Date ' + due_date +'\n'+ 'ABN ' + abn +'\n'+ 'Customer PO# ' + po_box +'\n'+ 'Services From ' + service_from +'\n'+ 'Services To ' + service_to +'\n'+ 'Terms ' + terms]);
                    // csvBillSet.push([billaddress]);
                    // csvTotalSet.push([sub_total, tot_GST, total]);

                    if (consol_method_id == 2 || consol_method_id == 4) {
                        // var sub_parent_list_length = subparent_name_set.length;
                        // var previous_sub_parent_name = sub_parent_name[sub_parent_list_length - 1];
                        invDataSet.push([previous_company_name + ' Total', '', '', '', '', '', '', '', tot_rate, sub_total, tot_GST, total]) //'',
                        csvTableSet.push([previous_company_name + ' Total', '', '', '', '', '', '', '', tot_rate, sub_total, tot_GST, total]) //'', 
                        csvTableSet.push(['', '', '', '', '', '', '', '', '', '', '', '']); //, ''
                    } else {
                        invDataSet.push([previous_company_name + ' Total', '', '', '', '', '', '', tot_rate, sub_total, tot_GST, total]); // previous_state_name, | <button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="' + company_id + '" class="downloadPDF btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Download Company Export</button>
                        csvTableSet.push([previous_company_name + ' Total', '', '', '', '', '', '', tot_rate, sub_total, tot_GST, total]) //previous_state_name,
                        csvTableSet.push(['', '', '', '', '', '', '', '', '', '', '', '']);
                    }

                    tot_rate_index = 1;
                    tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                    sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                    tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                    total = parseFloat(gross.replace(/[]/g, '') * 1);

                    branch_name_set = [];
                    branch_tot_rate_index = 1;
                    branch_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                    branch_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                    branch_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                    branch_total = parseFloat(gross.replace(/[]/g, '') * 1);

                    state_name_set = [];
                    state_name_set.push(state);
                    state_tot_rate_index = 1;
                    if (consol_method_id == 2 || consol_method_id == 4) {
                        subparent_name_set.push(sub_parent_name);
                    }
                    state_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                    state_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                    state_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                    state_total = parseFloat(gross.replace(/[]/g, '') * 1);

                    type_name_set = [];
                    type_tot_rate_index = 1;
                    type_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                    type_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                    type_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                    type_total = parseFloat(gross.replace(/[]/g, '') * 1);
                }

                if (consol_method_id == 2 || consol_method_id == 4) { // Actual Data for that line.
                    invDataSet.push([company_name, sub_parent_name, state, location, item, details, ref, qty, rate, amount, gst, gross, company_id]); //type,
                    csvTableSet.push([company_name, sub_parent_name, state, location, item, details, ref_val, qty, rate, amount, gst, gross]) //type,
                } else {
                    invDataSet.push([company_name, location, type, item, details, ref, qty, rate, amount, gst, gross, company_id]); //state,
                    csvTableSet.push([company_name, location, type, item, details, ref_val, qty, rate, amount, gst, gross]) //state,
                }

                // if (index == consolInvItemResultsLength - 1) {
                // if (isNullorEmpty(csvDataSet)) {
                //  csvDataSet = [date, invoice_code, due_date, abn, po_box, service_from, service_to, terms, company_name, billaddress, sub_total, tot_GST, total]
                // csvDataSet.push(['', '', csvTableSet]);
                // }
                // }

                // csvOrder.push(invoice_code); // Pass through index of Company.
                // csvTaxSet.push(["Date* " + date + '\n' + "Invoice #" + invoice_code + '\n' + 'Due Date ' + due_date + '\n' + 'ABN ' + abn + '\n' + 'Customer PO# ' + po_box + '\n' + 'Services From ' + service_from + '\n' + 'Services To ' + service_to + '\n' + 'Terms ' + terms]);
                // csvBillSet.push([billaddress]);
                // csvTotalSet.push([csvTaxSet, csvBillSet, csvTableSet])
                csvTotalSet.push(['', '', csvTableSet])

                index++;
                return true;
            });

            var datatable = $('#inv_preview').DataTable();
            datatable.clear();
            datatable.rows.add(invDataSet);
            datatable.draw();

            // if (!isNullorEmpty(csvDataSet)) {
            saveCsv(csvTableSet); //exportDataSet 
            // }

            return true;
        }

        function loadMultiParentScript(consol_method_id, period) {
            var mpSearch = search.load({ type: 'customrecord_consol_inv_json', id: 'customsearch_consol_inv_json' });
            console.log('Consol Method ID: ' + parseFloat(consol_method_id));
            mpSearch.filters.push(search.createFilter({
                name: 'custrecord_consol_inv_method',
                operator: search.Operator.IS,
                values: consol_method_id + '.0'
            }))
            var mpResults = mpSearch.run().getRange({ start: 0, end: 1 });

            mpResults.forEach(function (mpItem) {
                var mpArray = mpItem.getValue({ name: 'custrecord_consol_inv_json' });
                var mpObject = JSON.parse(mpArray);
                mpObject.sort();

                var csvArray = mpItem.getValue({ name: 'custrecord_consol_inv_csv' });
                if (!csvArray) {
                    csvArray = [];
                } else {
                    var csvObject = JSON.parse(csvArray);
                    csvObject.sort();
                }

                var datatable = $('#inv_preview').DataTable();
                datatable.clear();
                datatable.rows.add(mpObject);
                datatable.draw();

                if (!isNullorEmpty(csvObject)) {
                    console.log('CSV: ' + csvObject)
                    // saveCsv(csvObject); //exportDataSet
                    saveExcel(csvObject);
                }

            });
            // clearInterval(load_record_interval);
        }

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         * @param {Array} invDataSet The `invDataSet` created in `loadDatatable()`.
         */
        function saveCsv(csvDataSet) { //exportDataSet
            // csvDataSet = csvDataSet[0];
            var title = 'Consolidated Invoice DataTable Info';

            var headers = $('inv_preview').DataTable().columns().header().toArray().map(function (x) { return x.innerText });
            headers = headers.slice(0, headers.length - 1).join(', ');
            if (consol_method_id == 4 || consol_method_id == 2) {
                headers = ['Matched Parent-1', 'Matched Parent-2', 'State', 'Location', 'Item', 'Details', 'Ref#', 'Qty', 'Rate', 'Amount', 'Gst', 'Gross']; //'Type', 
            } else {
                headers = ['Matched Parent', 'Location', 'Type', 'Item', 'Details', 'Ref#', 'Qty', 'Rate', 'Amount', 'Gst', 'Gross'];
            }

            var csv = title;
            // csv += "\n\n";

            // console.log('CSV Data Set (STRING): ' + JSON.stringify(csvDataSet));

            csv += headers + "\n";
            csvDataSet.forEach(function (row) { // Table Data Set
                // row[0] = $.parseHTML(row[0])[0].text;
                // row[4] = financialToNumber(row[4]);
                // row[8] = "$" + row[8];
                if (consol_method_id == 2 || consol_method_id == 4) {
                    row[5] = row[5].toString().replace(/,/g, '|');
                } else {
                    row[3] = row[3].toString().replace(/,/g, ' |');
                    row[4] = row[4].toString().replace(/,/g, ' |');
                }
                csv += row.join(',');
                csv += "\n";
            });
            currRec.setValue({ fieldId: 'custpage_table_csv', value: csv })
            // downloadCsv();

            return true;
        }

        /**
         * Load the string stored in the hidden field 'custpage_table_csv'.
         * Converts it to a CSV file.
         * Creates a hidden link to download the file and triggers the click of the link.
         */
        function downloadCsv() {
            // var csv = nlapiGetFieldValue('custpage_table_csv');
            var csv = currRec.getValue({ fieldId: 'custpage_table_csv' })
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var content_type = 'text/csv';
            var csvFile = new Blob([csv], { type: content_type });
            var url = window.URL.createObjectURL(csvFile);
            var filename = 'Consolidation_Invoice_' + consol_method + '.csv';
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         * @param {Array} invDataSet The `invDataSet` created in `loadDatatable()`.
         */
        function saveExcel(csvDataSet) { //exportDataSet
            csvDataSet = csvDataSet[0];
            var title = 'Consolidated Invoice DataTable Info';

            var headers = $('inv_preview').DataTable().columns().header().toArray().map(function (x) { return x.innerText });
            headers = headers.slice(0, headers.length - 1).join(', ');
            if (consol_method_id == 4 || consol_method_id == 2) {
                headers = ['Matched Parent', 'Sub-Parent', 'State', 'Location', 'Item', 'Details', 'Ref#', 'Qty', 'Rate', 'Amount', 'Gst', 'Gross']; //'Type', 
            } else {
                headers = ['Matched Parent', 'Location', 'Type', 'Item', 'Details', 'Ref#', 'Qty', 'Rate', 'Amount', 'Gst', 'Gross'];
            }

            var csv = title;
            csv += "\n\n";

            console.log('CSV Data Set (STRING): ' + JSON.stringify(csvDataSet));

            csvDataSet[0].forEach(function (row) { // Tax Info
                csv += row;
                csv += '\n';
            });
            csv += "\n\n";
            csvDataSet[1].forEach(function (row) { // Bill Address
                csv += row;
                csv += '\n';
            });
            csv += "\n\n";

            csv += headers + "\n";
            csvDataSet[2].forEach(function (row) { // Table Data Set
                // row[0] = $.parseHTML(row[0])[0].text;
                // row[4] = financialToNumber(row[4]);
                // row[8] = "$" + row[8];
                if (consol_method_id == 2 || consol_method_id == 4) {
                    row[5] = row[5].toString().replace(/,/g, '|');
                } else {
                    row[3] = row[3].toString().replace(/,/g, ' |');
                    row[4] = row[4].toString().replace(/,/g, ' |');
                }
                csv += row.join(',');
                csv += "\n";
            });
            // csvDataSet[3].forEach(function (row) {
            //     csv += row;
            //     csv += '\n';
            // });

            currRec.setValue({ fieldId: 'custpage_table_csv', value: csv })
            // downloadCsv(csv);

            return true;
        }

        function saveRecord(context) {
            console.log('Submit Save Record');

            var cust_id = currRec.getValue({ fieldId: 'custpage_consol_inv_cust_id' });
            console.log('Submitter: Cust ID ' + cust_id);

            if (!isNullorEmpty(csvDataSet)) {
                saveExcel(csvDataSet); //exportDataSet
            }

            return true;
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        /**
         * Used to set the value of the date input fields.
         * @param   {String} date_netsuite  "1/6/2020"
         * @returns {String} date_iso       "2020-06-01"
         */
        function dateNetsuiteToISO(date_netsuite) {
            var date_iso = '';
            if (!isNullorEmpty(date_netsuite)) {
                // var date = nlapiStringToDate(date_netsuite);

                var date = date_netsuite.split('/');
                var date_day = date.getDate();
                var date_month = date.getMonth();
                var date_year = date.getFullYear();
                var date_utc = new Date(Date.UTC(date_year, date_month, date_day));
                date_iso = date_utc.toISOString().split('T')[0];
            }
            return date_iso;
        }

        return {
            pageInit: pageInit,
            // saveRecord: saveRecord,
        };
    });