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
define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord', 'N/render'],
  function(error, runtime, search, url, record, format, email, currentRecord, render) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var role = runtime.getCurrentUser().role;

    /**
     * On page initialisation
     */
    function pageInit() {
        var zee = 0;
        var custid = 0;

        $(document).ready(function(){
            $('.main_form').css('background-color', '#CFE0CE');
            $(this).css('background-color', '#CFE0CE')
        })

        

        /**
             *  Click for Instructions Section Collapse
             */
         $('.collapse').on('shown.bs.collapse', function() {
            $(".range_filter_section_top").css("padding-top","500px");
        });
        $('.collapse').on('hide.bs.collapse', function() {
            $(".range_filter_section_top").css("padding-top","0px");
        });

        $('.zee_dropdown').on('change', function(){
            var zee = $(this).val();
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_cl_consol_inv',
                scriptId: 'customscript_cl_consol_inv'
            }) + '&zee=' + zee; 
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes")
        });
        $('.cust_dropdown').on('change', function(){
            var custid = $(this).val();
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_cl_consol_inv',
                scriptId: 'customscript_cl_consol_inv'
            }) + '&custid=' + custid;
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes")
        });
        
        $('.inv_type_dropdown').on('change', function(){
            var consol_method = $(this).val();
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_cl_consol_inv',
                scriptId: 'customscript_cl_consol_inv'
            }) + '&inv_type=' + consol_method;
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes")
        });
        if(!isNullorEmpty($('.inv_type').val())){
            $('.export_csv').removeClass('hide')
        }

        custid = ctx.getParameter({
            name: 'custscript_consol_inv_custid'
        });
        zee_id = ctx.getParameter({
            name: 'custscript_consol_inv_zee_id'
        });
        consol_method = ctx.getParameter({
            name: 'custscript_consol_inv_method'
        });
        var sub_custid = ctx.getParameter({
            name: 'custscript_consol_inv_sub_custid'
        });

        if (!isNullorEmpty(sub_custid))
        $('.subcust_dropdown').on('change', function(){
            sub_custid = $(this).val();
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_cl_consol_inv',
                scriptId: 'customscript_cl_consol_inv'
            }) + '&subcustid=' + sub_custid;
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes")
        });

        $('.generateInvoice').on('click', function(){
            generateInvoice();
        });
    }

    function generateInvoice(){
        var consolInvRecord = record.load({
            type: 'customrecord_consol_inv_json',
            id: '1'
        });
        consolInvRecord.each(function(consolInv){

            var consol_inv_json = consolInv.getValue({ fieldId: 'custrecord_consol_inv_json'});

            for (var x = 0; x < consol_inv_json.length; x++){
                var json_list = consol_inv_json[consol_inv_json.length - 1].json[x];
                var json = consol_inv_json[consol_inv_json.length - 1];


                var merge = new Array();
                for (var z = 0; z < 50; z++){
                    merge['NLDATE'] = json.date
                    merge['NLINVOICE'] = json.invoice
                    merge['NLDUEDATE'] = json.duedate
                    // merge['NLABN']
                    merge['NLCUSTPO'] = json.po_box
                    merge['NLSERVICEFROM'] = json.service_from
                    merge['NLSERVICETO'] = json.service_to
                    // merge['NLTERMS'] = json.terms

                    merge['NLCOMPANYNAME'] = json.companyname;
                    merge['NLBILLINGADDRESS'] = json.billaddress;

                    merge['NLSTATE' + (z + 1)] = json_list.state;
                    merge['NLLOCATION' + (z + 1)] = json_list.location;
                    merge['NLTYPE' + (z + 1)] = json_list.type;
                    merge['NLITEM' + (z + 1)] = json_list.item;
                    merge['NLDETAILS' + (z + 1)] = json_list.details;
                    merge['NLREF' + (z + 1)] = json_list.ref;
                    merge['NLQTY' + (z + 1)] = json_list.qty;
                    merge['NLRATE' + (z + 1)] = json_list.rate;
                    merge['NLAMOUNT' + (z + 1)] = json_list.amount;
                    merge['NLGST' + (z + 1)] = json_list.gst;
                    merge['NLGROSS' + (z + 1)] = json_list.gross;
                }
            
                // var fileSCFORM = nlapiMergeRecord(prod_usage_report[x], 'customer', old_customer_id, null, null, merge);
                // fileSCFORM.setName('MPEX_ProductUsageReport_' + getDate() + '_' + old_customer_id + '_' + (x + 1) + '.pdf');
                // fileSCFORM.setIsOnline(true);
                // fileSCFORM.setFolder(2177205);

                // var id = nlapiSubmitFile(fileSCFORM);

                var filePDF = file.load('Templates/PDF Templates/Consolidation Invoice - ' + consol_method + ' Template.pdf');
                var myPDFFile = render.create();
                mpyPDFFile.templateContent = filePDF.getContents();
                myPDFFile.addCustomDataSource({
                    alias: 'JSON',
                    format: render.DataSource.OBJECT,
                    data: JSON.parse(merge)
                });
                myPDFFile.setFolder()
                var newPDF = myPDFFile.renderAsPdf();
                console.log(newPDF);
            }
        });
    }

    function reloadPageWithParams(){
        var params = [];
        var upload_url = baseURL + url.resolveScript({
            deploymentId: 'customdeploy_cl_consol_inv',
            scriptId: 'customscript_cl_consol_inv'
        }); 
        window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes")
    }
    
    function onButtonClick(scriptContext) {
        dialog.alert({
            title: "Alert",
            message: "You click this export button!"
        });
       
        // XML content of the file
        var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
        xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
        xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
        xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" '; 
        xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
        xmlStr += '<Worksheet ss:Name="Sheet1">';
        xmlStr += '<Table>' +
        '<Row>' +
        '<Cell><Data ss:Type="String"> First Header </Data></Cell>' +
        '<Cell><Data ss:Type="String"> Second Header </Data></Cell>' +
        '<Cell><Data ss:Type="String"> Third Header </Data></Cell>' +
        '<Cell><Data ss:Type="String"> Fourth Header </Data></Cell>' +
        '<Cell><Data ss:Type="String"> Fifth Header </Data></Cell>' +
        '</Row>';
        xmlStr += '</Table></Worksheet></Workbook>';
        
        // Encode Contents
        var base64EncodedString = encode.convert({
            string: xmlStr,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64
        });
        
        // Create File 
        var xlsFile = file.create({ 
            name: 'TEST.xls',
            fileType: 'EXCEL',
            contents: base64EncodedString
        });

        log.debug({
            details: "File ID: " + fileid
        });

        scriptContext.response.writeFile({
            file : xlsFile
        });
    }

    function saveRecord(context) {
        
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

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        
    };  
      
});