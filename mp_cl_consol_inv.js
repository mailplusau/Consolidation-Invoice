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

        var load_record_interval;

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
            $('.collapse').on('shown.bs.collapse', function() {
                $("#invTypeDropdownSection").css("padding-top", "500px");
            });
            $('.collapse').on('hide.bs.collapse', function() {
                $("#invTypeDropdownSection").css("padding-top", "0px");
            });

            var consol_method_id = currRec.getValue({
                fieldId: 'custpage_consol_inv_method_id'
            });
            if (!isNullorEmpty(consol_method_id)){
                consol_method_id = parseInt(consol_method_id);
            }
            var custid = currRec.getValue({
                fieldId: 'custpage_consol_inv_custid'
            });
            var custname = currRec.getValue({
                fieldId: 'custpage_consol_inv_custname'
            });
            var sub_custid = currRec.getValue({
                fieldId: 'custpage_consol_inv_sub_custid'
            });
            if (!isNullorEmpty(sub_custid)){
                sub_custid = parseInt(sub_custid);
            }
            var sub_subcustid = currRec.getValue({
                fieldId: 'custpage_consol_inv_sub_subcustid'
            });
            if (!isNullorEmpty(sub_subcustid)){
                sub_subcustid = parseInt(sub_subcustid);
            }
            var zee_id = currRec.getValue({
                fieldId: 'custpage_consol_inv_zee'
            });
            if (!isNullorEmpty(zee_id)){
                zee_id = parseInt(zee_id);
            }
            var period = currRec.getValue({
                fieldId: 'custpage_consol_inv_period'
            });
            // if (!isNullorEmpty(period)){
            //     period = parseInt(period);
            // }
            var date_from = currRec.getValue({
                fieldId: 'custpage_consol_inv_date_from'
            });
            var date_to = currRec.getValue({
                fieldId: 'custpage_consol_inv_date_to'
            });

            //  consol_method_id = ifIsEmpty(consol_method_id);
            //  custid = ifIsEmpty(custid);
            //  sub_custid = ifIsEmpty(sub_custid);
            //  sub_subcustid = ifIsEmpty(sub_subcustid);
            //  zee_id = ifIsEmpty(zee_id);
            // console.log('Cust Name: ', custname)
            // console.log('Cust ID:', custid)
            // console.log('Sub Cust ID:', sub_custid)
            // console.log('Zee ID:', zee_id)
            // console.log('Consol Method:', consol_method_id)
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
            var getMonth = d.getMonth();
            // switch (parseInt($('#period_dropdown').val())) {
            //     case 0:
            //         if (getMonth != 0){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(0);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-01-01';
            //         break;
            //     case 1:
            //         if (getMonth != 1){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(1);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-02-01';
            //         break;
            //     case 2:
            //         if (getMonth != 2){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(2);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-03-01';
            //         break;
            //     case 3:
            //         if (getMonth != 3){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(3);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-04-01';
            //         break;
            //     case 4:
            //         if (getMonth != 4){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(4);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-05-01';
            //         break;
            //     case 5:
            //         if (getMonth != 5){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(5);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYear + '-06-01';
            //         break;
            //     case 6:
            //         if (getMonth != 6){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(6);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-07-01';
            //         break;
            //     case 7:
            //         if (getMonth != 7){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(7);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-08-01';
            //         break;
            //     case 8:
            //         if (getMonth != 8){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(8);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-09-01';
            //         break;
            //     case 9:
            //         if (getMonth != 9){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(9);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-10-01';
            //         break;
            //     case 10:
            //         if (getMonth != 10){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(10);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-11-01';
            //         break;
            //     case 11:
            //         if (getMonth != 11){
            //             var timestamp = new Date();
            //             timestamp = timestamp.setMonth(11);
            //             if (timestamp < d){
            //                 // var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //                 var getFullYearPeriod = getFullYear;
            //             }
            //         }
            //         date_from = getFullYearPeriod + '-12-01';
            //         break;
            //         // default : date_from = d.toISOString().split('T')[0]; break;
            // }
            // switch (parseInt($('#period_dropdown').val())) {
            //     case 0:
            //         // if (getMonth != 0){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(0);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         // else {
            //             var getFullYearPeriod = getFullYear;
            //         // }
            //         var end_date = new Date(getFullYearPeriod, 0 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(1) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 1:
            //         // if (getMonth != 1){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(1);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 1 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(2) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 2:
            //         // if (getMonth != 2){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(2);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 2 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(3) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 3:
            //         // if (getMonth != 3){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(3);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 3 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(4) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 4:
            //         // if (getMonth != 4){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(4);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 4 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(5) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 5:
            //         // if (getMonth != 5){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(5);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 5 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(6) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 6:
            //         // if (getMonth != 6){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(6);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 6 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(7) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 7:
            //         // if (getMonth != 7){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(7);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 7 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(8) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 8:
            //         // if (getMonth != 8){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(8);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 8 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(9) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 9:
            //         // if (getMonth != 9){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(9);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 9 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(10) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 10:
            //         // if (getMonth != 10){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(10);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 10 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(10) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //     case 11:
            //         // if (getMonth != 11){
            //         //     var timestamp = new Date();
            //         //     timestamp = timestamp.setMonth(11);
            //         //     if (timestamp < d){
            //                 var getFullYearPeriod = JSON.stringify(parseInt(getFullYear) + 1)
            //         var getFullYearPeriod = getFullYear
            //         //     }
            //         // }
            //         var getFullYearPeriod = getFullYear;
            //         var end_date = new Date(getFullYearPeriod, 11 + 1, 0);
            //             end_date = JSON.stringify(end_date.getDate());
            //             date_to = getFullYearPeriod + '-0'+ JSON.stringify(10) +'-' + end_date;
            //             // console.log('Switch Case Val' + date_to)
            //         break;
            //         // default : date_to = d.toISOString().split('T')[0];
            // }
            switch (parseInt($('#period_dropdown').val())) {
                case 0 : var date = new Date(getFullYear, getMonth - 1, 1);
                date_to = date.getFullYear() + '-'+ date.getMonth() +'-' + date.getDate();
                    break; // Last Period
                case 1 : var date = new Date(getFullYear, getMonth - 2, 0);
                    date_to = date.getFullYear() + '-'+ date.getMonth() +'-' + date.getDate();
                    break; // Before Last Period
                case 2 : var date = new Date(getFullYear, getMonth - 3, 0);
                    date_to = date.getFullYear() + '-'+ date.getMonth() +'-' + date.getDate();
                    break; // Three Months Ago
                default: 0
            }
            switch (parseInt($('#period_dropdown').val())) {
                case 0 : var date = new Date(getFullYear, getMonth, 0);
                    var newMonth = date.getMonth();
                    if (newMonth < 10){
                        newMonth = '0' + newMonth;
                    }
                    date_to = date.getFullYear() + '-'+ date.getMonth() +'-' + date.getDate();
                    break; // Last Period
                case 1 : var date = new Date(getFullYear, getMonth - 1, 0);
                var newMonth = date.getMonth();
                    if (newMonth < 10){
                        newMonth = '0' + newMonth;
                    }
                    date_to = date.getFullYear() + '-'+ date.getMonth() +'-' + date.getDate();
                    break; // Before Last Period
                case 2 : var date = new Date(getFullYear, getMonth - 2, 0);
                    var newMonth = date.getMonth();
                    if (newMonth < 10){
                        newMonth = '0' + newMonth;
                    }
                    date_to = date.getFullYear() + '-'+ date.getMonth() +'-' + date.getDate();
                    break; // Three Months Ago
                default: 0
            }
            // console.log('Date From ', date_from);
            // console.log('Date To ', date_to);
            $('#date_from').val(date_from);
            $('#date_to').val(date_to);
            if (!isNullorEmpty(date_from) && !isNullorEmpty(date_from)){
                currRec.setValue({ fieldId: 'custpage_consol_inv_date_to', value: date_to})
                currRec.setValue({ fieldId: 'custpage_consol_inv_date_from', value: date_from})
            }
            
            $(document).on('change', '#method_dropdown', function() {
                consol_method_id = $(this).val();
                if (consol_method_id == 4 ){
                    var params = {
                        method: consol_method_id,
                        zeeid: zee_id,
                        custid: custid,
                        subcustid: sub_custid,
                        period: period,
                    } 
                } else {
                    var params = {
                        method: consol_method_id,
                        // zeeid: zee_id,
                        // custid: custid,
                        // subcustid: sub_custid,
                        period: period,
                    }  
                }
                               
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_consol_inv', scriptId: 'customscript_sl_consol_inv'}) + '&custparam_params=' + params;
                currRec.setValue({ fieldId: 'custpage_consol_inv_method_id', value: consol_method_id });
                window.location.href = upload_url
            });
            $(document).on('change', '#zee_dropdown', function() {
                zee_id = $(this).val();
                var params = {
                method: consol_method_id,
                zeeid: zee_id,
                custid: custid,
                subcustid: sub_custid,
                period: period,
            }                
                if (!isNullorEmpty(sub_subcustid)) {
                    params = {
                        method: consol_method_id,
                        zeeid: zee_id,
                        custid: custid,
                        subcustid: sub_custid,
                        subsubcustid: sub_subcustid,
                        period: period,
                    }
                }
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_consol_inv', scriptId: 'customscript_sl_consol_inv' }) + '&custparam_params=' + params;
                currRec.setValue({ fieldId: 'custpage_consol_inv_custid', value: zee_id });
                window.location.href = upload_url
            });
            $(document).on('change', '#parent_dropdown', function() {
                custid = $(this).val();
                var params = {
                method: consol_method_id,
                zeeid: zee_id,
                custid: custid,
                subcustid: sub_custid,
                period: period,
            }                
                if (!isNullorEmpty(sub_subcustid)) {
                        params = {
                        method: consol_method_id,
                        zeeid: zee_id,
                        custid: custid,
                        subcustid: sub_custid,
                        subsubcustid: sub_subcustid,
                        period: period,
                    }
                }
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_consol_inv', scriptId: 'customscript_sl_consol_inv' }) + '&custparam_params=' + params;
                window.location.href = upload_url
            });
            $(document).on('change', '#cust_dropdown', function() {
                sub_custid = $(this).val();
                var params = {
                method: consol_method_id,
                zeeid: zee_id,
                custid: custid,
                subcustid: sub_custid,
                period: period,
            }                
                if (!isNullorEmpty(sub_subcustid)) {
                        params = {
                        method: consol_method_id,
                        zeeid: zee_id,
                        custid: custid,
                        subcustid: sub_custid,
                        subsubcustid: sub_subcustid,
                        period: period,
                    }
                }
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_consol_inv', scriptId: 'customscript_sl_consol_inv' }) + '&custparam_params=' + params;
                window.location.href = upload_url
            });
            $(document).on('change', '#subcust_dropdown', function() {
                sub_subcustid = $(this).val();
                var params = {
                method: consol_method_id,
                zeeid: zee_id,
                custid: custid,
                subcustid: sub_custid,
                period: period,
            }                
                if (!isNullorEmpty(sub_subcustid)) {
                        params = {
                        method: consol_method_id,
                        zeeid: zee_id,
                        custid: custid,
                        subcustid: sub_custid,
                        subsubcustid: sub_subcustid,
                        period: period,
                    }
                }
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_consol_inv', scriptId: 'customscript_sl_consol_inv' }) + '&custparam_params=' + params;
                window.location.href = upload_url
            });

            $(document).on('change', '#period_dropdown', function() {
                period = $(this).val();
                var params = {
                method: consol_method_id,
                zeeid: zee_id,
                custid: custid,
                subcustid: sub_custid,
                period: period,
            }                
                if (!isNullorEmpty(sub_subcustid)) {
                        params = {
                        method: consol_method_id,
                        zeeid: zee_id,
                        custid: custid,
                        subcustid: sub_custid,
                        subsubcustid: sub_subcustid,
                        period: period,
                    }
                }
                params = JSON.stringify(params);
                var upload_url = baseURL + url.resolveScript({ deploymentId: 'customdeploy_sl_consol_inv', scriptId: 'customscript_sl_consol_inv' }) + '&custparam_params=' + params;
                window.location.href = upload_url
            });

            $('#generateInvoice').click(function() {
                $('#downloadExcel').removeClass('hide'); // Excel Download Button.
                $('.generateInvoiceSection').removeClass('hide');
                $('#inv_preview').show();

                if (consol_method_id == 1) { // Branch
                    var dataTable = $('#inv_preview').DataTable({
                        data: invDataSet,
                        // order: [
                        //     [0, 'asc'], [1, 'asc']
                        // ],
                        columns: [
                            { title: 'Matched Parent'}, //0
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
                        // rowGroup: {
                        //     dataSrc: [0, 1],
                        //     // startRender: function (rows, group) {
                        //     //     return $('<tr/>')
                        //     //       .append( '<td class="td-left" colspan="4">'+ group +'</td>' );
                        //     // },
                        //     // var avg = rows
                        //         //     .data()
                        //         //     .pluck(8)
                        //         //     .reduce( function (a, b) {
                        //         //         return a + b.replace(/[^\d]/g, '')*1;
                        //         //     }, 0) / rows.count();

                        //     startRender: null,
                        //     endRender: function ( rows, group ) {
                                
                        //         var sum_quantity = rows.data().pluck(7).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_quantity + $.fn.dataTable.render.number(',', '.', 0, '$').display( sum_quantity );

                        //         var avg_item_rate = rows
                        //             .data()
                        //             .pluck(8)
                        //             .reduce( function (a, b) {
                        //                 return a + b.replace(/[]/g, '')*1; // ^\d
                        //             }, 0) / rows.count();
                        //             avg_item_rate = $.fn.dataTable.render.number(',', '.', 2, '$').display( avg_item_rate );

                        //         var sum_amount = rows.data().pluck(9).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_amount = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_amount );

                        //         var sum_gst = rows.data().pluck(10).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_gst = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_gst );

                        //         var sum_gross = rows.data().pluck(11).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_gross = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_gross );
                 
                        //         return $('<tr/>')
                        //         .append( '<td colspan="5">'+group+' Total </td><td/><td/><td>'+ sum_quantity.toFixed(0) +'</td>' )
                        //         .append( '<td>'+ avg_item_rate +'</td><td>'+ sum_amount +'</td><td>'+ sum_gst +'</td><td>'+ sum_gross +'</td>' );
                        //         // .append( '<td/>' );
                        //         // group + ' Total : '+
                        //     },
                        // },
                        columnDefs: [{

                        }],
                    });
                } else if (consol_method_id == 2) { // State
                    var dataTable = $('#inv_preview').DataTable({
                        data: invDataSet,
                        pageLength: 100,
                        // order: [
                        //     [0, 'asc'], [1, 'asc']
                        // ],
                        columns: [
                            { title: 'Matched Parent'}, // 00
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
                        rowCallback: function(row, data) {
                            var api = this.api(), data;
                            if (data[0] == -1){
                                var sum = api.data().pluck(8).reduce( function (a, b) {
                                    return a + b.replace(/[]/g, '')*1;
                                }, 0);
                                // console.log(sum);
                                // return group + ' Total : '+
                                //     $.fn.dataTable.render.number(',', '.', 0, '$').display( sum );
                                data[0] = sum;
                            }
                        },
                        // rowGroup: {
                        //     dataSrc: [0, 1],
                        //     // startRender: function (rows, group) {
                        //     //     return $('<tr/>')
                        //     //       .append( '<td class="td-left" colspan="4">'+ group +'</td>' );
                        //     // },
                        //     // var avg = rows
                        //         //     .data()
                        //         //     .pluck(8)
                        //         //     .reduce( function (a, b) {
                        //         //         return a + b.replace(/[^\d]/g, '')*1;
                        //         //     }, 0) / rows.count();

                        //     startRender: null,
                        //     // function ( rows, group ){
                        //     //     $(rows.nodes()).each(function(){
                        //     //         $(this).remove();
                        //     //     });
                        //     // },
                        //     endRender: function ( rows, group ) {
                        //         var index = rows.data();
                        //         var sum_quantity = rows.data().pluck(7).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_quantity + $.fn.dataTable.render.number(',', '.', 0, '$').display( sum_quantity );

                        //         var avg_item_rate = rows
                        //             .data()
                        //             .pluck(8)
                        //             .reduce( function (a, b) {
                        //                 return a + b.replace(/[]/g, '')*1; // ^\d
                        //             }, 0) / rows.count();
                        //             avg_item_rate = $.fn.dataTable.render.number(',', '.', 2, '$').display( avg_item_rate );

                        //         var sum_amount = rows.data().pluck(9).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_amount = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_amount );

                        //         var sum_gst = rows.data().pluck(10).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_gst = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_gst );

                        //         var sum_gross = rows.data().pluck(11).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_gross = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_gross );
                 
                        //         var state =  ['NSW', 'QLD', 'VIC', 'SA', 'TAS', 'ACT', 'WA', 'NT'];
                        //         if (state.indexOf(group) != -1){
                        //             return $('<tr class="end_group_state_'+ rows.data().pluck(12)[1] +'"/>')
                        //         .append( '<td colspan="5">'+group+' Total </td><td/>')
                        //         .append( '<td/><td>'+ sum_quantity.toFixed(0) +'</td><td>'+ avg_item_rate +'</td><td>'+ sum_amount +'</td><td>'+ sum_gst +'</td><td>'+ sum_gross +'</td>' );
                        //         // .append( '<td/>' );
                        //         } else {
                        //             return $('<tr class="end_group_cust_'+ index[12] +'"/>')
                        //         .append( '<td colspan="5">'+group+' Total </td><td><button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="'+ rows.data().pluck(12)[0] +'" class="downloadPDF btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Download PDF</button></td>')
                        //         .append( '<td/><td>'+ sum_quantity.toFixed(0) +'</td><td>'+ avg_item_rate +'</td><td>'+ sum_amount +'</td><td>'+ sum_gst +'</td><td>'+ sum_gross +'</td>' );
                        //         // .append( '<td/>' );
                        //         }
                                
                        //     },
                        // },
                        footerCallback: function ( row, data, start, end, display ) {
                            var api = this.api(), data;
                                 
                            // Total over all pages
                            var total = api
                                .column( 4 )
                                .data()
                                .reduce( function (a, b) {
                                    return a + b.replace(/[]/g, '')*1; // ^\d
                                }, 0); 
                            // Total over this page
                            var pageTotal = api
                                .column( 4, { page: 'current'} )
                                .data()
                                .reduce( function (a, b) {
                                    return a + b.replace(/[]/g, '')*1; // ^\d
                                }, 0);
                 
                            // Update footer
                            $( api.column( 4 ).footer() ).html(
                                '$'+pageTotal +' ( $'+ total +' total)'
                            );
                        },
                        columnDefs: [
                            {
                                target: [11, 12],
                                visible: false
                            }
                        ],
                    });
                } else if (consol_method_id == 3) { // Invoice Type
                    var dataTable = $('#inv_preview').DataTable({
                        data: invDataSet,
                        order: [
                            [0, 'asc'], [1, 'asc']
                        ],
                        columns: [
                            { title: 'Matched Parent'},
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
                            { title: 'Gross' } // 10,
                            // 11
                            // 12 Company ID
                        ],
                        // rowGroup: {
                        //     dataSrc: [0, 1],
                        //     startRender: null,
                        //     endRender: function ( rows, group ) {
                                
                        //         var sum_quantity = rows.data().pluck(7).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_quantity + $.fn.dataTable.render.number(',', '.', 0, '$').display( sum_quantity );

                        //         var avg_item_rate = rows
                        //             .data()
                        //             .pluck(8)
                        //             .reduce( function (a, b) {
                        //                 return a + b.replace(/[]/g, '')*1; // ^\d
                        //             }, 0) / rows.count();
                        //             avg_item_rate = $.fn.dataTable.render.number(',', '.', 2, '$').display( avg_item_rate );

                        //         var sum_amount = rows.data().pluck(9).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_amount = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_amount );

                        //         var sum_gst = rows.data().pluck(10).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_gst = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_gst );

                        //         var sum_gross = rows.data().pluck(11).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_gross = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_gross );
                 
                        //         return $('<tr/>')
                        //         .append( '<td colspan="5">'+group+' Total </td><td><button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="downloadPDF_'+ rows.data().pluck(12) +'" class="btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Download PDF</button></td>')
                        //         .append( '<td/><td>'+ sum_quantity.toFixed(0) +'</td><td>'+ avg_item_rate +'</td><td>'+ sum_amount +'</td><td>'+ sum_gst +'</td><td>'+ sum_gross +'</td>' );
                        //         // .append( '<td/>' );
                        //     },
                        // },
                        columnDefs: [{

                        }],
                    });
                } else if (consol_method_id == 4) { // Multi-Parent
                    var dataTable = $('#inv_preview').DataTable({
                        data: invDataSet,
                        order: [
                            [0, 'asc'], [2, 'asc']
                        ],
                        columns: [
                            { title: 'Matched Parent'},
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
                        // rowGroup: {
                        //     dataSrc: [0, 2],
                        //     // startRender: function (rows, group) {
                        //     //     return $('<tr/>')
                        //     //       .append( '<td class="td-left" colspan="4">'+ group +'</td>' );
                        //     // },
                        //     // var avg = rows
                        //     //     .data()
                        //     //     .pluck(8)
                        //     //     .reduce( function (a, b) {
                        //     //         return a + b.replace(/[^\d]/g, '')*1;
                        //     //     }, 0) / rows.count();

                        //     startRender: null,
                        //     endRender: function ( rows, group ) {
                                
                        //         var sum_quantity = rows.data().pluck(8).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_quantity + $.fn.dataTable.render.number(',', '.', 0, '$').display( sum_quantity );

                        //         var avg_item_rate = rows
                        //             .data()
                        //             .pluck(9)
                        //             .reduce( function (a, b) {
                        //                 return a + b.replace(/[]/g, '')*1; // ^\d
                        //             }, 0) / rows.count();
                        //             avg_item_rate = $.fn.dataTable.render.number(',', '.', 2, '$').display( avg_item_rate );

                        //         var sum_amount = rows.data().pluck(10).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_amount = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_amount );

                        //         var sum_gst = rows.data().pluck(11).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_gst = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_gst );

                        //         var sum_gross = rows.data().pluck(12).reduce( function (a, b) {
                        //             return a + b.replace(/[]/g, '')*1;
                        //         }, 0);
                        //         sum_gross = $.fn.dataTable.render.number(',', '.', 2, '$').display( sum_gross );
                 
                        //         invDataSet.push([sum_amount, sum_gross, sum_gst, sum_quantity]);

                        //         var state =  ['NSW', 'QLD', 'VIC', 'SA', 'TAS', 'ACT', 'WA', 'NT'];
                        //         if (state.indexOf(group) != -1){
                        //             return $('<tr class="end_group_state_'+ rows.data().pluck(12)[1] +'"/>')
                        //         .append( '<td colspan="5">'+group+' Total </td><td/>')
                        //         .append( '<td/><td>'+ sum_quantity.toFixed(0) +'</td><td>'+ avg_item_rate +'</td><td>'+ sum_amount +'</td><td>'+ sum_gst +'</td><td>'+ sum_gross +'</td>' );
                        //         // .append( '<td/>' );
                        //         } else {
                        //             return $('<tr class="end_group_cust_'+ index[12] +'"/>')
                        //         .append( '<td colspan="5">'+group+' Total </td><td><button pdfid="'+rows.data().pluck(12)[0]+'" style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="group_cust_'+ rows.data().pluck(12)[0] +'" class="downloadPDF btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Download PDF</button></td>')
                        //         .append( '<td/><td>'+ sum_quantity.toFixed(0) +'</td><td>'+ avg_item_rate +'</td><td>'+ sum_amount +'</td><td>'+ sum_gst +'</td><td>'+ sum_gross +'</td>' );
                        //         // .append( '<td/>' );
                        //         }
                        //         // .append( '<td/>' );
                        //         // group + ' Total : '+
                        //     },
                        // },
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

                if (consol_method_id != 2){
                    loadMultiParentScript(date_from, date_to, consol_method_id, period);
                } else {
                    loadInvRecord(date_from, date_to, consol_method_id, period, custid, sub_custid, dataTable);
                }
                
                console.log('Inv Data of Group: ' + invDataSet);

                $('.downloadPDF').click(function() {
                    var cust_id = $(this).attr("id");
                    console.log('Cust ID ' + cust_id);
    
                    currRec.setValue({ fieldId: 'custpage_consol_inv_custid', value: cust_id });
                    if (!isNullorEmpty(sub_custid)){
                        currRec.setValue({ fieldId: 'custpage_consol_inv_sub_custid', value: sub_custid });
                    }
                    // $('#submitter').trigger('click');
                });

                // $('#submitter').trigger('click');
                // $('#generateInvoice').submit();
            });

            $('#downloadAsPDF').click(function(){
                downloadPDF();
            });

            $('#downloadExcel').click(function() {
                downloadExcel();
            });

        }

        function loadInvRecord(date_from, date_to, consol_method_id, period, custid, sub_custid, dataTable) {
            console.log('Load Record Table');

            var csvBillSet = [];
            var csvTaxSet = [];
            var csvTotalSet = [];

            var invDataSet = JSON.parse(JSON.stringify([]));

            console.log('Loaded div')
            // var amount, gst, gross;
            var tot_rate = 0;
            var sub_total = 0; 
            var tot_GST = 0;
            var total = 0;

            var consolInvItemSearch = search.load({
                type: 'invoice',
                id: 'customsearch_consol_inv_lineitem'
            });
            console.log('Consolidation Method ID: ' + parseInt(consol_method_id));
            consolInvItemSearch.filters.push(search.createFilter({
                name: 'custentity_inv_consolidation_mtd',
                join: 'customer',
                operator: search.Operator.ANYOF,
                values: parseInt(consol_method_id)
            }));
            // console.log('Posting Period' + parseInt(period))
            // switch (parseInt(period)){
            //     case 0 : consolInvItemSearch.filters.push(search.createFilter({
            //         name: 'postingperiod',
            //         operator: search.Operator.ANYOF,
            //         values: "LP"
            //     }));
            //         break;
            //     case 1 : consolInvItemSearch.filters.push(search.createFilter({
            //         name: 'postingperiod',
            //         operator: search.Operator.ANYOF,
            //         values: "PBL"
            //     }));
            //         break;
            // }
            //  filter.push(["trandate", "within", "1/5/2021", "31/5/2021"], "AND", ["formulatext: {customer.parent}", "contains", "71143844 Air Liquide Australia Solutions Pty Ltd- QLD Parent"])
            
            var consolInvItemResultsLength = consolInvItemSearch.runPaged().count;
            // console.log('Result Length: ' + consolInvItemResultsLength);
            var consolInvItemResults = consolInvItemSearch.run(); //.getRange({ start: 0, end: consolInvItemResultsLength });
            console.log('Results: ' + JSON.parse(JSON.stringify(consolInvItemResults)));
            var company_name_set = [];

            var index = 0;
            consolInvItemResults.each(function(line_item) {               
                console.log('Index Value: ' + index);
                
                var invoice_id = line_item.getValue({ name: 'internalid' });
                var cust_id = line_item.getValue({ name: 'internalid', join: 'customer' });
                if (consol_method_id == 4){
                    var subCustRecord = record.load({ type: 'customer', id: cust_id });
                    var sub_parent_id = subCustRecord.getValue({ fieldId: 'parent' })
                    var SubParentRecord = record.load({ type: 'customer', id: sub_parent_id });
                    var sub_parent_name = SubParentRecord.getValue({ fieldId: 'companyname'});
                    console.log('Sub Parent: ' + sub_parent_id);
                }

                var type = line_item.getValue({ name: 'formulatext_1', formula: "DECODE({custbody_inv_type},'','Service','AP Products','Product',{custbody_inv_type})" });
                if (isNullorEmpty(type)){
                    var type = 'Service';
                }
                // var type = line_item.getValue({ name: 'custbody_inv_type'});

                var company_name = line_item.getValue({ name: "formulatext", formula: '{customer.parent}'});
                console.log('Company Name: ' + company_name);
                var company_id = company_name.split(" ")[0];
                var company_id_length = parseInt(company_name.split(" ")[0].length);
                company_name = company_name.slice(company_id_length + 1);

                if (index == 0){
                    company_name_set.push(company_name);
                    csvTaxSet.push(["Date* " + date +'\n'+  "Invoice #" + invoice_code +'\n'+ 'Due Date ' + due_date +'\n'+ 'ABN ' + abn +'\n'+ 'Customer PO# ' + po_box +'\n'+ 'Services From ' + service_from +'\n'+ 'Services To ' + service_to +'\n'+ 'Terms ' + terms]);
                    csvBillSet.push([billaddress]);
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
                service_from = date_from;
                var service_to = line_item.getValue({ name: 'custbody_inv_date_range_to' });
                service_to = date_to;
                var terms = line_item.getValue({ name: 'terms' });

                /**
                 *  Bill To Header
                 */
                var billaddress = line_item.getValue({ name: 'billaddress' });

                /**
                 *  Table
                 */
                var state = line_item.getValue({ name: 'billstate' }); // location
                var location = line_item.getValue({ name: 'billaddressee' }); // companyname

                var item_id = line_item.getValue({ name: 'item' });
                // Item Record
                if (!isNullorEmpty(item_id)) {
                    var item;
                    try {
                        var itemRecord = record.load({
                            type: 'serviceitem',
                            id: item_id
                        });
                    } catch (e) {
                        // alert(e)
                        // console.log('Error in Item' + e);
                    }

                    if (!isNullorEmpty(itemRecord)) {
                        item = itemRecord.getValue({ fieldId: 'itemid' });
                    } else {
                        item = '';
                    }
                    // console.log('item: ' + item)
                }
                //  var item = 'Counter Bankings'
                var details = line_item.getText({ name: 'custcol1' });

                var ref_val = line_item.getValue({ name: 'tranid' })
                var upload_url_inv = '/app/accounting/transactions/custinvc.nl?id=';
                var ref = '<a href="' + baseURL + upload_url_inv + invoice_id + '" target="_blank">' + ref_val + '</a>';

                var qty = line_item.getValue({ name: 'quantity' })
                var rate = line_item.getValue({ name: 'rate' })
                var amount = line_item.getValue({ name: 'amount' });
                var gst = line_item.getValue({ name: 'taxamount' });
                var gross = line_item.getValue({ name: "formulacurrency", formula: '{amount}+{taxamount}' });

                if (company_name_set.indexOf(company_name) != -1){
                    tot_rate += parseFloat(rate.replace(/[]/g, '')*1);
                    if (!isNullorEmpty(amount)) {
                        console.log('Amount' + amount)
                        sub_total += parseFloat(amount.replace(/[]/g, '')*1);
                        console.log('Sub Total' + sub_total)
                    }
                    tot_GST += parseFloat(gst.replace(/[]/g, '')*1);
                    total += parseFloat(gross.replace(/[]/g, '')*1);
                }
                

                if (isNullorEmpty(gross)) {
                    type += ' Total'
                }
                if (consol_method_id == 4) {
                    invDataSet.push([company_name, sub_parent_name, state, location, type, item, details, ref, qty, rate, amount, gst, gross, company_id]);
                    csvTableSet.push([company_name, sub_parent_name, state, location, type, item, details, ref_val, qty, rate, amount, gst, gross])
                } else {
                    if ((company_name_set.indexOf(company_name) == -1 && index != 0) || index == (consolInvItemResultsLength - 1)){
                        tot_rate = tot_rate.toFixed(2);
                        sub_total = sub_total.toFixed(2);
                        tot_GST = tot_GST.toFixed(2);
                        total = total.toFixed(2);

                        var list_length = company_name_set.length;
                        console.log('Company Name Set Length: ' + list_length)
                        var previous_company_name = company_name_set[list_length - 1];
                        console.log('Load New Line' + company_name_set, company_name, tot_rate, sub_total, tot_GST,total)
                        company_name_set.push(company_name);

                        // csvTaxSet.push(["Date* " + date +'\n'+  "Invoice #" + invoice_code +'\n'+ 'Due Date ' + due_date +'\n'+ 'ABN ' + abn +'\n'+ 'Customer PO# ' + po_box +'\n'+ 'Services From ' + service_from +'\n'+ 'Services To ' + service_to +'\n'+ 'Terms ' + terms]);
                        // csvBillSet.push([billaddress]);
                        // csvTotalSet.push([sub_total, tot_GST, total]);

                        invDataSet.push([previous_company_name + ' Total', state, '','','','','<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="'+company_id+'" class="downloadPDF btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Download PDF</button>','', tot_rate, sub_total,tot_GST,total]);
                        csvTableSet.push([previous_company_name + ' Total', state, '','','','','','', tot_rate, sub_total,tot_GST,total])
                        // invDataSet.push(['','','','','','','','','','','','']);

                        tot_rate = 0;
                        sub_total = 0;
                        tot_GST = 0;
                        total = 0;
                    }
                    invDataSet.push([company_name, state, location, type, item, details, ref, qty, rate, amount, gst, gross, company_id]);
                    csvTableSet.push([company_name, state, location, type, item, details, ref_val, qty, rate, amount, gst, gross])
                }

                if (isNullorEmpty(csvDataSet)) {
                    if (index == consolInvItemResultsLength - 1) {
                        //  csvDataSet = [date, invoice_code, due_date, abn, po_box, service_from, service_to, terms, company_name, billaddress, sub_total, tot_GST, total]
                        csvDataSet.push([csvTaxSet, csvBillSet, csvTableSet]);
                    }
                }
                index++;
                return true;
            });

            var datatable = $('#inv_preview').DataTable();
            datatable.clear();
            datatable.rows.add(invDataSet);
            datatable.draw();

            if (!isNullorEmpty(csvDataSet)){
                saveCsv(csvDataSet); //exportDataSet
            }

            return true;
        }

        function loadMultiParentScript(date_from, date_to, consol_method_id, period){
            // clearInterval(load_record_interval);
            // Looks every 15 seconds for the record linked to the parameters zee_id, date_from, date_to and timestamp.
            // load_record_interval = setInterval(loadMPRecord, 15000, date_from, date_to, consol_method_id, period);
            loadMPRecord(date_from, date_to, consol_method_id, period);
        }
        function loadMPRecord(date_from, date_to, consol_method_id, period){
            var mpSearch = search.load({ type: 'customrecord_consol_inv_json' , id: 'customsearch_consol_inv_json' });
            console.log('Consol Method ID: ' + parseFloat(consol_method_id));
            mpSearch.filters.push(search.createFilter({
                name: 'custrecord_consol_inv_method',
                operator: search.Operator.IS,
                values: consol_method_id + '.0'
            }))
            var mpResults = mpSearch.run().getRange({ start: 0, end: 1 });
            
            mpResults.forEach(function(mpItem){
                var mpArray = mpItem.getValue({ name: 'custrecord_consol_inv_json' });
                var mpObject = JSON.parse(mpArray);
                mpObject.sort();

                var csvArray = mpItem.getValue({ name: 'custrecord_consol_inv_csv' });
                if (!csvArray){
                    csvArray = [];
                } else {
                    var csvObject = JSON.parse(csvArray);
                    csvObject.sort();
                }
                
                var datatable = $('#inv_preview').DataTable();
                datatable.clear();
                datatable.rows.add(mpObject);
                datatable.draw();

                if (!isNullorEmpty(csvObject)){
                    console.log('CSV: ' + csvObject)
                    saveCsv(csvObject); //exportDataSet
                }

            });
            // clearInterval(load_record_interval);
        }

        function downloadExcel() {
            downloadCsv();
        }

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         * @param {Array} invDataSet The `invDataSet` created in `loadDatatable()`.
         */
        function saveCsv(csvDataSet) { //exportDataSet
            csvDataSet = csvDataSet[0];
            var title = 'Consolidated Invoice DataTable Info';

            var headers = $('inv_preview').DataTable().columns().header().toArray().map(function(x) { return x.innerText });
            headers = headers.slice(0, headers.length - 1).join(', ');
            headers = ['Matched Parent','State', 'Location', 'Type', 'Item', 'Details', 'Ref#', 'Qty', 'Rate', 'Amount', 'Gst', 'Gross'];

            var csv = title;
            csv += "\n\n";

            console.log('CSV Data Set (STRING): ' + JSON.stringify(csvDataSet));

            // csvDataSet[0].forEach(function(row) { // Tax Info
            //     csv += row;
            //     csv += '\n';
            // });
            // csv += "\n\n";
            // csvDataSet[1].forEach(function(row) { // Bill Address
            //     csv += row;
            //     csv += '\n';
            // });
            // csv += "\n\n";

            csv += headers + "\n";
            csvDataSet[2].forEach(function(row) { // Table Data Set
                // row[0] = $.parseHTML(row[0])[0].text;
                // row[4] = financialToNumber(row[4]);
                row[8] = "$" + row[8];
                csv += row.join(',');
                csv += "\n";
            });
            // csvDataSet[3].forEach(function(row) {
            //     csv += row;
            //     csv += '\n';
            // });

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

        function downloadPDF() {
            console.log('Download PDF Has been Initiated');
            
            var pdfFile = currRec.getValue({ fieldId: 'custpage_' });

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
        }

        function saveRecord(context) {
            console.log('Submit Save Record Clicked')

            return true;
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        function ifIsEmpty(val) {
            if (isNullorEmpty(val) || isNaN(val)) {
                val = 0;
            } else {
                val = val;
            }
            return parseInt(val);
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