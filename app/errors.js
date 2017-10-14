'use strict';

module.exports = {
    NO_BODY : {
        httpCode: 400,
        body: {
            error: 0,
            message: 'Request has no body'
        }
    },
    MISSING_ARGUMENT: {
        httpCode: 400,
        body: {
            error: 1,
            message: 'An argument is missing'
        }
    }
}