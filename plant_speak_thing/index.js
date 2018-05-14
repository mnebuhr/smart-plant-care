'use strict'

// https://www.npmjs.com/package/axios
let axios = require('axios');


axios.get('http://www.nebuhr.de/').then( response => {
	console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
});