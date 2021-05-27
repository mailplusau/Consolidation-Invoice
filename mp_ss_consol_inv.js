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

 define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/render'],
 function(runtime, search, record, log, task, currentRecord, format, render) {
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
    var ctx = getCurrentScript();

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
        var sub_custid = ctx.getParameter({
            name: 'custscript_consol_inv_sub_custid'
        });
        var zee_id = ctx.getParameter({
            name: 'custscript_consol_inv_zee_id'
        });
        var consol_method = ctx.getParameter({
            name: 'custscript_consol_inv_method'
        });
        var period = ctx.getParameter({
            name: 'custscript_consol_inv_period'
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
            name: 'internalid',
            join: 'subcustomer',
            operator: search.Operator.EQUALTO,
            values: 712095 // PetStock - Mt Annan
        }));
        var consolInvResults = consolInvSearch.run();

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
            var company_name = searchResult.getValue({ name: 'companyname'});

            var amount, gst, gross;

            var consolRecord = record.create({
                type: 'customrecord_consol_inv_json',
                isDynamic: true
            });
            consolRecord.setValue({ fieldId: 'custrecord_consol_inv_custid'})
            consolRecord.setValue({ fieldId: 'custrecord_consol_inv_zee_id'})
            consolRecord.setValue({ fieldId: 'custrecord_consol_inv_method'})
            consolRecord.setValue({ fieldId: 'custrecord_consol_inv_period'})
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
                    // data_set.pop();
                    // log.audit({
                    //     title: 'data_set',
                    //     details: data_set
                    // });
                    params = {
                        custscript_consol_inv_json: JSON.stringify(consol_inv_json),
                        custscript_consol_inv_invid: JSON.stringify(invoice_id)
                    };
                    reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ss_consol_inv',
                        deploymentId: 'customdeploy_ss_consol_inv_test',
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

                        /**
                        *  Tax Invoice Header
                        */
                        var date = line_item.getValue({ name: 'date'});

                        var date_object = new Date();
                        //Invoice Number - Code + Year Number + Month Number (ie: 'CODE'2104)
                        var location = line_item.getValue({ name: 'companyname' });
                        var year = (date_object.getFullYear()).split('');
                        var year_code = year[2] + year[3];
                        var month = date_object.getMonth();
                        if (month < 10){
                            var month_code = '0' + month;
                        } else{
                            var month_code = month;
                        }
                        var invoice_code = name_code + year_code + month_code

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
                        var state = line_item.getValue({ name: 'location' });
                        // var location = line_item.getValue({ name: 'companyname' });
                        var type = line_item.getValue({ name: 'custbody_inv_type'});
                        var item = line_item.getValue({ name: 'item'});
                        var details = line_item.getValue({ name: 'custcol1'});
                        var ref = line_item.getValue({ name: ''})
                        var qty = line_item.getValue({ name: ''})
                        var rate = line_item.getValue({ name: 'rate'})
                        amount += line_item.getValue({ name: 'amount'});
                        gst += line_item.getValue({ name: 'taxamount'});
                        gross += line_item.getValue({ name: "formulacurrency", formula: '{amount}+{taxamount}'});

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

        
        log.debug({
            title: 'JSON String',
            details: consol_inv_json
        })
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
            
            // console.log('PDF File' + merge)
            log.debug({
                title: 'PDF File - Merge',
                details: merge
            })
            // var fileSCFORM = nlapiMergeRecord(prod_usage_report[x], 'customer', old_customer_id, null, null, merge);
            // fileSCFORM.setName('MPEX_ProductUsageReport_' + getDate() + '_' + old_customer_id + '_' + (x + 1) + '.pdf');
            // fileSCFORM.setIsOnline(true);
            // fileSCFORM.setFolder(2177205);

            // var id = nlapiSubmitFile(fileSCFORM);

            var filePDF = file.load('Templates/PDF Templates/Consolidation Invoice - ' + consol_method + ' Template.pdf');
            var myPDFFile = render.create();
            myPDFFile.templateContent = filePDF.getContents();
            myPDFFile.addCustomDataSource({
                alias: 'JSON',
                format: render.DataSource.OBJECT,
                data: JSON.parse(merge)
            });
            myPDFFile.setFolder(2775794);
            var newPDF = myPDFFile.renderAsPdf();
            var newPDFSave = myPDFFile.save();
            // console.log(newPDF);
            log.audit({
                title: 'PDF File - Export',
                details: newPDF
            })
        }
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

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }

    return {
        execute: main
    }

});