/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
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

define(['N/error', 'N/record', 'N/runtime','N/search'],
    function(error, record, runtime, search) {
        /**
        * Marks the beginning of the Map/Reduce process and generates input data.
        *
        * @typedef {Object} ObjectRef
        * @property {number} id - Internal ID of the record instance
        * @property {string} type - Record type id
        *
        * @return {Array|Object|Search|RecordRef} inputSummary
        * @since 2015.1
        */
        function getInputData() {   
            //Dynamically create Saved Search to grab all eligible Sales orders to invoice
            //In this example, we are grabbing all main level data where sales order status are 
            //any of Pending Billing or Pending Billing/Partially Fulfilled
            return search.create({
                'type':search.Type.SALES_ORDER,
                'filters':[
                                ['mainline', search.Operator.IS, true],
                                'and',
                                ['status', search.Operator.ANYOF, ['SalesOrd:E', 'SalesOrd:F']]
                        ],
                'columns':[
                                'internalid',
                                'transactionnumber',
                                'statusref',
                                'entity',
                                search.createColumn({
                                    'name':'trandate',
                                    'sort':search.Sort.ASC
                                })
                        ]
            });
        }

        /**
        * Executes when the map entry point is triggered and applies to each key/value pair.
        *
        * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
        * @since 2015.1
        */
        function map(context) {
            log.debug('context', context.value);
            
            //Text value of context.value that was passed in to map stage from getInputData stage.
            //	Each result from search is returned as JSON object. 
            //	Depending on what you are returning from search, your JSON object will look different
            /**
             {
                 "recordType":"salesorder",
                "id":"171566",
                "values":{
                    "internalid":{
                        "value":"171566",
                        "text":"171566"
                    },
                    "transactionnumber":"21210",
                    "statusref":{
                        "value":"pendingBilling",
                        "text":"Pending Billing"
                    },
                    "entity":{
                        "value":"8113",
                        "text":"xxxxxx"
                    },
                    "trandate":"12/21/2017"
                }
            }
            */
            
            var rowJson = JSON.parse(context.value);
            
            //Transform salesorder into an invoice
            var invrec = record.transform({
                'fromType':record.Type.SALES_ORDER,
                'fromId':rowJson.values['internalid'].value,
                'toType':record.Type.INVOICE
            });
            
            //Let's save it 
            var invoiceid = invrec.save({
                'enableSourcing':true,
                'ignoreMandatoryFields':true
            });
            
            log.debug('generated invoice id', invoiceid);
        }

        /**
        * Executes when the summarize entry point is triggered and applies to the result set.
        *
        * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
        * @since 2015.1
        */
        function summarize(summary) {
            log.debug('Summary Time','Total Seconds: '+summary.seconds);
            log.debug('Summary Usage', 'Total Usage: '+summary.usage);
            log.debug('Summary Yields', 'Total Yields: '+summary.yields);
            
            log.debug('Input Summary: ', JSON.stringify(summary.inputSummary));
            log.debug('Map Summary: ', JSON.stringify(summary.mapSummary));
            log.debug('Reduce Summary: ', JSON.stringify(summary.reduceSummary));
            
            //Grab Map errors
            summary.mapSummary.errors.iterator().each(function(key, value) {
                log.error(key, 'ERROR String: '+value);
                
                
                return true;
            });
        }

        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };

});