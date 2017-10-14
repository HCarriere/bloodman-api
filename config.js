'use strict';

module.exports = {
    database: {
       // name: 'mongodb://root:<t2...>@ds029575.mlab.com:29575/pire-to-pire',
        defaultAddress:{
            prefix:'mongodb',
            name:'localhost',
            database:'bloodman'
        },
        collections : {
            runs: 'run'
        },
		verbose:false,
		mongooseDebug:false
    },
    session:{
        secret: 'sef684sef65814esf'
    },
    server:{
        port:3000
    },
}