'use strict';

const mongo = require('./mongo');
const RunsSchema = require('./schemas/runs');
const errors = require('./errors');

// return best score&run for the map
function getBestRun(req, callback) {
    let map = req.params.map;
    if(!map) {
        callback(errors.MISSING_ARGUMENT);
        return;
    }
    /* 
    @param  {Schema}   schema
 * @param  {Function} callback
 * @param  {JSON}   jsonRequest
 * @param  {number}   limit
 * @param  {JSON}   sort
 * @param  {number}   offset
    */
    mongo.findWithOptions(RunsSchema, (err, data) => {
        callback({
            httpCode: 200,
            body: data,
        });
    }, {
        map: map
    }, 1, {
        time: 1
    });
}


// return the amount of attempts for the map
function getAttempts(req, callback) {
    let map = req.params.map;
    if(!map) {
        callback(errors.MISSING_ARGUMENT);
        return;
    }
    
    mongo.count(RunsSchema, (err, count) => {
        callback({
            httpCode: 200,
            body: count,
        });
    }, {
        map: map,
    });
}

// save the run (save data only if new record.)
function saveRun(req, callback) {
    if(!req.body) {
        callback(errors.NO_BODY);
        return;
    }
    
    let time = req.body.time;
    let data = req.body.data;
    let map = req.body.map;
    if(!time || !data || !map) {
        callback(errors.MISSING_ARGUMENT);
        return;
    }
    
    // save run data only if it's the best
    mongo.count(RunsSchema, (err, count) => {
        if(count > 0) {
            data = null;
        }
        // register run
        mongo.add(RunsSchema, (err, savedRun) => {
            callback({
                httpCode: 200,
                body: savedRun,
            });
        }, {
            time: time,
            data: data,
            map: map,
        });
    }, {
        time: { $lte: time },
        map: map,
    });
}



module.exports = {
    getBestRun,
    getAttempts,
    saveRun,
}