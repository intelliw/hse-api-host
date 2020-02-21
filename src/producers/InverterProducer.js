//@ts-check
'use strict';
/**
 * ./producers/InverterProducer.js
 *  base type for Kafka message producers  
 */
const consts = require('../host/constants');

const env = require('../environment/env');
const enums = require('../environment/enums');
const utils = require('../environment/utils');
const log = require('../logger').log;

const moment = require('moment');

const Producer = require('./Producer');

const WRITE_TOPIC = env.active.messagebroker.topics.monitoring.inverter;

/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class InverterProducer extends Producer {

    /**
     * instance attributes:  
     * constructor arguments 
     * @param {*}                                                                   
     */
    constructor() {

        super(WRITE_TOPIC);

    }

    /**
     * creates an array of messagebroker messages and returns them in a results object
     */
    transform(datasets, senderId) {

        let key, status;
        let dataItemCount = 0;

        let volts, amps, watts, pf, is3phase;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;
        const ITEMNUMBER_LENGTH = 2;                                                                // how many digits int he cell number e.g 02
        const SQ_ROOT_OF_THREE = Math.sqrt(3);

        let transformedMsgObj = { itemCount: 0, messages: [] };

        // extract and add messages to results 
        datasets.forEach(dataset => {

            key = dataset.inverter_id;
            status = dataset.status;                                                            //      "status": { "code": "0001", "temp": 48.3 }

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                                                  // e.g. "data": [ { "time_local": "2

                //  reconstruct dataitem - add new attributes and flatten arrays 
                let dataObj = {
                    inverter_id: key
                }

                // pv
                attrArray = [];
                for (let i = 1; i <= dataItem.pv.volts.length; i++) {
                    volts = dataItem.pv.volts[i - 1];
                    amps = dataItem.pv.amps[i - 1];
                    watts = (volts * amps).toFixed(PRECISION);

                    attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
                };
                dataObj.pv = attrArray;                                                                     // "pv": [ {"volts": 48, "amps": 6, "watts": 288 },

                // battery
                volts = dataItem.battery.volts;
                amps = dataItem.battery.amps;
                watts = (volts * amps).toFixed(PRECISION);

                dataObj.battery = {                                                                         //   "battery": {
                    volts: volts, amps: amps, watts: parseFloat(watts)                                      //      "volts": 55.1, "amps": 0.0, "watts": 0 },
                }

                // load
                attrArray = [];
                for (let i = 1; i <= dataItem.load.volts.length; i++) {
                    volts = dataItem.load.volts[i - 1];
                    amps = dataItem.load.amps[i - 1];
                    watts = (volts * amps).toFixed(PRECISION);

                    attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
                };
                dataObj.load = attrArray;                                                                   // "load": [ {"volts": 48, "amps": 6, "watts": 288 },

                // grid
                attrArray = [];
                is3phase = dataItem.grid.volts.length == 3;                                                 // check if 3 phase - if there are 3 phases the voltage is line-to-linbe voltage   
                for (let i = 1; i <= dataItem.grid.volts.length; i++) {
                    volts = dataItem.grid.volts[i - 1];
                    amps = dataItem.grid.amps[i - 1];
                    pf = dataItem.grid.pf[i - 1];
                    watts = (volts * amps * pf * (is3phase ? SQ_ROOT_OF_THREE : 1)).toFixed(PRECISION);      // for 3 phase grid.watts == V x I x pf x √3. If the supply is single-phase there will be only one element in the array and accordingly the formula used will be formula: `grid.watts` = `grid.volts` * `grid.amps` * `grid.pf`.  

                    attrArray.push({ volts: volts, amps: amps, pf: pf, watts: parseFloat(watts) });
                };
                dataObj.grid = attrArray;

                // status
                let statusBits = utils.hex2bitArray(status.code, consts.equStatus.BIT_LENGTH);              // get a reversed array of bits (bit 0 is least significant bit)
                dataObj.status = {
                    bus_connect: utils.tristateBoolean(statusBits[0], false, true),                         // bit 0    "status": { "bus_connect": true }, 
                }

                // add generic attributes
                dataObj = this._addMetadata(dataObj, dataItem.time_local, senderId);                        //  "sys": { "source": "STAGE001" },

                // add the dataitem to the message buffer
                transformedMsgObj.messages.push(super._createMessage(key, dataObj));                        // add to the message array

            });

            // replace data array with newly created dataItems array
            dataItemCount += dataset.data.length;


        });

        transformedMsgObj.itemCount = dataItemCount;
        return transformedMsgObj;

    }

}



module.exports = InverterProducer;
