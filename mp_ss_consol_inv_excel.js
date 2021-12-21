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
    function (runtime, search, record, log, task, currentRecord, format, render) {
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
        var ctx = runtime.getCurrentScript();

        function main() {
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

            //State
            var state_tot_rate = 0;
            var state_sub_total = 0;
            var state_tot_GST = 0;
            var state_total = 0;

            //Branch
            var branch_tot_rate = 0;
            var branch_sub_total = 0;
            var branch_tot_GST = 0;
            var branch_total = 0;

            //Type
            var type_tot_rate = 0;
            var type_sub_total = 0;
            var type_tot_GST = 0;
            var type_total = 0;

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

            var consolInvItemResultsLength = consolInvItemSearch.runPaged().count;
            // console.log('Result Length: ' + consolInvItemResultsLength);
            var consolInvItemResults = consolInvItemSearch.run(); //.getRange({ start: 0, end: consolInvItemResultsLength });
            console.log('Results: ' + JSON.parse(JSON.stringify(consolInvItemResults)));
            var company_name_set = [];
            var location_name_set = [];
            var branch_name_set = [];
            var state_name_set = [];
            var type_name_set = [];

            var index = 0;
            consolInvItemResults.each(function (line_item) {
                console.log('Index Value: ' + index);

                var invoice_id = line_item.getValue({ name: 'internalid' });
                var cust_id = line_item.getValue({ name: 'internalid', join: 'customer' });
                if (consol_method_id == 4) {
                    var subCustRecord = record.load({ type: 'customer', id: cust_id });
                    var sub_parent_id = subCustRecord.getValue({ fieldId: 'parent' })
                    var SubParentRecord = record.load({ type: 'customer', id: sub_parent_id });
                    var sub_parent_name = SubParentRecord.getValue({ fieldId: 'companyname' });
                }

                var type = line_item.getValue({ name: 'formulatext_1', formula: "DECODE({custbody_inv_type},'','Service','AP Products','Product',{custbody_inv_type})" });
                if (isNullorEmpty(type)) {
                    var type = 'Service';
                }
                // var type = line_item.getValue({ name: 'custbody_inv_type'});

                var company_name = line_item.getValue({ name: "formulatext", formula: '{customer.parent}' });
                console.log('Company Name: ' + company_name);
                var company_id = company_name.split(" ")[0];
                var company_id_length = parseInt(company_name.split(" ")[0].length);
                company_name = company_name.slice(company_id_length + 1);

                if (index == 0) {
                    company_name_set.push(company_name);
                    csvTaxSet.push(["Date* " + date + '\n' + "Invoice #" + invoice_code + '\n' + 'Due Date ' + due_date + '\n' + 'ABN ' + abn + '\n' + 'Customer PO# ' + po_box + '\n' + 'Services From ' + service_from + '\n' + 'Services To ' + service_to + '\n' + 'Terms ' + terms]);
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

                // var location = line_item.getValue({ name: 'billaddressee' }); // companyname
                location_name_set.push(location);

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

                var state = line_item.getValue({ name: 'billstate' }); // location
                if (index == 0) {
                    state_name_set.push(state);
                }
                if (location_name_set.indexOf(location) != -1) {
                    if (state_name_set.indexOf(state) != -1) {
                        state_tot_rate += parseFloat(rate.replace(/[]/g, '') * 1);
                        if (!isNullorEmpty(amount)) {
                            console.log('State: Amount' + amount);
                            state_sub_total += parseFloat(amount.replace(/[]/g, '') * 1);
                            console.log('State: Sub Total' + sub_total);
                        }
                        state_tot_GST += parseFloat(gst.replace(/[]/g, '') * 1);
                        state_total += parseFloat(gross.replace(/[]/g, '') * 1);
                    } else {
                        console.log('State: New State')
                        state_name_set.push(state);
                    }

                }
                console.log('State: State ' + state);
                console.log('State: Index ' + state_name_set.indexOf(state))
                console.log('State: List ' + JSON.stringify(state_name_set));

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
                // if (consol_method_id == 4) {
                //     invDataSet.push([company_name, sub_parent_name, state, location, type, item, details, ref, qty, rate, amount, gst, gross, company_id]);
                //     csvTableSet.push([company_name, sub_parent_name, state, location, type, item, details, ref_val, qty, rate, amount, gst, gross])
                // } else {
                // if (consol_method_id == 2){
                //     var state_list_length = state_name_set.length;
                //     if (state_name_set.indexOf(state) != state_list_length-1){
                //         console.log('State: Load DIV');

                //         // state_tot_rate = state_tot_rate.toFixed(2);
                //         // state_sub_total = state_sub_total.toFixed(2);
                //         // state_tot_GST = state_tot_GST.toFixed(2);
                //         // state_total = state_total.toFixed(2);

                //         var company_list_length = company_name_set.length;

                //         var previous_company_name = company_name_set[company_list_length - 1];
                //         var previous_state_name = state_name_set[state_list_length - 1];
                //         invDataSet.push([previous_company_name, previous_state_name + ' Total', '','','','','','', state_tot_rate, state_sub_total, state_tot_GST, state_total]); //<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="'+company_id+'" class="downloadPDF btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Download PDF</button>
                //         // state_name_set = [];
                //         // state_name_set.push(state);

                //         state_tot_rate = 0;
                //         state_sub_total = 0;
                //         state_tot_GST = 0;
                //         state_total = 0;
                //     }
                // }

                if ((company_name_set.indexOf(company_name) == -1 && index != 0) || index == (consolInvItemResultsLength - 1)) {
                    tot_rate = (tot_rate / tot_rate_index);
                    tot_rate = tot_rate.toFixed(2);
                    sub_total = sub_total.toFixed(2);
                    tot_GST = tot_GST.toFixed(2);
                    total = total.toFixed(2);

                    var list_length = company_name_set.length;
                    console.log('Company Name Set Length: ' + list_length)
                    var previous_company_name = company_name_set[list_length - 1];
                    console.log('Load New Line' + company_name_set, company_name, tot_rate, sub_total, tot_GST, total)
                    company_name_set.push(company_name);

                    var state_list_length = state_name_set.length;
                    var previous_state_name = state_name_set[state_list_length - 1];

                    // csvTaxSet.push(["Date* " + date +'\n'+  "Invoice #" + invoice_code +'\n'+ 'Due Date ' + due_date +'\n'+ 'ABN ' + abn +'\n'+ 'Customer PO# ' + po_box +'\n'+ 'Services From ' + service_from +'\n'+ 'Services To ' + service_to +'\n'+ 'Terms ' + terms]);
                    // csvBillSet.push([billaddress]);
                    // csvTotalSet.push([sub_total, tot_GST, total]);

                    invDataSet.push([previous_company_name + ' Total', previous_state_name, '', '', '', '', '<button style="background-color: #FBEA51; color: #103D39; font-weight: 700; border-color: transparent; border-width: 2px; border-radius: 15px; height: 30px" type="button" id="' + company_id + '" class="downloadPDF btn btn-block-form btn-primary mt-3 lift get-in-touch-button get-in-touch-button-submit">Download PDF</button>', '', tot_rate, sub_total, tot_GST, total]);
                    csvTableSet.push([previous_company_name + ' Total', previous_state_name, '', '', '', '', '', '', tot_rate, sub_total, tot_GST, total])
                    // invDataSet.push(['','','','','','','','','','','','']);

                    state_name_set = [];

                    tot_rate = 0;
                    sub_total = 0;
                    tot_GST = 0;
                    total = 0;

                    state_tot_rate = 0;
                    state_sub_total = 0;
                    state_tot_GST = 0;
                    state_total = 0;
                }
                invDataSet.push([company_name, state, location, type, item, details, ref, qty, rate, amount, gst, gross, company_id]);
                csvTableSet.push([company_name, state, location, type, item, details, ref_val, qty, rate, amount, gst, gross])
                // }

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

            if (!isNullorEmpty(csvDataSet)) {
                saveCsv(csvDataSet); //exportDataSet
            }

            return true;
        }

        function loadMultiParentScript(date_from, date_to, consol_method_id, period) {
            // clearInterval(load_record_interval);
            // Looks every 15 seconds for the record linked to the parameters zee_id, date_from, date_to and timestamp.
            // load_record_interval = setInterval(loadMPRecord, 15000, date_from, date_to, consol_method_id, period);
            loadMPRecord(date_from, date_to, consol_method_id, period);
        }
        function loadMPRecord(date_from, date_to, consol_method_id, period) {
            var mpSearch = search.load({ type: 'customrecord_consol_inv_json', id: 'customsearch_consol_inv_json' });
            console.log('Consol Method ID: ' + parseFloat(consol_method_id));
            mpSearch.filters.push(search.createFilter({
                name: 'custrecord_consol_inv_method',
                operator: search.Operator.IS,
                values: consol_method_id + '.0'
            }))
            var mpResults = mpSearch.run().getRange({ start: 0, end: 1 });

            mpResults.forEach(function (mpItem) {
                var mpArray = mpItem.getValue({ name: 'custrecord_consol_inv_json' });
                var mpObject = JSON.parse(mpArray);
                mpObject.sort();

                var csvArray = mpItem.getValue({ name: 'custrecord_consol_inv_csv' });
                if (!csvArray) {
                    csvArray = [];
                } else {
                    var csvObject = JSON.parse(csvArray);
                    csvObject.sort();
                }

                var datatable = $('#inv_preview').DataTable();
                datatable.clear();
                datatable.rows.add(mpObject);
                datatable.draw();

                if (!isNullorEmpty(csvObject)) {
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

            var headers = $('inv_preview').DataTable().columns().header().toArray().map(function (x) { return x.innerText });
            headers = headers.slice(0, headers.length - 1).join(', ');
            if (consol_method_id == 4) {
                headers = ['Matched Parent', 'Sub-Parent', 'State', 'Location', 'Type', 'Item', 'Details', 'Ref#', 'Qty', 'Rate', 'Amount', 'Gst', 'Gross'];
            } else {
                headers = ['Matched Parent', 'State', 'Location', 'Type', 'Item', 'Details', 'Ref#', 'Qty', 'Rate', 'Amount', 'Gst', 'Gross'];
            }

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
            csvDataSet[2].forEach(function (row) { // Table Data Set
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
            var filename = 'Consolidation_Invoice_' + consol_method + '.csv';
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }\

        function saveRecord(context) {
            console.log('Submit Save Record Clicked');


            saveCsv()

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