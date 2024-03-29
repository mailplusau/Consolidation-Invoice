/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * @Last Modified by:   Anesu Chakaingesu
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function (runtime, search, record, log, task, currentRecord, format) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        var ctx = runtime.getCurrentScript();
        var currRec = currentRecord.get();
        var indexInCallback = 0;
        var index = 0;

        function main() {

            

            var date_from = ctx.getParameter({ name: 'custscript_consol_inv_date_from' });
            if (isNullorEmpty(date_from) || isNaN(date_to)) {
                date_from = '1/1/2020';
            }
            var date_to = ctx.getParameter({ name: 'custscript_consol_inv_date_to' });
            if (isNullorEmpty(date_to) || isNaN(date_to)) {
                date_to = getDate();
            }
            var consol_method_id = parseInt(ctx.getParameter({ name: 'custscript_consol_inv_method_id' }));
            if (isNullorEmpty(consol_method_id) || isNaN(consol_method_id)) {
                consol_method_id = 1;
            }
            var consol_method = '';
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

            var period = ctx.getParameter({ name: 'custscript_consol_inv_period' });
            if (isNullorEmpty(period) || isNaN(period)) {
                period = 0;
            }
            var custid = ctx.getParameter({ name: 'custscript_consol_inv_cust_id' });
            if (isNullorEmpty(custid) || isNaN(custid)) {
                custid = 0;
            }
            var sub_custid = 0;

            var invDataSet = ctx.getParameter({ name: 'custscript_consol_inv_data_set' });
            if (isNullorEmpty(invDataSet)) {
                invDataSet = JSON.parse(JSON.stringify([]));
            } else {
                invDataSet = JSON.parse(invDataSet);
            }
            var csvTableSet = ctx.getParameter({ name: 'custscript_consol_inv_csv_table' });
            if (isNullorEmpty(csvTableSet)) {
                csvTableSet = JSON.parse(JSON.stringify([]));
            } else {
                csvTableSet = JSON.parse(csvTableSet);
            }
            var csvDataSet = ctx.getParameter({ name: 'custscript_consol_inv_csv_data' });
            if (isNullorEmpty(csvDataSet)) {
                csvDataSet = JSON.parse(JSON.stringify([]));
            } else {
                csvDataSet = JSON.parse(csvDataSet);
            }

            var invoice_id_set = ctx.getParameter({ name: 'custscript_consol_inv_invoice_id_set' });
            if (isNullorEmpty(invoice_id_set)) {
                invoice_id_set = JSON.parse(JSON.stringify([]));
            } else {
                invoice_id_set = JSON.parse(invoice_id_set);
            }
            var main_index = ctx.getParameter({ name: 'custscript_consol_inv_main_index' });
            if (isNullorEmpty(main_index)) {
                main_index = 0;
            }

            deleteResultRecord(consol_method_id);

            // var timestamp = custscript_consol_inv_timestamp
            log.debug({
                title: 'main_index',
                details: main_index
            });

            log.debug({
                title: 'Loaded div'
            });
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

            var company_name_set = [];
            var location_name_set = [];
            var branch_name_set = [];
            var state_name_set = [];
            var type_name_set = [];
            var subparent_name_set = []
            var invoice_set = [];

            var csvBillSet = [];
            var csvTaxSet = [];
            var csvOrder = []

            var invResultSet = invoiceSearch(date_from, date_to, consol_method_id, custid, period);
            var consolInvItemResultsLength = invResultSet.runPaged().count;
            log.debug({
                title: 'consolInvItemResultsLength',
                details: consolInvItemResultsLength
            });
            var consolInvItemResults = invResultSet.run(); //.getRange({ start: 0, end: consolInvItemResultsLength });
            // var resultsSet = invResultSet.getRange({
            //     start: main_index,
            //     end: main_index + 999
            // });
            // TEST RUN
            // var invResultSet = invoiceSearch(date_from, date_to, consol_method_id, custid, period);
            // var resultsSet = invResultSet.getRange({
            //     start: 0,
            //     end: 10
            // });
            log.debug({
                title: 'Data Set',
                details: JSON.stringify(invResultSet)
            });
            consolInvItemResults.each(function (line_item) {
                indexInCallback = index;
                // log.debug({
                //     title: 'In Loop'
                // });

                var usageLimit = ctx.getRemainingUsage();
                if (usageLimit < 100 || index == 999) {
                    params = {
                        custscript_consol_inv_main_index: main_index + index,
                        custscript_consol_inv_date_from: date_from,
                        custscript_consol_inv_date_to: date_to,
                        custscript_consol_inv_method_id: consol_method_id,
                        custscript_consol_inv_cust_id: custid,
                        custscript_consol_inv_id_set: JSON.stringify(invoice_id_set),
                        custscript_consol_inv_json: JSON.stringify(invDataSet),
                        custscript_consol_inv_csv_table: JSON.stringify(csvTableSet),
                        custscript_consol_inv_csv_data: JSON.stringify(csvDataSet)
                    };
                    log.error({
                        title: 'Invoice ID Set - Length',
                        details: invoice_id_set.length
                    });
                    var reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ss_consol_inv_json',
                        deploymentId: 'customdeploy_ss_ss_consol_inv_json',
                        params: params
                    });
                    var reschedule_id = reschedule.submit();
                    log.error({
                        title: 'Attempting: Rescheduling Script',
                        details: reschedule
                    });

                    return false;
                } else {

                    log.debug({
                        title: 'Index Value',
                        details: index
                    });

                    if (consol_method_id == 1 || consol_method_id == 3) { // If Branch and Invoice Type, Use Search Get Result Type 1. Else use Search Get Result Type 2 
                        var gross = line_item.getValue({ name: "formulacurrency", formula: '{amount}+{taxamount}' });
                        if (gross == 0 || gross == '0.00' || gross == '.00') {
                            return true;
                        }
    
                        var invoice_id = line_item.getValue({ name: 'internalid' });
                        log.debug({
                            title: 'Invoice ID',
                            details: invoice_id
                        })
                        invoice_set.push(invoice_id);
                        var cust_id = line_item.getValue({ name: 'internalid', join: 'customer' });
    
                        var subCustRecord = record.load({ type: 'customer', id: cust_id });
                        var sub_parent_id = subCustRecord.getValue({ fieldId: 'parent' })
                        var SubParentRecord = record.load({ type: 'customer', id: sub_parent_id });
                        var sub_parent_name = SubParentRecord.getValue({ fieldId: 'companyname' });
                        // console.log('Sub Parent: ' + sub_parent_name);
    
    
                        if (index == 0) {
                            subparent_name_set.push(sub_parent_name);
                        }
    
    
                        // var type = line_item.getValue({ name: 'formulatext_1', formula: "DECODE({custbody_inv_type},'','Service','AP Products','Product',{custbody_inv_type})" });
                        var type = line_item.getText({ name: 'custbody_inv_type' });
                        if (isNullorEmpty(type)) {
                            type = 'Service';
                        }
    
    
                        var company_name = line_item.getValue({ name: "formulatext", formula: '{customer.parent}' });
                        // console.log('Company Name: ' + company_name);
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
                            var service_type = '';
                            // log.debug({
                            //     title: 'ITEM ID',
                            //     details: item_id
                            // })
                            if (type == 'MPEX Products' || parseInt(item_id) == 108) {
                                service_type = "noninventoryitem";
                            } else if (parseInt(item_id) == 114) {
                                service_type = 'otherchargeitem'
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
                            // console.log('item: ' + item)
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
                        // console.log('State: ' + state)
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
                        // console.log('Sub Parent: ' + sub_parent_name);
    
                        if (index == 0) {
                            subparent_name_set.push(sub_parent_name);
                        }
    
                        // var type = line_item.getValue({ name: 'formulatext_1', formula: "DECODE({custbody_inv_type},'','Service','AP Products','Product',{custbody_inv_type})" });
                        var type = line_item.getText({ name: 'custbody_inv_type', join: "transaction" });
                        if (isNullorEmpty(type)) {
                            type = 'Service';
                        }
    
    
                        var company_name = line_item.getValue({ name: "formulatext", formula: '{parent}' });
                        // console.log('Company Name: ' + company_name);
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
                            // log.debug({
                            //     title: 'ITEM ID',
                            //     details: item_id
                            // })
                            if (type == 'MPEX Products' || parseInt(item_id) == 108) {
                                service_type = "noninventoryitem";
                            } else if (parseInt(item_id) == 114) {
                                service_type = 'otherchargeitem'
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
                            // console.log('item: ' + item)
                        }
                        //  var item = 'Counter Bankings';
                        var details = line_item.getText({ name: 'custcol1', join: "transaction" });
    
                        var ref_val = line_item.getValue({ name: 'tranid', join: "transaction" })
                        var upload_url_inv = '/app/accounting/transactions/custinvc.nl?id=';
                        var ref = '<a href="' + baseURL + upload_url_inv + invoice_id + '" target="_blank">' + ref_val + '</a>';
                        var qty = line_item.getValue({ name: 'quantity', join: "transaction" })
                        var rate = line_item.getValue({ name: 'rate', join: "transaction" });
                        if (isNullorEmpty(rate)){
                            rate = 0;
                        }
                        var amount = line_item.getValue({ name: 'amount', join: "transaction" });
                        var gst = line_item.getValue({ name: 'taxamount', join: "transaction" });
    
                        // var state = line_item.getValue({ name: 'billstate' }); // location
                        var state = line_item.getText({ name: 'location', join: 'partner' });   
                        // console.log('State: ' + state)
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
                     *  BRANCH (TICK)
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
                        if (branch_name_set.indexOf(location) == -1) { // && branch_tot_rate_index == 1
                            // console.log('Branch: End Branch');
                            log.debug({
                                title: 'Branch: End Branch'
                            })
                            // type_name_set.push(type);
                            branch_tot_rate = (branch_tot_rate / branch_tot_rate_index);
                            branch_tot_rate = branch_tot_rate.toFixed(2);
                            branch_sub_total = branch_sub_total.toFixed(2);
                            branch_tot_GST = branch_tot_GST.toFixed(2);
                            branch_total = branch_total.toFixed(2);
    
                            var branch_list_length = branch_name_set.length;
                            var branch_name = branch_name_set[branch_list_length - 1];
    
                            var branch_list_length = branch_name_set.length;
                            var previous_branch_name = branch_name_set[branch_list_length - 1];
                            
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
    
                            branch_name_set = [];
                            branch_tot_rate_index = 1;
                            branch_tot_rate = parseFloat(rate.replace(/[]/g, '') * 1);
                            branch_sub_total = parseFloat(amount.replace(/[]/g, '') * 1);
                            branch_tot_GST = parseFloat(gst.replace(/[]/g, '') * 1);
                            branch_total = parseFloat(gross.replace(/[]/g, '') * 1);
                        }
                    } else if (consol_method_id == 2 || consol_method_id == 4) {
                        // if (company_name_set.indexOf(company_name) != -1) { // if Company Name is in the list.
                        if (subparent_name_set.indexOf(sub_parent_name) != -1) { // if Sub-Company Name is in the list.
                            if (state_name_set.indexOf(state) != -1) { // If State is in the list. Increment total amount
                                state_tot_rate += parseFloat(rate.replace(/[]/g, '') * 1);
                                state_tot_rate_index++;
                                if (!isNullorEmpty(amount)) {
                                    state_sub_total += parseFloat(amount.replace(/[]/g, '') * 1);
                                }
                                state_tot_GST += parseFloat(gst.replace(/[]/g, '') * 1);
                                state_total += parseFloat(gross.replace(/[]/g, '') * 1);
                            } else { // If state is not in the list, push new state, and push total data above.
                                state_name_set.push(state);

                                state_tot_rate = (state_tot_rate / state_tot_rate_index);
                                state_tot_rate = state_tot_rate.toFixed(2);
                                state_sub_total = state_sub_total.toFixed(2);
                                state_tot_GST = state_tot_GST.toFixed(2);
                                state_total = state_total.toFixed(2);

                                var state_list_length = state_name_set.length;
                                if (state_list_length <= 1) {
                                    var previous_state_name = state_name_set[state_list_length - 1];
                                } else {
                                    var previous_state_name = state_name_set[state_list_length - 2];
                                }

                                var list_length = company_name_set.length;
                                var previous_company_name = company_name_set[list_length - 1];

                                var sub_parent_list_length = subparent_name_set.length;
                                var previous_sub_parent_name = subparent_name_set[sub_parent_list_length - 1];

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
                            state_tot_rate = (state_tot_rate / state_tot_rate_index);
                            state_tot_rate = state_tot_rate.toFixed(2);
                            state_sub_total = state_sub_total.toFixed(2);
                            state_tot_GST = state_tot_GST.toFixed(2);
                            state_total = state_total.toFixed(2);
        
                            var state_list_length = state_name_set.length;
                            var previous_state_name = state_name_set[state_list_length - 1];

                            var list_length = company_name_set.length;
                            var previous_company_name = company_name_set[list_length - 1];
    
                            var sub_parent_list_length = subparent_name_set.length;
                            var previous_sub_parent_name = subparent_name_set[sub_parent_list_length - 1];
                            
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
                                        // console.log('type: Amount' + amount);
                                        type_sub_total += parseFloat(amount.replace(/[]/g, '') * 1);
                                        // console.log('type: Sub Total' + sub_total);
                                    }
                                    type_tot_GST += parseFloat(gst.replace(/[]/g, '') * 1);
                                    type_total += parseFloat(gross.replace(/[]/g, '') * 1);
                                } else {
                                    // console.log('type: New type');
                                    type_name_set.push(type);

                                    type_tot_rate = (type_tot_rate / type_tot_rate_index);
                                    type_tot_rate = type_tot_rate.toFixed(2);
                                    type_sub_total = type_sub_total.toFixed(2);
                                    type_tot_GST = type_tot_GST.toFixed(2);
                                    type_total = type_total.toFixed(2);

                                    // console.log('type Function: type ' + type);
                                    // console.log('type Function: Index ' + type_name_set.indexOf(type))
                                    // console.log('type Function: List ' + JSON.stringify(type_name_set));

                                    var type_list_length = type_name_set.length;
                                    if (type_list_length <= 1) {
                                        var previous_type_name = type_name_set[type_list_length - 1];
                                    } else {
                                        var previous_type_name = type_name_set[type_list_length - 2];
                                    }
                                    // console.log('type Function: Pre-type Name ' + previous_type_name);
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
                            // console.log('type: End type');
                            // type_name_set.push(type);
                            type_tot_rate = (type_tot_rate / type_tot_rate_index);
                            type_tot_rate = type_tot_rate.toFixed(2);
                            type_sub_total = type_sub_total.toFixed(2);
                            type_tot_GST = type_tot_GST.toFixed(2);
                            type_total = type_total.toFixed(2);

                            // console.log('type End: type ' + type);
                            // console.log('type End: Index ' + type_name_set.indexOf(type))
                            // console.log('type End: List ' + JSON.stringify(type_name_set));

                            var type_list_length = type_name_set.length;
                            var previous_type_name = type_name_set[type_list_length - 1];
                            // console.log('type End: Pre-type Name First ' + previous_type_name);

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

                    // log.debug({
                    //     title: 'State Index Outside of Loops: ',
                    //     details: state_name_set.indexOf(state)
                    // });

                    if ((company_name_set.indexOf(company_name) == -1 && index != 0 && index != 1) || index == (consolInvItemResultsLength - 1)) { // When Company Name is New
                        /**
                         * Totals
                         */
                        tot_rate = (tot_rate / tot_rate_index);
                        tot_rate = tot_rate.toFixed(2);
                        sub_total = sub_total.toFixed(2);
                        tot_GST = tot_GST.toFixed(2);
                        total = total.toFixed(2);

                        var list_length = company_name_set.length;
                        log.debug({
                            title: 'Company Name Set Length: ',
                            details: list_length
                        })
                        var previous_company_name = company_name_set[list_length - 1];
                        log.debug({
                            title: 'Load New Line',
                            details: company_name_set + ' ' + company_name + ' ' + tot_rate + ' ' + sub_total + ' ' + tot_GST + ' ' + total
                        })
                        company_name_set.push(company_name);

                        var state_list_length = state_name_set.length;
                        if (state_list_length <= 1) {
                            var previous_state_name = state_name_set[state_list_length - 1];
                        } else {
                            var previous_state_name = state_name_set[state_list_length - 2];
                        }

                        if (consol_method_id == 2 || consol_method_id == 4) {
                            // var sub_parent_list_length = subparent_name_set.length;
                            // var previous_sub_parent_name = sub_parent_name[sub_parent_list_length - 1];
                            invDataSet.push([previous_company_name + ' Total', '', '', '', '', '', '', '', tot_rate, sub_total, tot_GST, total]) //'',
                            // csvTableSet.pop();
                            csvTableSet.push([previous_company_name + ' Total', '', '', '', '', '', '', '', tot_rate, sub_total, tot_GST, total]) //'', 
                            csvTableSet.push(['', '', '', '', '', '', '', '', '', '', '', '']); //, ''
                        } else {
                            invDataSet.push([previous_company_name + ' Total', '', '', '', '', '', '', tot_rate, sub_total, tot_GST, total]); // previous_state_name, | <button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="' + company_id + '" class="downloadPDF btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Download Company Export</button>
                            // csvTableSet.pop();
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

                    // log.debug({
                    //     title: 'Completed Loop: Inv',
                    //     details: JSON.stringify(invDataSet)
                    // });
                    // log.debug({
                    //     title: 'Completed Loop: CSV',
                    //     details: JSON.stringify(csvDataSet)
                    // });
                    index++;
                    return true;
                }
            });

            // csvDataSet.push([csvTaxSet, csvBillSet, csvTableSet]);
            csvDataSet.push(['', '', csvTableSet]);

            log.debug({
                title: ' New Record'
            });
            var rec = record.create({
                type: 'customrecord_consol_inv_json'
            });
            rec.setValue({ fieldId: 'name', value: consol_method })
            rec.setValue({ fieldId: 'custrecord_consol_inv_json', value: JSON.stringify(invDataSet) });
            rec.setValue({ fieldId: 'custrecord_consol_inv_csv', value: JSON.stringify(csvDataSet) });
            rec.setValue({ fieldId: 'custrecord_consol_inv_custid', value: custid });
            rec.setValue({ fieldId: 'custrecord_consol_inv_period', value: period });
            rec.setValue({ fieldId: 'custrecord_consol_inv_method', value: consol_method_id });
            rec.setValue({ fieldId: 'custrecord_consol_inv_sub_custid', value: sub_custid });
            // rec.setValue({ fieldId: '', value: });
            var ticket = rec.save();
            log.debug({
                title: 'Record Save',
                details: ticket
            });

            // while (consol_method_id < 5) {
            //     log.debug({
            //         title: 'End Length',
            //         details: 'Main: ' + main_index + 'Index in Callback: ' + indexInCallback + 'Index: ' + index + 'Result Length: ' + consolInvItemResultsLength
            //     });
            //     if ((main_index + indexInCallback) == consolInvItemResultsLength - 1) {
            //         var consol_method_id_reschedule = consol_method_id + 1;
            //         log.debug({
            //             title: 'Rescheduled: Next Array & Range Incremented',
            //             details: consol_method_id_reschedule
            //         });
            //         var params2 = {
            //             custscript_consol_inv_main_index: 0,
            //             custscript_consol_inv_date_from: null,
            //             custscript_consol_inv_date_to: null,
            //             custscript_consol_inv_method_id: consol_method_id_reschedule,
            //             custscript_consol_inv_cust_id: null,
            //             custscript_consol_inv_id_set: JSON.stringify([]),
            //             custscript_consol_inv_json: JSON.stringify([]),
            //             custscript_consol_inv_csv_table: JSON.stringify([]),
            //             custscript_consol_inv_csv_data: JSON.stringify([])
            //         };
            //         if (consol_method_id_reschedule < 5 || consol_method_id_reschedule != 5) {
            //             var reschedule2 = task.create({
            //                 taskType: task.TaskType.SCHEDULED_SCRIPT,
            //                 scriptId: 'customscript_ss_consol_inv_json',
            //                 deploymentId: 'customdeploy_ss_consol_inv_json',
            //                 params: params2
            //             });
            //             log.debug({
            //                 title: 'Rescheduled: New Schedule'
            //             });
            //             // var reschedule_id2 = reschedule2.submit();
            //             // return true;
            //         }
            //         // return true;
            //     }
            // }
        }

        function invoiceSearch(date_from, date_to, consol_method_id, custid, period) {
            // if (consol_method_id == 1) {
            //     var consolInvItemSearch = search.load({
            //         type: 'invoice',
            //         id: 'customsearch_consol_inv_lineitem_2'
            //     });
            // } else if (consol_method_id == 2) {
            //     var consolInvItemSearch = search.load({
            //         type: 'invoice',
            //         id: 'customsearch_consol_inv_lineitem_3'
            //     });
            // } else if (consol_method_id == 3) {
            //     var consolInvItemSearch = search.load({
            //         type: 'invoice',
            //         id: 'customsearch_consol_inv_lineitem_4'
            //     });
            // }
            // else if (consol_method_id == 4) {
            //     var consolInvItemSearch = search.load({
            //         type: 'invoice',
            //         id: 'customsearch_consol_inv_lineitem_5'
            //     });
            // }
            // consolInvItemSearch.filters.push(search.createFilter({
            //     name: 'custentity_inv_consolidation_mtd',
            //     join: 'customer',
            //     operator: search.Operator.ANYOF,
            //     values: parseInt(consol_method_id)
            // }));
            // // switch (parseInt(period)){
            // //     case 0 : consolInvItemSearch.filters.push(search.createFilter({
            // //         name: 'postingperiod',
            // //         operator: search.Operator.ANYOF,
            // //         values: "LP"
            // //     }));
            // //         break;
            // //     case 1 : consolInvItemSearch.filters.push(search.createFilter({
            // //         name: 'postingperiod',
            // //         operator: search.Operator.ANYOF,
            // //         values: "PBL"
            // //     }));
            // //         break;
            // // }
            // //  filter.push(["trandate", "within", "1/5/2021", "31/5/2021"], "AND", ["formulatext: {customer.parent}", "contains", "71143844 Air Liquide Australia Solutions Pty Ltd- QLD Parent"])
            
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

            return consolInvItemSearch;
        }

        function deleteResultRecord(consol_method_id) {
            var del_index = 0;
            var usage_loopstart_cust = ctx.getRemainingUsage();
            // if (usage_loopstart_cust < 4) { // || index == 3999
            //     // Rescheduling a scheduled script doesn't consumes any governance units.
            //     var delReschedule = task.create({
            //         taskType: task.TaskType.SCHEDULED_SCRIPT,
            //         scriptId: 'customscript_ss_debt_coll_delete',
            //         deploymentId: 'customdeploy_ss_debt_coll_delete'
            //     });
            //     var delResult = delReschedule.submit();
            // }
            log.debug({
                title: 'Delete index',
                details: del_index
            });
            var sea = search.load({
                id: 'customsearch_consol_inv_json',
                type: 'customrecord_consol_inv_json'
            });
            sea.filters.push(search.createFilter({
                name: 'custrecord_consol_inv_method',
                operator: search.Operator.IS,
                values: consol_method_id.toFixed(1)
            }));
            sea.run().each(function(res){
                record.delete({
                    type: 'customrecord_debt_coll_inv',
                    id: res.getValue({name: 'internalid'})
                });
                log.debug({
                    title: 'Removed',
                    details: 'Removed'
                });
                log.debug({
                    title: 'Usage',
                    details: usage_loopstart_cust
                });
                del_index++;
            });
            // Deleting a record consumes 4 governance units.
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
            execute: main
        }
    });