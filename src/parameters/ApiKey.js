//@ts-check
"use strict";
/**
 * ./parameters/ApiKey.js
 * an api key taken from a request header (preferred) or query parameter 
 *  
 */
const consts = require('../host/constants');

const enums = require('../environment/enums');

const Param = require('./Param');


// const QUERY_APIKEY_NAME = 'api_key'                          // `api_key` query parameter is no loger supported. 
const THIS_PARAM_NAME = consts.params.names.apiKey;
const HEADER_APIKEY_NAME = enums.request.headers.apiKey         // POST, GET | `x-api-key` | header | POST requests must provide a `x-api-key` header. This option is also preferred for GET requests.

/** 
 * gets the api key from the request header (preferred) or query parameter 
 * apikeys are now all managed in the service endpoint ('apis & services -> credentials') so an apikey registered in enum.apikeys is not required 
 */
class ApiKey extends Param {
    /**
    instance attributes:  
     super.name: "apikey", 
     super.value: ?,
     super.isValid: ?,
    
     constructor arguments  
    * @param {*} req                    // express request
    */
    constructor(req) {
        
        // get apikey - header is preferred
        let headerKey = req.headers[HEADER_APIKEY_NAME];

        // call super                                       
        super(THIS_PARAM_NAME, headerKey, enums.apiKey.default);
    }

}

module.exports = ApiKey;
