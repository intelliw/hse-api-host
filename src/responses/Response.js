//@ts-check
"use strict";
/**
 * ./responses/Response.js
 *  base type for view responses  
 * 
 */
// creates a response objectr for rendering and sending. 

class Response {

    constructor(view, status, content, mimetype) {
        this.view = view;
        this.status = status;
        this.content = content;
        this.contentType = mimetype;
    }

    /**
     * returns a list of mimetypes which this response is able to produce. 
     * the default mimetype must be the first item
     * this list must match the list specified in the 'produces' property in the openapi spec
     */
    produces() { 
        
        // SUBCLASS MUST OVERRIDE
       
    }

}

module.exports = Response;
