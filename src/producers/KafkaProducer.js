//@ts-check
"use strict";
/**
 * ./producers/KafkaProducer.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');

const env = require('../environment');

class KafkaProducer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiDatasetName                                                               // enums.params.datasets
     * kafkaTopic                                                                   // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiDatasetName                                                    // enums.params.datasets              - e.g. pms       
     */
    constructor(apiDatasetName, kafkaTopic) {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers,                 //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: env.active.kafkajs.producer.clientId,
            retry: env.active.kafkajs.producer.retry,                                   // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: env.active.kafkajs.producer.connectionTimeout,           // milliseconds to wait for a successful connection   
            requestTimeout: env.active.kafkajs.producer.requestTimeout                  // milliseconds to wait for a successful request.     
        });

        // instance variables
        this.producerObj = kafka.producer();
        this.apiDatasetName = apiDatasetName;
        this.kafkaTopic = kafkaTopic;
    }


    /** implemented by subtype
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(datasets, sender) {

    }

}


module.exports = KafkaProducer;
