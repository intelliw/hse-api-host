//@ts-check
"use strict";
/**
 * ./requests/EnergyGetRequest.js
 * prepares data and response for the energy path 
 */
const enums = require('../host/enums');
const consts = require('../host/constants');

const Response = require('../responses');
const EnergyGetResponse = require('../responses/EnergyGetResponse');

const Request = require('./Request');
const Param = require('../parameters');

/**
 * class EnergyGetRequest validatess parameters and accept headers
 */
class EnergyGet extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this EnergyGetRequest will construct a EnergyGetResponse to produce the response content
    
     instance attributes:  
     super ..
     response : this class sets response only if super does not set it with an error
     
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {
        
        const OPTIONAL = true;

        // parameters                                                   // validate and default all parameters
        let params = {};
        params.energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
        params.period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);
        params.site = new Param('site', req.query.site, consts.DEFAULT_SITE);
        params.productCatalogItems = new Param('productCatalogItems', req.body.productCatalogItems, consts.NONE, consts.NONE, OPTIONAL);

        // super - validate params, auth, accept header
        super(req, params, EnergyGetResponse.produces, EnergyGetResponse.consumes);                 // super validates and sets this.accepts this.isValid, this.isAuthorised params valid

        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid ? new Response.EnergyGetResponse(this.params, this.accept) : this.response;

    }

}


module.exports = EnergyGet;

