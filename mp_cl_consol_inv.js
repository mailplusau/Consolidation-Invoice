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

    /**
     * On page initialisation
     */
    function pageInit() {
        var zee = 0;
        var custid = 0;

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
            zee = $(this).val();
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_cl_consol_inv',
                scriptId: 'customscript_cl_consol_inv'
            }) + '&zee=' + zee; 
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes")
        });
        $('.cus_dropdown').on('change', function(){
            custid = $(this).val();
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_cl_consol_inv',
                scriptId: 'customscript_cl_consol_inv'
            }) + '&custid=' + custid;
        });
        $('.inv_type_dropdown').on('change', function(){
            inv_type = $(this).val();
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_cl_consol_inv',
                scriptId: 'customscript_cl_consol_inv'
            }) + '&inv_type=' + inv_type;
        });
        if(!isNullorEmpty($('.inv_type').val())){
            $('.export_csv').removeClass('hide')
        }
    }

    function generateInvoice(){

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

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        
    };  
      
});