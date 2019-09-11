//@ts-check
"use strict";
/**
 * ./producers/MonitoringInverter.js
 *  Kafka inverter message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const Producer = require('../producers');

const CLIENT_ID = enums.messageBroker.producers.clientId.devices;                   // e.g. 'device.datasets'

/**
 */
class MonitoringInverter extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} sender                                                         //  identifies the source of the data. this value is added to sys.source attribute in addMessage()
    */
    constructor(datasetName, datasets, sender) {

        // construct super
        super(datasetName, datasets, sender, CLIENT_ID);                        // only waits for the leader to acknowledge 

    }


    // adds calculated elements specific to this dataset, into the dataitem e.g. 'pack.volts' and 'pack.watts'
    addDatasetAttributes(key, dataItem) {

        let attrArray = [];
        let watts;
        let volts;

        const PRECISION = 3;

        //  reconstruct dataitem - add new attributes 
        dataItem = {
            inverter_id: key,
            ...dataItem
        }

        // pv.watts
        for (let i = 0; i < dataItem.pv.volts.length; i++) {
            watts = (dataItem.pv.volts[i] * dataItem.pv.amps[i]).toFixed(PRECISION);
            attrArray.push(parseFloat(watts));
        };
        dataItem.pv.watts = attrArray;

        // load.watts
        attrArray = [];
        for (let i = 0; i < dataItem.load.volts.length; i++) {
            watts = (dataItem.load.volts[i] * dataItem.load.amps[i]).toFixed(PRECISION);
            attrArray.push(parseFloat(watts));
        };
        dataItem.load.watts = attrArray;

        // grid.watts == V x I x pf x √3  
        attrArray = [];
        let sqRootOfThree = Math.sqrt(3);

        for (let i = 0; i < dataItem.grid.volts.length; i++) {
            watts = (dataItem.grid.volts[i] * dataItem.grid.amps[i] * dataItem.grid.pf[i] * sqRootOfThree).toFixed(PRECISION);
            attrArray.push(parseFloat(watts));
        };
        dataItem.grid.watts = attrArray;

        return dataItem;

    }

}



module.exports = MonitoringInverter;