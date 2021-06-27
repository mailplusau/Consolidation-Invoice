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

        // Hide Netsuite Submit Button
        $('#submitter').css("background-color", "#CFE0CE");
        $('#submitter').hide();

        /**
         *  Click for Instructions Section Collapse
         */
        $('.collapse').on('shown.bs.collapse', function() {
            $("#invTypeDropdownSection").css("padding-top","500px");
        });
        $('.collapse').on('hide.bs.collapse', function() {
            $("#invTypeDropdownSection").css("padding-top","0px");
        });

        var consol_method_id = currRec.getValue({
            fieldId: 'custpage_consol_inv_method_id'
        });
        var custid = currRec.getValue({
            fieldId: 'custpage_consol_inv_custid'
        });
        // var custname = currRec.getValue({
        //     fieldId: 'custpage_consol_inv_custname'
        // });
        var sub_custid = currRec.getValue({
            fieldId: 'custpage_consol_inv_sub_custid'
        });
        var sub_subcustid = currRec.getValue({
            fieldId: 'custpage_consol_inv_sub_subcustid'
        });
        var zee_id = currRec.getValue({
            fieldId: 'custpage_consol_inv_zee'
        });
        // var period = currRec.getValue({
        //     fieldId: 'custpage_consol_inv_period'
        // });

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

        

        if(!isNullorEmpty($('#method_dropdown').val())){
            // $('.export_csv').removeClass('hide');
            
        }

        $('#method_dropdown').val(consol_method_id)
        $('#zee_dropdown').val(zee_id)
        $('#parent_dropdown').val(custid)
        $('#cust_dropdown').val(sub_custid);
        if (!isNullorEmpty($('#subcust_dropdown').val())){
            $('#subcust_dropdown').val(sub_subcustid);
        }

        $(document).on('change', '#method_dropdown', function(){
            consol_method_id = $(this).val();
            var url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid;
            if (isNullorEmpty(sub_subcustid)){
                url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid; 
            }
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_sl_consol_inv',
                scriptId: 'customscript_sl_consol_inv'
            }) + url_link;
            currRec.setValue({ fieldId: 'custpage_consol_inv_method_id', value: consol_method_id });
            window.location.href = upload_url
        });
        $(document).on('change', '#zee_dropdown', function(){
            zee_id = $(this).val();
            var url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid;
            if (!isNullorEmpty(sub_subcustid)){
                url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid; 
            }
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_sl_consol_inv',
                scriptId: 'customscript_sl_consol_inv'
            }) + url_link;
            currRec.setValue({ fieldId: 'custpage_consol_inv_custid', value: zee_id });
            window.location.href = upload_url
        });
        $(document).on('change', '#parent_dropdown', function(){
            custid = $(this).val();
            var url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid;
            if (!isNullorEmpty(sub_subcustid)){
                url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid; 
            }
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_sl_consol_inv',
                scriptId: 'customscript_sl_consol_inv'
            }) + url_link;

            window.location.href = upload_url
        });
        $(document).on('change', '#cust_dropdown', function(){
            sub_custid = $(this).val();
            var url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid;
            if (!isNullorEmpty(sub_subcustid)){
                url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid; 
            }
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_sl_consol_inv',
                scriptId: 'customscript_sl_consol_inv'
            }) + url_link;
            window.location.href = upload_url
        });
        $(document).on('change', '#subcust_dropdown', function(){
            sub_subcustid = $(this).val();
            var url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid;
            if (!isNullorEmpty(sub_subcustid)){
                url_link = '&method=' + consol_method_id  + '&zeeid=' + zee_id + '&custid=' + custid + '&subcustid=' + sub_custid + '&subsubcustid=' + sub_subcustid; 
            }
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_sl_consol_inv',
                scriptId: 'customscript_sl_consol_inv'
            }) + url_link;
            window.location.href = upload_url
        });


        $('#generateInvoice').click(function() {
            // $('#submitter').trigger('click');

            $('#downloadPDF').show(); // PDF Download Button
            $('#downloadExcel').show() // Excel Download Button.

            $('#inv_preview').show();

            if (consol_method_id == 1){ // Branch
                var dataTable = $('#inv_preview').DataTable({
                    data: invDataSet,
                    columns: [
                        { title: 'State' },
                        { title: 'Location' },
                        { title: 'Type' },
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
            } else if (consol_method_id == 2){ // State
                var dataTable = $('#inv_preview').DataTable({
                    data: invDataSet,
                    columns: [
                        { title: 'State' },
                        { title: 'Location' },
                        { title: 'Type' },
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
            } else if (consol_method_id == 3){ // Invoice Type
                var dataTable = $('#inv_preview').DataTable({
                    data: invDataSet,
                    columns: [
                        { title: 'State' },
                        { title: 'Location' },
                        { title: 'Type' },
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
            } else if (consol_method_id == 4){ // Multi-Parent
                var dataTable = $('#inv_preview').DataTable({
                    data: invDataSet,
                    columns: [
                        { title: 'Subparnet' },
                        { title: 'State' },
                        { title: 'Location' },
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

            loadInvRecord(date_from, date_to, consol_method_id, period_id, custid);
            
            // $('#generateInvoice').submit();
        });

        $('#downloadPDF').click(function(){
            // var locatePDF = setInterval(downloadPDF, 5000); 
            downloadPDF();
        });

        $('#downloadExcel').click(function(){
            // var locatePDF = setInterval(downloadPDF, 5000); 
            downloadExcel();
        });

    }

    function ifIsEmpty(val){
        if (isNullorEmpty(val) || isNaN(val)){
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
    //         scriptId: 'customscript_sl_consol_inv'
    //     }); 
    //     window.location.href = upload_url;
    // }

    function loadInvRecord(date_from, date_to, consol_method_id, period_id, custid){

        var invDataSet = JSON.parse(JSON.stringify([]));

        var consolInvSearch = search.load({
            id: 'customer',
            type: 'customsearch_consol_inv_custlist'
        });

        var consolInvSearchFilter = [];
        consolInvSearchFilter.push(['internalid', search.Operator.IS, custid]);
        if (consol_method_id = 4){
            consolInvSearchFilter.push('AND', ['internalid', search.Operator.IS, custid]); 
            consolInvSearchFilter.push('AND', ['subcustomer.internalid', search.Operator.IS, sub_custid]);
        }
        consolInvSearch.filterExpression = consolInvSearchFilter;
        var consolInvResults = consolInvSearch.run();

        consolInvResults.each(function(searchResult){
            var custid_search = searchResult.getValue({ name: 'internalid'});
            var zee_id_search = searchResult.getValue({ name: 'partner'});
            var consol_method_id = searchResult.getValue({ name: 'custentity_inv_consolidation_mtd', join: 'subCustomer'}) // 2 = State. Therefore 1 = Branch??
            var company_name = searchResult.getValue({ name: 'companyname'});

            // var amount, gst, gross;
            var sub_total, tot_GST, total;

            var consolInvItemSearch = search.load({
                id: 'invoice',
                type: 'customsearch_consol_inv_lineitem'
            });

            consolInvItemFilter.push(['customer.internalid', search.Operator.IS, sub_custid])
            consolInvItemSearch.filter.push(consolInvItemFilter);
            var consolInvItemResults = consolInvItemSearch.run();
            console.log('Search = ' + JSON.stringify(consolInvItemResults));

            consolInvItemResults.each(function(line_item){

                var invoice_id = line_item.getValue('internalid');

                /**
                *  Tax Invoice Header
                */
                var date = line_item.getValue('date');

                /**
                *  Table
                */
                var state = line_item.getValue({ name: 'location' });
                var location = line_item.getValue({ name: 'companyname' });
                var type = line_item.getValue({ name: 'custbody_inv_type'});
                var item = line_item.getValue({ name: 'item'});
                var details = line_item.getValue({ name: 'custcol1'});
                var ref = line_item.getValue({ name: ''})
                var qty = line_item.getValue({ name: ''})
                var rate = line_item.getValue({ name: 'rate'})
                var amount = line_item.getValue({ name: 'amount'});
                var gst = line_item.getValue({ name: 'taxamount'});
                var gross = line_item.getValue({ name: "formulacurrency", formula: '{amount}+{taxamount}'});


                sub_total += amount;
                tot_GST += gst;
                total += gross;

                invDataSet.push([state, location, type, item, details, ref, qty, rate, amount, gst, gross]);
                
                // return true;
            });

            $('#subTotal').val(sub_total);
            $('#totGST').val(tot_GST);
            $('#totalAmount').val(total);

        });
        
        var datatable = $('#inv_preview').DataTable();
        datatable.clear();
        datatable.rows.add(invDataSet);
        datatable.draw();

        return true;
    }


    function downloadPDF(){
        var file_search = search.load({
            id: 'customsearch_consol_inv_file',
            type: 'file'
        });
        var fileResult = file_search.run().getRange({start: 0, end: 1});
        if(!isNullorEmpty(JSON.stringify(fileResult))){
            // clearInterval(locatePDF);

            fileResult.forEach(function(res){
                var internalid = res.getValue({ name: 'internalid'});
                var link = res.getValue({ name: 'url'})
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
    
                $('#fileReady').show();
                $('#fileLoading').show();
    
                window.open(baseURL + link, '_blank');
            });
        } else {
            alert('File Is Not Ready... Please Wait a Few Seconds');
        }
    }

    function saveRecord(context) {
        console.log('Submit Save Record Clicked')

        return true;
    }

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

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        
    };  
      
});