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
 */
var zee = 0;
var role = 0;

var month = moment().utc().format('MMMM');

var adhoc_inv_deploy = 'customdeploy_ss_consol_inv_1';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();
var usageThreshold = 50;

function main() {
    /**
    Load Parameters from SL
    */
    var custid = parseInt(ctx.getSetting('SCRIPT', 'custscript_consol_inv_custid_1'));
    var sub_custid = ctx.getSetting('SCRIPT', 'custscript_consol_inv_sub_custid_1');
    // var sub_subcustid = ctx.getSetting('SCRIPT', 'custscript_consol_inv_sub_subcustid_1');
    var consol_method_id = ctx.getSetting('SCRIPT', 'custscript_consol_inv_method_id_1');
    var period = ctx.getSetting('SCRIPT', 'custscript_consol_inv_period_1');
    var date_from = ctx.getSetting('SCRIPT', 'custscript_consol_inv_date_from_1');
    var date_to = ctx.getSetting('SCRIPT', 'custscript_consol_inv_date_to_1');
    var consol_method = '';

    // zee_id = 3484879;
    custid = 205653; //
    sub_custid = 4154; //
    consol_method_id = 2;
    // sub_subcustid = null;
    // period = 'Apr 21';

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

    nlapiLogExecution('DEBUG', 'Customer ID', custid);
    nlapiLogExecution('DEBUG', 'Sub Customer ID', sub_custid);
    nlapiLogExecution('DEBUG', 'Consolidation Method', consol_method);
    nlapiLogExecution('DEBUG', 'Consolidation Method ID', consol_method_id);

    var consol_inv_json = ctx.getSetting('SCRIPT', 'custscript_consol_inv_json')
    if (isNullorEmpty(consol_inv_json)) {
        // deleteRecords();
        consol_inv_json = JSON.parse(JSON.stringify([]));
    } else {
        consol_inv_json = JSON.parse(consol_inv_json);
    }

    var consol_inv_line_item = JSON.parse(JSON.stringify([]));

    var invoice_id_set = ctx.getSetting('SCRIPT', 'custscript_consol_inv_invid');
    if (isNullorEmpty(invoice_id_set)) {
        invoice_id_set = JSON.parse(JSON.stringify([]));
    } else {
        invoice_id_set = JSON.parse(invoice_id_set);
    }

    var name = custid + '_' + getDate();
    var consolRecord = nlapiCreateRecord('customrecord_consol_inv_json');
    consolRecord.setFieldValue('name', name);
    consolRecord.setFieldValue('custrecord_consol_inv_custid', custid);
    consolRecord.setFieldValue('custrecord_consol_inv_sub_custid', sub_custid);
    consolRecord.setFieldValue('custrecord_consol_inv_method', consol_method);
    // consolRecord.setFieldValue('custrecord_consol_inv_period', period);
    // if (!isNullorEmpty(sub_subcustid) || sub_subcustid != 0) {
    //     consolRecord.setFieldValue('custrecord_consol_inv_sub_subcustid', sub_custid);
    // }

    /**
     *  Load Search using zee_id's
     */

    nlapiLogExecution('DEBUG', 'Load Search');

    var consolInvItemFilter = [['customer.internalid', 'is', sub_custid]];

    var consolInvItemSearch = nlapiLoadSearch('invoice', 'customsearch_consol_inv_lineitem');
    // consolInvItemSearch.addFilter(new nlobjSearchFilter('internalid', 'customer', 'anyof', JSON.stringify(sub_custid)))
    // creditSearch.addFilter(new nlobjSearchFilter('custbody_related_inv_type', null, 'noneof', '@NONE@'));
    // consolInvItemSearch.setFilterExpression(consolInvItemFilter)
    var consolInvItemResults = consolInvItemSearch.runSearch();
    // nlapiLogExecution('DEBUG', 'Run Search', JSON.stringify(consolInvItemResults))

    var company_name_set = [];
    var location_name_set = [];
    var branch_name_set = [];
    var state_name_set = [];
    var type_name_set = [];

    var tot_rate = 0;
    var sub_total = 0;
    var tot_GST = 0;
    var total = 0;
    var tot_rate_index = 1;

    var index = 0;

    consolInvItemResults.forEachResult(function (line_item) {


        var usageLimit = ctx.getRemainingUsage();

        if (usageLimit < 200) {
            nlapiLogExecution('AUDIT', 'usageLimit', usageLimit);
            params = {
                custscript_consol_inv_custid: custid,
                custscript_consol_inv_sub_custid: sub_custid,
                custscript_consol_inv_method: consol_method,
                custscript_consol_inv_period: period,
                custscript_consol_inv_method_id: consol_method_id,
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
            nlapiLogExecution('DEBUG', 'Index', index);
            // nlapiLogExecution('DEBUG', 'In Line Item Search', JSON.stringify(line_item))

            var invoice_id = line_item.getValue('internalid');
            nlapiLogExecution('DEBUG', 'Invoice Internal ID', invoice_id);

            // if (invoice_id_set.indexOf(invoice_id) == -1) {
            //     invoice_id_set.push(invoice_id);

            var cust_id = line_item.getValue('internalid', 'customer');
            if (consol_method_id == 4) {
                var subCustRecord = nlapiLoadRecord('customer', cust_id);
                var sub_parent_id = subCustRecord.getValue('parent');
                var SubParentRecord = nlapiLoadRecord('customer', sub_parent_id);
                var sub_parent_name = SubParentRecord.getValue('companyname');
                nlapiLogExecution('DEBUG', 'Sub Parent', sub_parent_id)
            }

            if (index == 0) {
                company_name_set.push(company_name);
            }

            /**
             *  Tax Invoice Header
             */
            var date = line_item.getValue('trandate');
            // nlapiLogExecution('DEBUG', 'date result', date);

            var company_name = line_item.getValue("formulatext") //.setFormula('{customer.parent}');
            var company_id = company_name.split(" ")[0];
            var company_id_length = parseInt(company_name.split(" ")[0].length);
            company_name = company_name.slice(company_id_length + 1);

            // var type = line_item.getValue('custbody_inv_type');
            var type = line_item.getValue('formulatext_1') //.setFormula("DECODE({custbody_inv_type},'','Service','AP Products','Product',{custbody_inv_type})");
            if (isNullorEmpty(type)) {
                type = 'Service';
            }


            nlapiLogExecution('AUDIT', 'In Tax Invoice Header');

            var date_object = new Date();
            //Invoice Number - Code + Year Number + Month Number (ie: 'CODE'2104)
            var location = line_item.getValue('companyname', 'customer');
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

            var due_date = line_item.getValue('duedate');
            var abn = '45 609 801 194'; // MailPlus ABN
            //var abn = line_item.getValue('custbody_franchisee_abn' });
            var po_box = line_item.getValue('custentity11', 'customer');
            var service_to = new Date(((date.split('/'))[2]), ((date.split('/'))[1]), 0);
            service_to = service_to.toISOString().split('T')[0];
            var service_from = new Date(((date.split('/'))[2]), ((date.split('/'))[1] - 1), 1);
            service_from = service_from.toISOString().split('T')[0];
            var terms = line_item.getValue('terms');

            /**
             *  Bill To Header
             */
            var billaddress = line_item.getValue('billaddress');

            /**
             *  Table
             */
            var state = line_item.getValue('billstate'); // location
            // var location = line_item.getValue('billaddressee'); // companyname
            var item = line_item.getValue('item');
            var details = line_item.getValue('custcol1');
            var ref = line_item.getValue('tranid')
            // var ref = '#12';
            var qty = line_item.getValue('quantity')
            // var qty = '123'
            var rate = line_item.getValue('rate')
            var amount = line_item.getValue('amount');
            var gst = line_item.getValue('taxamount');
            var gross = line_item.getValue("formulacurrency") // .setFormula('{amount}+{taxamount}');

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
            // nlapiLogExecution('DEBUG', 'JSON String: Line Item', JSON.stringify(consol_inv_line_item));

            if (index == 7) {
                nlapiLogExecution('AUDIT', 'End Of Index');
                if (isNullorEmpty(consol_inv_json)) {
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
                        billaddress: billaddress,
                        subtotal: sub_total, 
                        totgst: tot_GST, 
                        total: total 
                    });
                }
                consol_inv_json.push({ lineitem: consol_inv_line_item });
            }
            // }
        }
        index++;

        // nlapiLogExecution('DEBUG', 'JSON String', JSON.stringify(consol_inv_json));

        return true;
    });

    consolRecord.setFieldValue('custrecord_consol_inv_json', consol_inv_json);
    // nlapiSubmitRecord(consolRecord);

    nlapiLogExecution('DEBUG', 'JSON String', JSON.stringify(consol_inv_json));

    // consol_inv_line_item = [{
    //     id: '0',
    //     state: '',
    //     location: 'BP Australia Bulwer (former BP Refinery - Pinkenba)',
    //     type: 'Service',
    //     item: 'Account Admin Fee',
    //     details: '',
    //     ref: 'INV931428',
    //     qty: '1',
    //     rate: '9.00',
    //     amount: '9.00',
    //     gst: '0.90',
    //     gross: '9.90'
    // },
    // {
    //     id: '1',
    //     state: '',
    //     location: 'BP Australia Bulwer (former BP Refinery - Pinkenba)',
    //     type: 'Service',
    //     item: 'Express Banking',
    //     details: '',
    //     ref: 'INV931428',
    //     qty: '0',
    //     rate: '9.50',
    //     amount: '0.00',
    //     gst: '0.00',
    //     gross: '0.00'
    // },
    // {
    //     id: '2',
    //     state: '',
    //     location: 'BP Australia Bulwer (former BP Refinery - Pinkenba)',
    //     type: 'Service',
    //     item: 'Outgoing Mail Lodgement',
    //     details: '',
    //     ref: 'INV931428',
    //     qty: '9',
    //     rate: '9.50',
    //     amount: '85.50',
    //     gst: '8.55',
    //     gross: '94.05'
    // },
    // {
    //     id: '3',
    //     state: '',
    //     location: 'BP Australia Bulwer (former BP Refinery - Pinkenba)',
    //     type: 'Parcel Collection',
    //     item: 'Counter Banking',
    //     details: '',
    //     ref: 'INV931428',
    //     qty: '9',
    //     rate: '1.00',
    //     amount: '9.00',
    //     gst: '0.90',
    //     gross: '9.90'
    // },
    // {
    //     id: '4',
    //     state: '',
    //     location: 'BP Australia Bulwer (former BP Refinery - Pinkenba)',
    //     type: 'Service',
    //     item: 'Pick up and Delivery from PO 2',
    //     details: '',
    //     ref: 'INV931428',
    //     qty: '9',
    //     rate: '9.50',
    //     amount: '85.50',
    //     gst: '8.55',
    //     gross: '94.05'
    // },
    // {
    //     id: '5',
    //     state: '',
    //     location: 'BP Australia Bulwer (former BP Refinery - Pinkenba)',
    //     type: 'Service',
    //     item: 'Pick up and Delivery from PO',
    //     details: 'Tu/Th',
    //     ref: 'INV931428',
    //     qty: '9',
    //     rate: '9.50',
    //     amount: '85.50',
    //     gst: '8.55',
    //     gross: '94.05'
    // },
    // {
    //     id: '6',
    //     state: '',
    //     location: 'BP Australia Bulwer (former BP Refinery - Pinkenba)',
    //     type: 'Service',
    //     item: 'Signature Item Collected',
    //     details: '',
    //     ref: 'INV931428',
    //     qty: '18',
    //     rate: '2.00',
    //     amount: '2.00',
    //     gst: '0.20',
    //     gross: '2.20'
    // },
    // {
    //     id: '6',
    //     state: '',
    //     location: 'BP Australia Bulwer (former BP Refinery - Pinkenba)',
    //     type: 'Service',
    //     item: 'Weight Charges',
    //     details: '',
    //     ref: 'INV931428',
    //     qty: '18',
    //     rate: '2.50',
    //     amount: '0.00',
    //     gst: '0.00',
    //     gross: '0.00'
    // }
    // ];
    // consol_inv_json = [{
    //     date: '131/08/2021',
    //     inv_code: 'BPAB2108',
    //     due_date: '15/09/2021',
    //     abn: '45 609 801 194',
    //     po_box: '9187429',
    //     service_from: '1/08/2021',
    //     service_to: '31/08/2021',
    //     terms: 'NET15',
    //     companyname: 'BGIS Pty Ltd',
    //     billaddress: 'GPO Box 172 \n Sydney NSW 2001',
    //     lineitem: consol_inv_line_item,
    //     subtotal: '191.00',
    //     totgst: '19.10',
    //     total: '210.10'
    // }];

    // nlapiLogExecution('DEBUG', 'Consol Inv JSON', JSON.stringify(consol_inv_json));

    for (var x = 0; x < consol_inv_json.length; x++) {
        var json_list = consol_inv_json[consol_inv_json.length - 1].lineitem[x];
        var json = consol_inv_json[consol_inv_json.length - 1];

        var merge = new Array();
        merge['NLDATE'] = json.date
        merge['NLINVOICE'] = json.inv_code
        merge['NLDUEDATE'] = json.due_date
        merge['NLABN'] = '45 609 801 194';
        merge['NLPOBOX'] = json.po_box
        merge['NLSERVICEFROM'] = json.service_from
        merge['NLSERVICETO'] = json.service_to
        // merge['NLTERMS'] = json.terms

        merge['NLCOMPANYNAME'] = json.companyname;
        merge['NLBILLINGADDRESS'] = json.billaddress;
        for (var z = 0; z < 50; z++) {
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
        merge['NLSUBTOTAL'] = json.subtotal;
        merge['NLTOTGST'] = json.totgst;
        merge['NLTOTAL'] = json.total;

        var pdf_method_id = 0;
        // log.debug({
        //     title: 'Template: Method',
        //     details: consol_method
        // });
        switch (consol_method_id) {
            case 1:
                pdf_method_id = 312;
                break;
            case 2:
                pdf_method_id = 301;
                break;
            case 3:
                pdf_method_id = 311;
                break;
            case 4:
                pdf_method_id = 313;
                break;
        }
        nlapiLogExecution('AUDIT', 'Merge Record', consol_method)
        var fileSCFORM = nlapiMergeRecord(pdf_method_id, 'customer', custid, null, null, merge);
        fileSCFORM.setName('Consolidation_Invoice_' + consol_method + '_CustomerID_' + custid + '_' + getDate() + '.pdf');
        fileSCFORM.setIsOnline(true);
        fileSCFORM.setFolder(2775794);
        var id = nlapiSubmitFile(fileSCFORM);

        nlapiLogExecution('AUDIT', 'File ID', id);
    }

    return true;
}

// function deleteRecords() {
//     nlapiLogExecution('DEBUG', 'DELETE STRING ACTIVATED');
//     var consolInvSearch = nlapiLoadSearch('customrecord_consol_inv_json', 'customsearch_consol_inv_json')
//     consolInvSearch.runSearch().forEachResult(function(result) {
//         var index = result.getValue('internalid');
//         // if (result.getFieldValue('custrecord_export_run_template') !== 'T') {
//             deleteResultRecord(index);
//         // }

//         return true;
//     });
// }

// function deleteResultRecord(index) {           
//     // Deleting a record consumes 4 governance units.
//     nlapiDeleteRecord('customrecord_consol_inv_json', index);
// }

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