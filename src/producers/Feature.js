//@ts-check
"use strict";
/**
 * ./producers/Feature.js
 *  topic producer for feature toggles - to propogate configuration changes from host to consumer through message broker 
 */
const KafkaProducer = require('./KafkaProducer');

const log = require('../host').log;

class Feature extends KafkaProducer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiPathIdentifier                                                             // enums.features
     * kafkaTopic                                                                    // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                  // identifer based on the api path: this is typically from enums.params.datasets - e.g. pms; or 
     */
    constructor(apiPathIdentifier, kafkaTopic) {
        
        super(apiPathIdentifier, kafkaTopic);

    }

    /** extracts an array of modified data items and sends these as messages to the broker 
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(data, sender) {


        // send the message to the topics
        try {

            let msgObj = { itemCount: 1, messages: [] };
            msgObj.messages.push(super.createMessage(this.apiPathIdentifier, data));   // add to the message array. the key is the feature name e.g. 'logging'
            super.sendToTopic(msgObj, sender);

        } catch (e) {
            log.error(`${this.apiPathIdentifier} sendToTopic`, e);
        }

    }

}


module.exports = Feature;