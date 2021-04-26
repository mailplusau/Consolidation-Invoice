/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
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
 *  Process:
 * 
 *  Use this SS to create a JSON file which contains consolidation invoice data.
 * 
 */

 define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
 function(runtime, search, record, log, task, currentRecord, format) {
    var zee = 0;
    var role = 0;

    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://system.sandbox.netsuite.com';
    }

    role = runtime.getCurrentUser().role;

    if (role == 1000) {
        zee = runtime.getCurrentUser().id;
    } else if (role == 3) { //Administrator
        zee = 6; //test
    } else if (role == 1032) { // System Support
        zee = 425904; //test-AR
    }

    function main() {

        log.debug({
            title: 'start',
            details: 'start'
        });

        /**
            Load Parameters from SL
         */
        var custid = ctx.getParameter({
            name: 'custscript_consol_inv_custid'
        });
        var zee_id = ctx.getParameter({
            name: 'custscript_consol_inv_zee_id'
        });
        var consol_method = ctx.getParameter({
            name: 'custscript_consol_inv_method'
        });
        var sub_custid = ctx.getParameter({
            name: 'custscript_consol_inv_sub_custid'
        });

        log.debug({
            title: 'Customer ID',
            details: custid
        });
        log.debug({
            title: 'Franchisee ID',
            details: zee_id
        });

        var consolInvSearch = search.load({
            type: 'customsearch_consol_inv_custlist',
            id: 'customer'
        });
        consolInvSearch.filter.push(search.createFilter({
            // name: '',
            // join: string,
            // operator: string,
            // values:
        }));
        var consolInvResults = consolInvSearch.run()

        var consol_inv_json = ctx.getParameter({ name: 'custscript_consol_inv_json'})
        if (isNullorEmpty(consol_inv_list)){
            deleteRecords();
            consol_inv_json = [];
        } else {
            consol_inv_json = JSON.parse(consol_inv_json);
        }

        var consol_inv_line_item = [];

        var invoice_id_set = ctx.getParameter({ name: 'custscript_consol_inv_invid' });
        if (isNullorEmpty(invoice_id_set)) {
            invoice_id_set = JSON.parse(JSON.stringify([]));
        } else {
            invoice_id_set = JSON.parse(invoice_id_set);
        }

        consolInvResults.each(function(searchResult){
            // var custid = searchResult.getValue({ name: 'entity'});
            // var zee_id = searchResult.getValue({ name: 'partner'});
            // var consol_type = searchResult.getValue({ name: ''})            

            var consolRecord = record.create({
                type: 'customrecord_consol_inv_json',
                isDynamic: true
            });

            consolRecord.setValue({ fieldId: 'custrecord_consol_inv_custid'})
            consolRecord.setValue({ fieldId: 'custrecord_consol_inv_zee_id'})
            consolRecord.setValue({ fieldId: 'custrecord_consol_inv_method'})
            if (!isNullOrEmpty(sub_custid)){
                consolRecord.setValue({ fieldId: 'custrecord_consol_inv_sub_custid'})
            }

            /**
            *  Load Search using zee_id's
            */
            var consolInvItemSearch = search.load({
                id: 'customsearch_consol_inv_lineitems',
                type: 'invoice'
            });
            consolInvItemSearch.filter.push(search.createFilter({
                name: 'entity',
                join: 'customer',
                operator: search.Operator.IS,
                values: custid
            })); 
            // consolInvItemSearch.filter.push(search.createFilter({
            //     name: string,
            //     operator: serach.Operator.ONORBEFORE,
            //     values: date_to
            // }));
            // consolInvItemSearch.filter.push(search.createFilter({
            //     name: string,
            //     operator: serach.Operator.ONORAFTER,
            //     values: date_from
            // }));

            // var consolInvItemResults = consolInvItemSearch.run().getRange({start: 0, end: 1}); // Main index?
            var consolInvItemResults = consolInvItemSearch.run().getRange({start: main_index, end: main_index + 999});
            consolInvItemResults.forEach(function(line_item){
                var usageLimit = ctx.getRemainingUsage();

                if (usageLimit < 200){
                    log.audit({
                        title: 'usageLimit',
                        details: usageLimit
                    })
                    data_set.pop();
                    log.audit({
                        title: 'data_set',
                        details: data_set
                    });
                    params = {
                        custscript_consol_inv_data_set: JSON.stringify(data_set),
                        custscript_consol_inv_invid: JSON.stringify(invoice_id)
                    };
                    reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ss_consol_inv',
                        deploymentId: 'customdeploy_ss_consol_inv',
                        params: params
                    });
                    
                    log.audit({
                        title: 'Attempting: Rescheduling Script',
                        details: reschedule
                    });

                    reschedule.submit();
                    
                    return false;
                } else {

                    var invoice_id = line_item.getValue({ name:'internalid'});

                    if (invoice_id_set.indexOf(invoice_id) == -1){
                        invoice_id_set.push(invoice_id);

                        if (isNullorEmpty){
                            consol_inv_json.push({
                                date: date,
                                due_date: due_date,
                                abn: abn,
                                po_box: po_box,
                                service_from: service_from,
                                service_to: service_to,
                                terms: terms 
                            });
                        }

                        /**
                        *  Tax Invoice Header
                        */
                        var date = line_item.getValue({ name: 'date'})
                        //Invoice Number - Code + Year Number + Month Number (ie: 'CODE'2104)
                        var due_date = line_item.getValue({ name: 'duedate'})
                        var abn = '45 609 801 194'; // MailPlus ABN
                        //var abn = line_item.getValue({ name: 'custbody_franchisee_abn' });
                        var po_box = line_item.getValue({ name: 'custentity11', join: 'customer' });
                        var service_from = line_item.getValue({ name: 'custbody_inv_date_range_from' });
                        var service_to = line_item.getValue({ name: 'custbody_inv_date_range_to' });
                        var terms = line_item.getValue({ name: 'terms' });

                        /**
                        *  Bill To Header
                        */
                        var billaddress = line_item.getValue({ name: 'billaddress'});

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
              
            consolRecord.setValue({
                fieldId: 'custrecord_consol_inv_json',
                value: consol_inv_json
            });
            consolRecord.save();

            return true;
        });
    }


    function deleteRecords() {
        log.debug({
            title: 'DELETE STRING ACTIVATED'
        });
        var exportRunSearch = search.load({
            type: 'customrecord_consol_inv_json',
            id: 'customsearch_consol_inv_json'
        });
        exportRunSearch.run().each(function(result) {
            var index = result.getValue('internalid');
            if (result.getValue('custrecord_export_run_template') !== 'T') {
                deleteResultRecord(index);
            }

            return true;
        });
    }

    function deleteResultRecord(index) {           
        // Deleting a record consumes 4 governance units.
        record.delete({
            type: 'customrecord_export_run_json',
            id: index
        });    
    }

    return {
        execute: main
    }

});