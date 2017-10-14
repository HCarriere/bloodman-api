'use strict';

const conf = require('../config');
const md5 = require('md5');
const mongoose = require('mongoose');
let conn;

/**
 * init mongo
 */
function initMongo() {
	mongoose.set('debug', conf.database.mongooseDebug);
	mongoose.Promise = global.Promise;
	logMsg('mongo is initialized');
}

/**
 * open the connection
 * @param  {Function} callback
 */
function openConnection(callback) {
    if(!conn) {
		let options = {server: {
			socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000},
		},
		replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}};
        let address = getAddress();
		conn = mongoose.createConnection(address, options, function(err) {
			if(!err) {
				callback(null);
				logMsg('mongo connected to '+address);
			} else {
				callback(err);
				logMsg('mongo is unable to connect to '+address);
				return;
			}
		});
    } else {
        callback(null);
    }
}

/**
 * close connection
 * @param  {[type]} conn
 */
function closeConnection(conn) {
   // conn.close();
   // console.log('^^^^^^^^^^^^ - connection closed - ^^^^^^^^^^^^');
}

/**
 * log the message
 * @param  {string} msg
 */
function logMsg(msg) {
	if(conf.database.verbose) {
		console.log(msg);
	}
}

/**
 * compose the address from conf & env var
 * @return {[type]}
 */
function getAddress() {
    let address = process.env.DB_PREFIX || conf.database.defaultAddress.prefix;
    address+='://';
    if(process.env.DB_USER && process.env.DB_PASSWORD) {
		address+=process.env.DB_USER+
		':'+
		md5(process.env.DB_PASSWORD+conf.database.salt)+'@';
    }
    address += process.env.DB_NAME || conf.database.defaultAddress.name;
    address+='/';
    address += process.env.DB_DATABASE || conf.database.defaultAddress.database;

    return address;
}

/*
function are always :
function X(schema, callback, ...., .... )
callback are always : (err,result)
*/

/**
 * add object to DB
 * @param {[type]}   schema
 * @param {Function} callback
 * @param {[type]}   object
 */
function addObject(schema, callback, object) {
    openConnection(function(coErr) {
        if(conn) {
            let Model = conn.model(schema.collection, schema.schema);
            let objectFromModel = new Model(object);
            objectFromModel.save(function(err, savedObject) {
                if (err) {
                    callback(err, null);
                    closeConnection();
					return;
                }else{
                    logMsg('Object added to '+schema.collection);
                    callback(null, savedObject);
                    closeConnection();
					return;
                }
            });
        }else{
            callback(coErr, null);
        }
    });
}

/**
 * find object
 * @param  {[type]}   schema
 * @param  {Function} callback
 * @param  {[type]}   jsonRequest
 */
function findObject(schema, callback, jsonRequest) {
    openConnection(function(coErr) {
        if(conn) {
            let model = conn.model(schema.collection, schema.schema);
            model.find(jsonRequest, function(err, result) {
                if(err) {
                    closeConnection();
                    callback(err, null);
					return;
                }
                closeConnection();
                callback(null, result);
				return;
            });
        }else{
            callback(coErr, null);
        }
    });
}

/**
 * find object with ooptions
 * @param  {Schema}   schema
 * @param  {Function} callback
 * @param  {JSON}   jsonRequest
 * @param  {number}   limit
 * @param  {JSON}   sort
 * @param  {number}   offset
 */
function findObjectWithOptions(
	schema,
	callback,
	jsonRequest,
	limit,
	sort,
	offset) {
    openConnection(function(coErr) {
        if(conn) {
			if(!offset || offset < 0) offset = 0;
            let model = conn.model(schema.collection, schema.schema);
            model.find(jsonRequest, function(err, result) {
                if(err) {
                    closeConnection();
                    callback(err, null);
					return;
                }
                closeConnection();
                callback(null, result);
				return;
            })
            .limit(limit)
            .sort(sort)
			.skip(offset)
			;
        }else{
            callback(coErr, null);
        }
    });
}

/**
 * find a unique object
 * @param  {[type]}   schema
 * @param  {Function} callback
 * @param  {[type]}   jsonRequest
 */
function findOne(schema, callback, jsonRequest) {
    openConnection(function(coErr) {
        if(conn) {
            let model = conn.model(schema.collection, schema.schema);
            model.findOne(jsonRequest, function(err, result) {
                if(err) {
                    closeConnection();
                    callback(err, null);
					return;
                }
                closeConnection();
                callback(null, result);
				return;
            });
        } else {
            callback(coErr, null);
        }
    });
}

