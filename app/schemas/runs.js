'use strict';

const mongoose = require('mongoose');
const conf = require('../../config');


let schema = {
    schema: new mongoose.Schema({
        map: String,
        data: String,
        time: Number,
    }),
    collection: conf.database.collections.runs,
};


module.exports = schema;
