/**
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
 ***************************
 *
 *  Process:
 * 
 *  Use this SS to create a JSON file which contains consolidation invoice data.
 * 
 */
    var zee = 0;
    var role = 0;

    // var baseURL = 'https://1048144.app.netsuite.com';
    // if (runtime.EnvType == "SANDBOX") {
    //     baseURL = 'https://system.sandbox.netsuite.com';
    // }

    // role = runtime.getCurrentUser().role;

    // if (role == 1000) {
    //     zee = runtime.getCurrentUser().id;
    // } else if (role == 3) { //Administrator
    //     zee = 6; //test
    // } else if (role == 1032) { // System Support
    //     zee = 425904; //test-AR
    // }

    var month = moment().utc().format('MMMM');

    var adhoc_inv_deploy = 'customdeploy_ss_consol_inv_1';
    var prev_inv_deploy = null;
    var ctx = nlapiGetContext();
    var usageThreshold = 50;

    function main() {
        /**
            Load Parameters from SL
         */

        var custid = ctx.getSetting('SCRIPT', 'custscript_consol_inv_custid');
        var sub_custid = ctx.getSetting( 'SCRIPT', 'custscript_consol_inv_sub_custid');
        var sub_subcustid = ctx.getSetting( 'SCRIPT', 'custscript_consol_inv_sub_subcustid');
        var zee_id = ctx.getSetting( 'SCRIPT', 'custscript_consol_inv_zee_id');
        var consol_method = ctx.getSetting( 'SCRIPT', 'custscript_consol_inv_method');
        var period = ctx.getSetting( 'SCRIPT', 'custscript_consol_inv_period');

        custid = 623512; //
        sub_custid = 712095; //
        sub_subcustid = null;
        zee_id = 3484879;
        consol_method = 'State';
        period = 'Apr 21';
        
        nlapiLogExecution('DEBUG', 'Customer ID', custid);
        nlapiLogExecution('DEBUG', 'Sub Customer ID', sub_custid);
        nlapiLogExecution('DEBUG', 'Franchisee ID', zee_id);
        nlapiLogExecution('DEBUG', 'Consolidation Method', consol_method);
        nlapiLogExecution('DEBUG', 'Period', period);

        var consolInvSearch = nlapiLoadSearch('customer', 'customsearch_consol_inv_custlist')
        // var consolInvSearchFilter = [['subcustomer.internalid', 'is', sub_custid]]
        var consolInvSearchFilter = [['partner', 'is', zee_id], 'AND', ['internalid', 'is', custid]];
        if (consol_method == 'Multi-Parent'){
            consolInvSearchFilter = [['partner', 'is', zee_id], 'AND', ['internalid', 'is', custid], 'AND' ['subcustomer.internalid', 'is', sub_custid]];
        }
        consolInvSearch.setFilterExpression(consolInvSearchFilter);
        var consolInvResults = consolInvSearch.runSearch();

        var consol_inv_json = ctx.getSetting('SCRIPT', 'custscript_consol_inv_json')
        if (isNullorEmpty(consol_inv_json)){
            // deleteRecords();
            consol_inv_json = [];
        } else {
            consol_inv_json = JSON.parse(consol_inv_json);
        }

        var consol_inv_line_item = [];

        var invoice_id_set = ctx.getSetting('SCRIPT', 'custscript_consol_inv_invid');
        if (isNullorEmpty(invoice_id_set)) {
            invoice_id_set = JSON.parse(JSON.stringify([]));
        } else {
            invoice_id_set = JSON.parse(invoice_id_set);
        }

        consolInvResults.forEachResult(function(searchResult){
            var custid_search = searchResult.getValue('internalid');
            var zee_id_search = searchResult.getValue('partner');
            var consol_method_id = searchResult.getValue('custentity_inv_consolidation_mtd', 'subCustomer') // 2 = State. Therefore 1 = Branch??
            var company_name = searchResult.getValue('companyname');

            nlapiLogExecution('DEBUG', 'Cust ID Search', custid_search)
            nlapiLogExecution('DEBUG', 'Zee ID Search', zee_id_search)
            nlapiLogExecution('DEBUG', 'Consol Method Search', consol_method_search)
            
            var amount, gst, gross;

            var name = custid + '_' + zee_id + '_' + getDate();
            var consolRecord = nlapiCreateRecord('customrecord_consol_inv_json');
            consolRecord.setFieldValue('name', name);
            consolRecord.setFieldValue('custrecord_consol_inv_custid', custid);
            consolRecord.setFieldValue('custrecord_consol_inv_sub_custid', sub_custid);
            consolRecord.setFieldValue('custrecord_consol_inv_zee_id', zee_id);
            switch (consol_method_id) {
                case '1' : consol_method = 'Branch'; break;
                case '2' : consol_method = 'State'; break;
                case '3' : consol_method = 'Invoice Type'; break;
                case '4' : consol_method = 'Multi-Parent'; break;
                default: consol_method = 'State';
            }
            consolRecord.setFieldValue('custrecord_consol_inv_method', consol_method);
            // consolRecord.setFieldValue('custrecord_consol_inv_period', period);
            if (!isNullorEmpty(sub_subcustid)){
                consolRecord.setFieldValue('custrecord_consol_inv_sub_subcustid', sub_custid);
            }

            nlapiLogExecution('DEBUG', 'Load Search');
            /**
            *  Load Search using zee_id's
            */
            var consolInvItemSearch = nlapiLoadSearch('invoice', 'customsearch_consol_inv_lineitem');
            // consolInvItemSearch.addFilter(new nlobjSearchFilter('internalid', 'customer', 'is', sub_custid))
            consolInvItemFilter = [['customer.internalid', 'is', sub_custid]]
            consolInvItemSearch.setFilterExpression(consolInvItemFilter)
            var consolInvItemResults = consolInvItemSearch.runSearch();

            nlapiLogExecution('DEBUG', 'Run Search', JSON.stringify(consolInvItemResults))
            consolInvItemResults.forEachResult(function(line_item){
                nlapiLogExecution('DEBUG', 'In Line Item Search')
                var usageLimit = ctx.getRemainingUsage();

                if (usageLimit < 200){
                    nlapiLogExecution('AUDIT', 'usageLimit', usageLimit);
                    // data_set.pop();
                    params = {
                        custscript_consol_inv_json: JSON.stringify(consol_inv_json),
                        custscript_consol_inv_invid: JSON.stringify(invoice_id)
                    };
                    reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params)
                    
                    nlapiLogExecution('AUDIT', 'Attempting: Rescheduling Script', reschedule)
                    nlapiLogExecution('EMERGENCY', 'Reschedule Return', reschedule);
                    if (reschedule == false) {
                        return false;
                    }
                    return true;
                } else {

                    var invoice_id = line_item.getValue('internalid');
                    nlapiLogExecution('DEBUG', 'Invoice InternalID', invoice_id);

                    if (invoice_id_set.indexOf(invoice_id) == -1){
                        invoice_id_set.push(invoice_id);

                        /**
                        *  Tax Invoice Header
                        */
                        var date = line_item.getValue('date');
                        nlapiLogExecution('DEBUG', 'date result', date);

                        var date_object = new Date();
                        //Invoice Number - Code + Year Number + Month Number (ie: 'CODE'2104)
                        var location = line_item.getValue('companyname');
                        var year = (date_object.getFullYear()).split('');
                        var year_code = year[2] + year[3];
                        var month = date_object.getMonth();
                        if (month < 10){
                            var month_code = '0' + month;
                        } else{
                            var month_code = month;
                        }
                        var invoice_code = name_code + year_code + month_code

                        var due_date = line_item.getValue('duedate')
                        var abn = '45 609 801 194'; // MailPlus ABN
                        //var abn = line_item.getValue('custbody_franchisee_abn' });
                        var po_box = line_item.getValue('custentity11', 'customer');
                        var service_from = line_item.getValue('custbody_inv_date_range_from');
                        var service_to = line_item.getValue('custbody_inv_date_range_to');
                        var terms = line_item.getValue('terms');

                        /**
                        *  Bill To Header
                        */
                        var billaddress = line_item.getValue('billaddress');

                        if (isNullorEmpty(consol_inv_json)){
                            consol_inv_json.push({
                                date: date,
                                inv_code: invoice_code,
                                due_date: due_date,
                                abn: abn,
                                po_box: po_box,
                                service_from: service_from,
                                service_to: service_to,
                                terms: terms,
                                companyname: company_name,
                                billaddress: billaddress
                            });
                        }

                        /**
                        *  Table
                        */
                        var state = line_item.getValue('location');
                        // var location = line_item.getValue('companyname' });
                        var type = line_item.getValue('custbody_inv_type');
                        var item = line_item.getValue('item');
                        var details = line_item.getValue('custcol1');
                        var ref = line_item.getValue('');
                        var qty = line_item.getValue('');
                        var rate = line_item.getValue('rate')
                        amount += line_item.getValue('amount');
                        gst += line_item.getValue('taxamount');
                        gross += line_item.getValue("formulacurrency").setFormula('{amount}+{taxamount}');

                        consol_inv_line_item.push({
                            id: invoice_id,
                            state: state,
                            location: location,
                            type: type,
                            item: item,
                            details: details,
                            ref: ref,
                            qty: qty,
                            rate: rate,
                            amount: amount,
                            gst: gst,
                            gross: gross
                        });

                        consol_inv_json.push({ lineitem: consol_inv_line_item })

                        return true;
                    }                    
                }

            });
              
            consolRecord.setFieldValue('custrecord_consol_inv_json', consol_inv_json);
            nlapiLogExecution('DEBUG', 'JSON String In Search', consol_inv_json);
            // nlapiSubmitRecord(consolRecord);

            return true;
        });

        nlapiLogExecution('DEBUG', 'JSON String', consol_inv_json);
        
        consol_inv_line_item = [{
            id: '12345',
            state: 'WA',
            location: 'Perth',
            type: 'Service',
            item: 'Counter Banking',
            details: 'Please Bill Monthly',
            ref: '1',
            qty: '9',
            rate: '$20.00',
            amount: '$20.00',
            gst: '$2.00',
            gross: '$22.00'
        },
        {
            id: '56789',
            state: 'NSW',
            location: 'Sydney',
            type: 'Product',
            item: 'Counter Banking',
            details: 'Bill Weekly',
            ref: '2',
            qty: '18',
            rate: '$45.00',
            amount: '$23.00',
            gst: '$5.00',
            gross: '$8.00'
        },
        {
            id: '00000',
            state: 'QLD',
            location: 'Brisbane',
            type: 'Product',
            item: 'Counter Banking',
            details: 'Bill Weekly',
            ref: '2',
            qty: '18',
            rate: '$45.00',
            amount: '$23.00',
            gst: '$5.00',
            gross: '$8.00'
        }];
        consol_inv_json = [{
            date: '10/05/2021',
            inv_code: 'INV894288',
            due_date: '30/05/2021',
            abn: '123456789',
            po_box: '2020',
            service_from: '1/05/2021',
            service_to: '30/05/2021',
            terms: 'NET15',
            companyname: 'Secure Cash - NSW Parent : SC - PETStock - Mt Annan',
            billaddress: '320 Narellan Rd, Mount Annan NSW 2567',
            lineitem: consol_inv_line_item
        }];

        nlapiLogExecution('DEBUG', 'JSON String', consol_inv_json);

        for (var x = 0; x < consol_inv_json.length; x++){
            var json_list = consol_inv_json[consol_inv_json.length - 1].lineitem[x];
            var json = consol_inv_json[consol_inv_json.length - 1];

            var merge = new Array();
            merge['NLDATE'] = json.date
            merge['NLINVOICE'] = json.inv_code
            merge['NLDUEDATE'] = json.due_date
            // merge['NLABN'] = '45 609 801 194';
            merge['NLPOBOX'] = json.po_box
            merge['NLSERVICEFROM'] = json.service_from
            merge['NLSERVICETO'] = json.service_to
            // merge['NLTERMS'] = json.terms

            merge['NLCOMPANYNAME'] = json.companyname;
            merge['NLBILLINGADDRESS'] = json.billaddress;
            for (var z = 0; z < 50; z++){
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
            
            switch (consol_method) {
                case 'Branch' : consol_method_id = 312; break;
                case 'State' : consol_method_id = 301; break;
                case 'Invoice Type' : consol_method_id = 311; break;
                case 'Multi-Parent' : consol_method_id = 313; break;
            }
            nlapiLogExecution('AUDIT', 'Merge Record', consol_method)
            var fileSCFORM = nlapiMergeRecord(consol_method_id, 'customer', sub_custid, null, null, merge);
            fileSCFORM.setName('Consolidation_Invoice_' + consol_method + '_custid' + custid + '_' + getDate() + '.pdf');
            fileSCFORM.setIsOnline(true);
            fileSCFORM.setFolder(2775794);
            var id = nlapiSubmitFile(fileSCFORM);
            
            nlapiLogExecution('AUDIT', 'File ID', id);
        }
    }


    function deleteRecords() {
        nlapiLogExecution('DEBUG', 'DELETE STRING ACTIVATED');
        var consolInvSearch = nlapiLoadSearch('customrecord_consol_inv_json', 'customsearch_consol_inv_json')
        consolInvSearch.runSearch().forEachResult(function(result) {
            var index = result.getValue('internalid');
            // if (result.getFieldValue('custrecord_export_run_template') !== 'T') {
                deleteResultRecord(index);
            // }

            return true;
        });
    }

    function deleteResultRecord(index) {           
        // Deleting a record consumes 4 governance units.
        nlapiDeleteRecord('customrecord_consol_inv_json', index);
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }

    function getDate() {
        var date = new Date();
        if (date.getHours() > 6) {
            date = nlapiAddDays(date, 1);
        }
        date = nlapiDateToString(date);
        return date;
    }