/**
 * find by id
 * @param  {[type]}   schema
 * @param  {Function} callback
 * @param  {[type]}   id
 */
function findById(schema, callback, id) {
    openConnection(function(coErr) {
        if(conn) {
            let model = conn.model(schema.collection, schema.schema);

			model.findById(id, function(err, result) {
				if(err) {
					closeConnection();
					callback(err, null);
					return;
				}
				closeConnection();
				callback(null, result);
				return;
			});
        } else {
            callback(coErr, null);
        }
    });
}

/**
 * find distinct
 * @param  {[type]}   schema
 * @param  {Function} callback
 * @param  {String}   prop
 */
function findDistinct(schema, callback, prop) {
    openConnection(function(coErr) {
        if(conn) {
            let model = conn.model(schema.collection, schema.schema);

			model.find().distinct(prop, function(err, results) {
				if(err) {
					closeConnection();
					callback(err, null);
					return;
				}
				closeConnection();
				callback(null, results);
				return;
			});
        } else {
            callback(coErr, null);
        }
    });
}

/**
 * remove by id
 * @param  {[type]}   schema
 * @param  {Function} callback
 * @param  {[type]}   id
 */
function removeById(schema, callback, id) {
    openConnection(function(coErr) {
        if(conn) {
            let model = conn.model(schema.collection, schema.schema);
            model.findById(id).remove(function(err, result) {
                if(err) {
                    closeConnection();
                    callback(err, null);
					return;
                }
                closeConnection();
                callback(null, result);
				return;
            });
        }else{
            callback(coErr, null);
        }
    });
}

/**
 * update objects
 * @param  {[type]}   schema
 * @param  {Function} callback
 * @param  {[type]}   condition
 * @param  {[type]}   update
 * @param  {[type]}   option
 */
function updateObject(schema, callback, condition, update, option) {
    openConnection(function(coErr) {
        if(conn) {
            let model = conn.model(schema.collection, schema.schema);
            model.update(condition, update, option, function(err) {
                if (err) {
                    closeConnection();
                    callback(err, null);
					return;
                }
                closeConnection();
                callback(null, 'update ok');
				return;
            });
        }else{
            callback(coErr, null);
        }
    });
}

/**
 * remove objects
 * @param  {[type]}   schema
 * @param  {Function} callback
 * @param  {[type]}   condition
 */
function removeObject(schema, callback, condition) {
    openConnection(function(coErr) {
        if(conn) {
            let model = conn.model(schema.collection, schema.schema);
            model.remove(condition, function(err) {
                if (err) {
                    closeConnection();
                    callback(err, null);
					return;
                }
                closeConnection();
                callback(err, 'remove ok');
				return;
            });
        }else{
            callback(coErr, nulll);
        }
    });
}

/**
 * count objects
 * @param  {[type]}   schema
 * @param  {Function} callback
 * @param  {[type]}   condition
 */
function count(schema, callback, condition) {
    openConnection(function(coErr) {
        if(conn) {
            let model = conn.model(schema.collection, schema.schema);
            model.count(condition, function(err, count) {
                if(!err && count) {
                    closeConnection();
                    callback(null, count);
					return;
                }else {
                    closeConnection();
                    callback(err, null);
					return;
                }
            });
        }else{
            callback(coErr, null);
        }
    });
}


/**
 * methode de test. envoi de maniere recursive des données dans la DB
 mongoOperation : 1 seule opération
 schema : 1 seul schema
 dataArray plusieurs object dans le dataArray
 current : par ou commence l'array
 onDone() : action executée à la fin
 * @param  {[type]} mongoOperation
 * @param  {[type]} schema
 * @param  {[type]} dataArray
 * @param  {[type]} current
 * @param  {[type]} onDone
 */
function processFunction(mongoOperation, schema, dataArray, current, onDone) {
    if(current >= dataArray.length || current < 0) {
        console.log('done.');
        onDone();
        return;
    }
    console.log('operation '+(current+1)+'/'+dataArray.length+':');
    mongoOperation(schema, function(err, result) {
        if(err) {
            console.log('error on '+(current+1)+' : '+err);
        }else{
            console.log('operation '+(current+1)+' executed with success !');
        }
        processFunction(mongoOperation, schema, dataArray, current + 1, onDone);
    }, dataArray[current]);
}


let ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = {
	initMongo: initMongo,
    add: addObject,
    find: findObject,
    findOne: findOne,
    findById: findById,
    update: updateObject,
    remove: removeObject,
    removeById: removeById,
    count: count,
    findWithOptions: findObjectWithOptions,
    findDistinct: findDistinct,
    ObjectId: ObjectId,
    processFunction: processFunction,
};
