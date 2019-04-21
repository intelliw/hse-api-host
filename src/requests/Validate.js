//@ts-check
"use strict";
/**
 * ./requests/Validate.js
 * validation for Request class
 *  
 */
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

/**
* generic validations for a Request
*/
class Validate {

    /**
     * constructor validates the attributes of the Request and sets isValid
    
     instance attributes:  
    "isValid": true if isAcceptTypeValid, isAuthorised,isParamsValid, and isContentTypeValid are all true
    "errors": { GenericMessageDetail }  
    "isAcceptTypeValid": true if a mimetypes in an Accepts header is supported 
    "isContentTypeValid": true if the mimetypes in the Content-Type header is supported 
    "isAuthorised": true,
    "isParamsValid" : true if all params are valid
        
    
     constructor arguments 
    * @param {*} req                    // express request
    * @param {*} requestObj             // application Request object
    */
    constructor(req, requestObj) {

        // errors
        this.errors = new GenericMessageDetail();                                                                   // each validation above added a detail elemeent to the errors object passed in by reference

        // validations               
        this.isAuthorised = validateAuthorisation(req, requestObj.apiKey, this.errors);             // validate authorisation 
        this.isAcceptTypeValid = validateAcceptType(req, requestObj.accept, this.errors);           // validate accept Type 
        this.isContentTypeValid = validateContentType(req, requestObj.contentType, this.errors);    // validate content-type 
        this.isParamsValid = validateParams(req, requestObj.params, this.errors);                   // validate params 

        // isValid 
        this.isValid = this.isAcceptTypeValid
            && this.isContentTypeValid
            && this.isParamsValid
            && this.isAuthorised;
    }

}

// validate if authorised. Adds error details to the errors passed in by reference.
function validateAuthorisation(req, apiKeyParam, errors) {

    const ERROR_MESSAGE = 'The client does not have sufficient permission.';

    let isAuth = false;                                                             // 2DO: current logic allows no key as valid. in future need to call gcloud REST api to check if key is valid and has access to this API          
    if (apiKeyParam) {

        isAuth = apiKeyParam.value ? apiKeyParam.isValid : true;                    // if apiKey is missing defaults to true for now 

        if (!isAuth) {                                                              // check if param was declared valid during construction 

            errors.add(
                `${ERROR_MESSAGE} | ${apiKeyParam.value} | ${req.url}`,
                `parameter: ${apiKeyParam.name}`);                                  // add the message detail to the errors
        }

    }

    return isAuth;
}

// validate params. Adds error details to the errors passed in by reference.    
function validateParams(req, params, errors) {

    const ERROR_MESSAGE = 'The client specified an invalid argument.';

    let param;

    let allParamsValid = true;
    if (params) {

        let paramKeys = Object.keys(params);

        paramKeys.forEach(key => {                                                  // Request.isValid is true only if *all* params are valid
            param = params[key];

            if (!param.isValid) {                                                   // check if param was declared valid during construction 
                errors.add(
                    `${ERROR_MESSAGE} | ${param.value} | ${req.path}`,
                    `${(param.isMandatory && !param.value ? 'mandatory ' : 'invalid')} parameter: ${param.name}`);                                    // add the message detail to the errors
            }
            allParamsValid = allParamsValid && param.isValid;
        });

    }

    return allParamsValid;

}

// validate content type. Adds error details to the errors passed in by reference.
function validateContentType(req, contentTypeParam, errors) {

    const ERROR_MESSAGE = 'Content-Type not supported.';
    const CONTENT_TYPE_HEADER = 'content-type';

    let isContentTypeValid = contentTypeParam.isValid;                              // if content type is undefined it is not valid

    if (!isContentTypeValid) {
        errors.add(
            `${ERROR_MESSAGE} | ${req.headers[CONTENT_TYPE_HEADER]}`,
            `Content-Type header`);                                                 // add the message detail to the errors
    }

    return isContentTypeValid;
}

// validate accept type. Adds error details to the errors passed in by reference.
function validateAcceptType(req, acceptParam, errors) {

    const ERROR_MESSAGE = 'The requested Accept type is not supported.';

    let isAcceptTypeValid = acceptParam.isValid;                                    // if content type is undefined if it was not valid

    if (!isAcceptTypeValid) {
        errors.add(
            `${ERROR_MESSAGE} | ${req.accepts()}`,
            `Accept header`);                                                       // add the message detail to the errors
    }

    return isAcceptTypeValid;
}

module.exports = Validate;
