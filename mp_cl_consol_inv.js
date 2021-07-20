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
     function(error, runtime, search, url, record, format, email, currentRecord) {
         var baseURL = 'https://1048144.app.netsuite.com';
         if (runtime.EnvType == "SANDBOX") {
             baseURL = 'https://1048144-sb3.app.netsuite.com';
         }

         var role = runtime.getCurrentUser().role;
         var ctx = runtime.getCurrentScript();
         var currRec = currentRecord.get();

         var invDataSet = [];
         var csvTableSet = [];
         var csvDataSet = [];

         /**
          * On page initialisation
          */
         function pageInit() {

             // $(document).ready(function(){
             //     $('.main_form').css('background-color', '#CFE0CE');
             //     $(this).css('background-color', '#CFE0CE');
             // });

             //background-colors
             $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
             $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
             $("#body").css("background-color", "#CFE0CE");

             // // Hide Netsuite Submit Button
             $('#submitter').css("background-color", "#CFE0CE");
             $('#submitter').hide();

             /**
              *  Click for Instructions Section Collapse
              */
             $('.collapse').on('shown.bs.collapse', function() {
                 $("#invTypeDropdownSection").css("padding-top", "500px");
             });
             $('.collapse').on('hide.bs.collapse', function() {
                 $("#invTypeDropdownSection").css("padding-top", "0px");
             });

             var consol_method_id = currRec.getValue({
                 fieldId: 'custpage_consol_inv_method_id'
             });
             var custid = currRec.getValue({
                 fieldId: 'custpage_consol_inv_custid'
             });
             var custname = currRec.getValue({
                 fieldId: 'custpage_consol_inv_custname'
             });
             var sub_custid = currRec.getValue({
                 fieldId: 'custpage_consol_inv_sub_custid'
             });
             var sub_subcustid = currRec.getValue({
                 fieldId: 'custpage_consol_inv_sub_subcustid'
             });
             var zee_id = currRec.getValue({
                 fieldId: 'custpage_consol_inv_zee'
             });
             var period = currRec.getValue({
                 fieldId: 'custpage_consol_inv_period'
             });
             var date_from = currRec.getValue({
                 fieldId: 'custpage_consol_inv_date_from'
             });

             var date_to = currRec.getValue({
                 fieldId: 'custpage_consol_inv_date_to'
             });

             consol_method_id = ifIsEmpty(consol_method_id);
             custid = ifIsEmpty(custid);
             sub_custid = ifIsEmpty(sub_custid);
             sub_subcustid = ifIsEmpty(sub_subcustid);
             zee_id = ifIsEmpty(zee_id);
             // console.log('Cust Name: ', custname)
             console.log('Cust ID:', custid)
             console.log('Sub Cust ID:', sub_custid)
             console.log('Zee ID:', zee_id)
             console.log('Consol Method:', consol_method_id)
                 // console.log('Period:', period)


             if (!isNullorEmpty($('#method_dropdown').val())) {
                 // $('.export_csv').removeClass('hide');

             }

             $('#method_dropdown').val(consol_method_id)
             $('#zee_dropdown').val(zee_id)
             $('#parent_dropdown').val(custid)
             $('#cust_dropdown').val(sub_custid);
             if (!isNullorEmpty($('#subcust_dropdown').val())) {
                 $('#subcust_dropdown').val(sub_subcustid);
             }
             $('#period_dropdown').val(period)

             var d = new Date();
             var getFullYear = JSON.stringify(d.getFullYear());

             // d.toISOString().split('T')[0];

             switch (parseInt($('#period_dropdown').val())) {
                 case 0:
                     date_from = getFullYear + '-01-01';
                     break;
                 case 1:
                     date_from = getFullYear + '-02-01';
                     break;
                 case 2:
                     date_from = getFullYear + '-03-01';
                     break;
                 case 3:
                     date_from = getFullYear + '-04-01';
                     break;
                 case 4:
                     date_from = getFullYear + '-05-01';
                     break;
                 case 5:
                     date_from = getFullYear + '-06-01';
                     break;
                 case 6:
                     date_from = getFullYear + '-07-01';
                     break;
                 case 7:
                     date_from = getFullYear + '-08-01';
                     break;
                 case 8:
                     date_from = getFullYear + '-09-01';
                     break;
                 case 9:
                     date_from = getFullYear + '-10-01';
                     break;
                 case 10:
                     date_from = getFullYear + '-11-01';
                     break;
                 case 11:
                     date_from = getFullYear + '-12-01';
                     break;
                     // default : date_from = d.toISOString().split('T')[0]; break;
             }
             switch (parseInt($('#period_dropdown').val())) {
                 case 0:
                     date_to = getFullYear + '-01-31';
                     break;
                 case 1:
                     date_to = getFullYear + '-02-31';
                     break;
                 case 2:
                     date_to = getFullYear + '-03-31';
                     break;
                 case 3:
                     date_to = getFullYear + '-04-31';
                     break;
                 case 4:
                     date_to = getFullYear + '-05-31';
                     break;
                 case 5:
                     date_to = getFullYear + '-06-31';
                     break;
                 case 6:
                     date_to = getFullYear + '-07-31';
                     break;
                 case 7:
                     date_to = getFullYear + '-08-31';
                     break;
                 case 8:
                     date_to = getFullYear + '-09-31';
                     break;
                 case 9:
                     date_to = getFullYear + '-10-31';
                     break;
                 case 10:
                     date_to = getFullYear + '-11-31';
                     break;
                 case 11:
                     date_to = getFullYear + '-12-31';
                     break;
                     // default : date_to = d.toISOString().split('T')[0];
             }

             console.log('Date From ', date_from);
             console.log('Date To ', date_to);

             $('#date_from').val(date_from);
             $('#date_to').val(date_to);


             $(document).on('change', '#method_dropdown', function() {
                 consol_method_id = $(this).val();
                 var url_link = '&method=' +
                     consol_method_id +
                     '&zeeid=' + zee_id +
                     '&custid=' + custid +
                     '&subcustid=' + sub_custid +
                     '&period=' + period;

                 var upload_url = baseURL + url.resolveScript({
                     deploymentId: 'customdeploy_sl_consol_inv',
                     scriptId: 'customscript_sl_consol_inv'
                 }) + url_link;
                 currRec.setValue({ fieldId: 'custpage_consol_inv_method_id', value: consol_method_id });
                 window.location.href = upload_url
             });
             $(document).on('change', '#zee_dropdown', function() {
                 zee_id = $(this).val();
                 var url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&period=' + period;
                 if (!isNullorEmpty(sub_subcustid)) {
                     url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid;
                 }
                 var upload_url = baseURL + url.resolveScript({
                     deploymentId: 'customdeploy_sl_consol_inv',
                     scriptId: 'customscript_sl_consol_inv'
                 }) + url_link;
                 currRec.setValue({ fieldId: 'custpage_consol_inv_custid', value: zee_id });
                 window.location.href = upload_url
             });
             $(document).on('change', '#parent_dropdown', function() {
                 custid = $(this).val();
                 var url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&period=' + period;
                 if (!isNullorEmpty(sub_subcustid)) {
                     url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid;
                 }
                 var upload_url = baseURL + url.resolveScript({
                     deploymentId: 'customdeploy_sl_consol_inv',
                     scriptId: 'customscript_sl_consol_inv'
                 }) + url_link;

                 window.location.href = upload_url
             });
             $(document).on('change', '#cust_dropdown', function() {
                 sub_custid = $(this).val();
                 var url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&period=' + period;
                 if (!isNullorEmpty(sub_subcustid)) {
                     url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid;
                 }
                 var upload_url = baseURL + url.resolveScript({
                     deploymentId: 'customdeploy_sl_consol_inv',
                     scriptId: 'customscript_sl_consol_inv'
                 }) + url_link;
                 window.location.href = upload_url
             });
             $(document).on('change', '#subcust_dropdown', function() {
                 sub_subcustid = $(this).val();
                 var url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&period=' + period;
                 if (!isNullorEmpty(sub_subcustid)) {
                     url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid;
                 }
                 var upload_url = baseURL + url.resolveScript({
                     deploymentId: 'customdeploy_sl_consol_inv',
                     scriptId: 'customscript_sl_consol_inv'
                 }) + url_link;
                 window.location.href = upload_url
             });

             $(document).on('change', '#period_dropdown', function() {
                 period = $(this).val();
                 var url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&period=' + period;
                 if (!isNullorEmpty(sub_subcustid)) {
                     url_link = '&method=' + consol_method_id + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid;
                 }
                 var upload_url = baseURL + url.resolveScript({
                     deploymentId: 'customdeploy_sl_consol_inv',
                     scriptId: 'customscript_sl_consol_inv'
                 }) + url_link;
                 window.location.href = upload_url
             });

             $('#generateInvoice').click(function() {
                 $('#downloadExcel').removeClass('hide'); // Excel Download Button.
                 $('.generateInvoiceSection').removeClass('hide');
                 $('#inv_preview').show();

                 if (consol_method_id == 1) { // Branch
                     var dataTable = $('#inv_preview').DataTable({
                         data: invDataSet,
                         columns: [
                             { title: 'State' },
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
                         columnDefs: [{

                         }],
                     });
                 } else if (consol_method_id == 2) { // State
                     var dataTable = $('#inv_preview').DataTable({
                         data: invDataSet,
                         columns: [
                             { title: 'State' }, // 0 
                             { title: 'Location' }, // 1
                             { title: 'Type' }, // 2
                             { title: 'Item' }, // 3
                             { title: 'Details' }, // 4
                             { title: 'Ref#' }, // 5
                             { title: 'Qty' }, // 6
                             { title: 'Rate' }, // 7
                             { title: 'Amount' }, // 8
                             { title: 'GST' }, // 9
                             { title: 'Gross' } // 10  
                         ],
                         columnDefs: [{

                         }],
                     });
                 } else if (consol_method_id == 3) { // Invoice Type
                     var dataTable = $('#inv_preview').DataTable({
                         data: invDataSet,
                         columns: [
                             { title: 'State' }, // 0
                             { title: 'Location' }, // 1
                             { title: 'Type' }, // 2
                             { title: 'Item' }, // 3
                             { title: 'Details' }, // 4
                             { title: 'Ref#' }, // 5
                             { title: 'Qty' }, // 6 
                             { title: 'Rate' }, // 7
                             { title: 'Amount' }, // 8
                             { title: 'GST' }, // 9
                             { title: 'Gross' } // 10
                         ],
                         columnDefs: [{

                         }],
                     });
                 } else if (consol_method_id == 4) { // Multi-Parent
                     var dataTable = $('#inv_preview').DataTable({
                         data: invDataSet,
                         columns: [
                             { title: 'SubParent' },
                             { title: 'State' },
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
                         columnDefs: [{
                                 targets: [],
                                 className: ''
                             },
                             {
                                 targets: [],
                                 className: ''
                             },
                         ],
                     });
                 }

                 loadInvRecord(date_from, date_to, consol_method_id, period, custid, sub_custid);

                 // $('#submitter').trigger('click');
                 // $('#generateInvoice').submit();
             });

             $('#downloadPDF').click(function() {
                 $('#submitter').trigger('click');
             });

             $('#downloadExcel').click(function() {
                 downloadExcel();
             });

         }

         function ifIsEmpty(val) {
             if (isNullorEmpty(val) || isNaN(val)) {
                 val = 0;
             } else {
                 val = val;
             }
             return parseInt(val);
         }

         // function reloadPageWithParams(){
         //     var params = [];
         //     var upload_url = baseURL + url.resolveScript({
         //         deploymentId: 'customdeploy_sl_consol_inv',
         //         scriptId: 'customscript_sl_consol_inv',
         //         params: params
         //     }); 
         //     window.location.href = upload_url;
         // }

         function loadInvRecord(date_from, date_to, consol_method_id, period, custid, sub_custid) {
             console.log('Load Record Table');

             var csvBillSet = [];
             var csvTaxSet = [];
             var csvTotalSet = [];

             var invDataSet = JSON.parse(JSON.stringify([]));

             var consolInvSearch = search.load({
                 type: 'customer',
                 id: 'customsearch_consol_inv_custlist'
             });
             var consolInvSearchFilter = [];
             console.log('In Search: ' + custid)

             //  customerSearch.filters.push(search.createFilter({
             //     name: 'internalid',
             //     operator: search.Operator.IS,
             //     values: 632197 // Decujba 
             // }));
             // }
             if (consol_method_id != 0) {
                 customerSearch.filters.push(search.createFilter({
                     name: 'custentity_inv_consolidation_mtd',
                     operator: search.Operator.IS,
                     join: 'subCustomer',
                     values: consol_method_id
                 }));
             }
             consolInvSearchFilter.push(['internalid', search.Operator.IS, custid]);
             consolInvSearchFilter.push('AND', ['custentity_inv_consolidation_mtd', search.Operator.IS, consol_method_id])

             if (consol_method_id == 4) {
                 consolInvSearchFilter.push('AND', ['internalid', search.Operator.IS, custid]);
                 consolInvSearchFilter.push('AND', ['subcustomer.internalid', search.Operator.IS, sub_custid]);
             }
             // consolInvSearch.filterExpression = consolInvSearchFilter;
             var consolInvResults = consolInvSearch.run();

             //  console.log("Load First Results " + JSON.stringify(consolInvResults));

             consolInvResults.each(function(searchResult) {
                 console.log('Loaded div');

                 var custid_search = searchResult.getValue({ name: 'internalid' });
                 sub_custid = searchResult.getValue({ name: 'internalid', join: 'subCustomer' });
                 // var consol_method_id = searchResult.getValue({ name: 'custentity_inv_consolidation_mtd', join: 'subCustomer'}) // 2 = State. Therefore 1 = Branch??
                 var company_name = searchResult.getValue({ name: 'companyname' });

                 console.log('Customer Company Name: ' + company_name, '| Customer ID: ' + custid_search, '| Sub- Customer ID: ' + sub_custid);

                 // var amount, gst, gross;
                 var sub_total, tot_GST, total;

                 var consolInvItemSearch = search.load({
                     type: 'invoice',
                     id: 'customsearch_consol_inv_lineitem'
                 });
                 var consolInvItemFilter = [];
                 consolInvItemFilter.push(['customer.internalid', search.Operator.IS, sub_custid])
                 consolInvItemFilter.push('AND', ['trandate', search.Operator.ONORAFTER, date_from]);
                 consolInvItemFilter.push('AND', ['trandate', search.Operator.ONORBEFORE, date_to]);
                 consolInvItemSearch.filterExpression = consolInvItemFilter;
                 var consolInvItemResultsLength = consolInvItemSearch.runPaged().count;
                 console.log('Result Length: ' + consolInvItemResultsLength)
                 var consolInvItemResults = consolInvItemSearch.run().getRange({ start: 0, end: consolInvItemResultsLength });

                 consolInvItemResults.forEach(function(line_item, index) {

                     var invoice_id = line_item.getValue({ name: 'internalid' });
                     var subparent = line_item.getValue({ name: 'internalid', join: 'customer' });

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
                     var name_match = JSON.stringify(company_name).match(/\b(\w)/g);
                     var name_code = name_match.join('');
                     var invoice_code = name_code + year_code + month_code

                     var due_date = line_item.getValue({ name: 'duedate' })
                     var abn = '45 609 801 194'; // MailPlus ABN
                     //var abn = line_item.getValue({ name: 'custbody_franchisee_abn'} });
                     var po_box = line_item.getValue({ name: 'custentity11', join: 'customer' });
                     var service_from = line_item.getValue({ name: 'custbody_inv_date_range_from' });
                     service_from = date_from;
                     var service_to = line_item.getValue({ name: 'custbody_inv_date_range_to' });
                     service_to = date_to;
                     var terms = line_item.getValue({ name: 'terms' });

                     if (isNullorEmpty(csvTaxSet)) {
                         if (index == consolInvItemResultsLength - 1) {
                             csvTaxSet.push([date, invoice_code, due_date, abn, po_box, service_from, service_to, terms])
                         }
                     }

                     /**
                      *  Bill To Header
                      */
                     var billaddress = line_item.getValue({ name: 'billaddress' });
                     if (isNullorEmpty(csvBillSet)) {
                         if (index == consolInvItemResultsLength - 1) {
                             csvBillSet.push([company_name, billaddress]);
                         }
                     }

                     /**
                      *  Table
                      */
                     var state = line_item.getValue({ name: 'billstate' }); // location
                     var location = line_item.getValue({ name: 'billaddressee' }); // companyname
                     // var type = line_item.getValue({ name: 'custbody_inv_type'});
                     var type = line_item.getValue({ name: 'formulatext', formula: "DECODE({custbody_inv_type},'','Service','AP Products','Product',{custbody_inv_type})" });
                     // if (isNullorEmpty(type)){
                     //     type = 'Service';
                     // }

                     var item_id = line_item.getValue({ name: 'item' });
                     // Item Record
                     if (!isNullorEmpty(item_id)) {
                         var item;
                         var itemRecord = record.load({
                             type: 'serviceitem',
                             id: item_id
                         });
                         if (!isNullorEmpty(itemRecord)) {
                             item = itemRecord.getValue({ fieldId: 'itemid' });

                         } else {
                             item = '';
                         }
                         console.log('item: ' + item)
                     }
                     //  var item = 'Counter Bankings'
                     var details = line_item.getValue({ name: 'custcol1' });

                     var ref_val = line_item.getValue({ name: 'tranid' })
                     var upload_url_inv = '/app/accounting/transactions/custinvc.nl?id=';
                     var ref = '<a href="' + baseURL + upload_url_inv + invoice_id + '" target="_blank">' + ref_val + '</a>';

                     var qty = line_item.getValue({ name: 'quantity' })
                     var rate = line_item.getValue({ name: 'rate' })
                     var amount = line_item.getValue({ name: 'amount' });
                     var gst = line_item.getValue({ name: 'taxamount' });
                     var gross = line_item.getValue({ name: "formulacurrency", formula: '{amount}+{taxamount}' });

                     if (!isNullorEmpty(amount)) {
                         sub_total += parseFloat(JSON.stringify(amount));
                     }
                     console.log('Sub Total: ' + sub_total);

                     tot_GST += parseFloat(JSON.stringify(gst));
                     total += parseFloat(JSON.stringify(gross));

                     if (isNullorEmpty(gross)) {
                         type += ' Total'
                     }
                     if (consol_method_id == 4) {
                         invDataSet.push([subparent, state, location, type, item, details, ref, qty, rate, amount, gst, gross]);
                         csvTableSet.push([subparent, state, location, type, item, details, ref_val, qty, rate, amount, gst, gross])
                     } else {
                         invDataSet.push([state, location, type, item, details, ref, qty, rate, amount, gst, gross]);
                         csvTableSet.push([state, location, type, item, details, ref_val, qty, rate, amount, gst, gross])
                     }

                     console.log('Sub Total: ' + sub_total)
                     $('#subTotal').val(sub_total);
                     $('#totGST').val(tot_GST);
                     $('#totalAmount').val(total);

                     if (isNullorEmpty(csvTotalSet)) {
                         if (index == consolInvItemResultsLength - 1) {
                             csvTotalSet.push([sub_total, tot_GST, total])
                         }
                     }

                     if (isNullorEmpty(csvDataSet)) {
                         if (index == consolInvItemResultsLength - 1) {
                             //  csvDataSet = [date, invoice_code, due_date, abn, po_box, service_from, service_to, terms, company_name, billaddress, sub_total, tot_GST, total]
                             csvDataSet.push([csvTaxSet, csvBillSet, csvTableSet, csvTotalSet]);
                         }
                     }

                     return true;
                 });
             });

             var datatable = $('#inv_preview').DataTable();
             datatable.clear();
             datatable.rows.add(invDataSet);
             datatable.draw();

             saveCsv(csvDataSet);

             return true;
         }


         function download() {
             console.log('Download PDF Loaded')
             var file_search = search.load({
                 id: 'customsearch_consol_inv_file',
                 type: 'file'
             });
             file_search.run().each(function(res) {
                 var internalid = res.getValue({ name: 'internalid' });
                 // var pdf = file.load({
                 //     id: internalid
                 // });
                 // var a = document.createElement('a');
                 // document.body.appendChild(a);
                 // a.style = 'display: none';
                 // var content_type = 'text/pdf';
                 // var pdfFile = new Blob([pdf], { type: content_type });
                 // var url = window.URL.createObjectURL(pdfFile);
                 // var filename = 'consolidation_invoice_' + custname + '.pdf';
                 // var filename = 'consolidation_invoice.pdf';
                 // a.href = url;
                 // a.download = filename;
                 // a.click();
                 // window.URL.revokeObjectURL(url);

                 $('#fileReady').hide();
                 $('#fileLoading').show();
             });

         }

         function downloadExcel() {
             downloadCsv();
         }

         /**
          * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
          * @param {Array} invDataSet The `invDataSet` created in `loadDatatable()`.
          */
         function saveCsv(csvDataSet) {
             csvDataSet = csvDataSet[0];
             var title = 'Consolidated Invoice DataTable Info';

             var headers = $('inv_preview').DataTable().columns().header().toArray().map(function(x) { return x.innerText });
             headers = headers.slice(0, headers.length - 1).join(', ');
             headers = ['State', 'Location', 'Type', 'Item', 'Details', 'Ref#', 'Qty', 'Rate', 'Amount', 'Gst', 'Gross'];

             var csv = title;
             csv += "\n\n";
             console.log('CSV Data Set (STRING): ' + JSON.stringify(csvDataSet));

             csvDataSet[0].forEach(function(row) { // Tax Info
                 csv += row;
                 csv += '\n';
             });
             csv += "\n\n";
             csvDataSet[1].forEach(function(row) { // Bill Address
                 csv += row;
                 csv += '\n';
             });
             csv += "\n\n";

             csv += headers + "\n";
             csvDataSet[2].forEach(function(row) { // Table Data Set
                 // row[0] = $.parseHTML(row[0])[0].text;
                 // row[4] = financialToNumber(row[4]);
                 row[8] = "$" + row[8];
                 // row[7] = $.parseHTML(row[7])[0].text;
                 csv += row.join(',');
                 csv += "\n";
             });
             csvDataSet[3].forEach(function(row) {
                 csv += row;
                 csv += '\n';
             });

             currRec.setValue({ fieldId: 'custpage_table_csv', value: csv })

             // downloadCsv(csv);

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
             var filename = 'Consolidation_Invoice' + '.csv';
             a.href = url;
             a.download = filename;
             a.click();
             window.URL.revokeObjectURL(url);
         }

         function saveRecord(context) {
             console.log('Submit Save Record Clicked')

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

         // function onButtonClick(scriptContext) {
         //     dialog.alert({
         //         title: "Alert",
         //         message: "You click this export button!"
         //     });

         //     // XML content of the file
         //     var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
         //     xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
         //     xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
         //     xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
         //     xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" '; 
         //     xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
         //     xmlStr += '<Worksheet ss:Name="Sheet1">';
         //     xmlStr += '<Table>' +
         //     '<Row>' +
         //     '<Cell><Data ss:Type="String"> First Header </Data></Cell>' +
         //     '<Cell><Data ss:Type="String"> Second Header </Data></Cell>' +
         //     '<Cell><Data ss:Type="String"> Third Header </Data></Cell>' +
         //     '<Cell><Data ss:Type="String"> Fourth Header </Data></Cell>' +
         //     '<Cell><Data ss:Type="String"> Fifth Header </Data></Cell>' +
         //     '</Row>';
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
         //         details: "File ID: " + fileid
         //     });

         //     scriptContext.response.writeFile({
         //         file : xlsFile
         //     });
         // }

         /**
          * Converts a price string (as returned by the function `financial()`) to a String readable as a Number object
          * @param   {String} price $4,138.47
          * @returns {String} 4138.47
          */
         function financialToNumber(price) {
             // Matches the '$' and ',' symbols.
             var re = /\$|\,/g;
             // Replaces all the matched symbols with the empty string ''.
             return price.replace(re, '');
         }

         return {
             pageInit: pageInit,
             saveRecord: saveRecord,

         };

     });