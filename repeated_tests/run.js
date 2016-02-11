(function() {
    'use strict';
    const GofL = require('../gofl_parallel.js');
    const barriers = require('../barriers.js');
    const spawnSync = require('child_process').spawnSync;

    let result = spawnSync("node", ["./sim.js",  "4000", "4000", "1", "1", "100", "./initial_params.json", "--no-files"], {cwd: "../"});

    console.log(result.stdout.toString())

    result = spawnSync("node", ["./sim.js",  "2000", "2000", "2", "2", "100", "./initial_params.json", "--no-files"], {cwd: "../"});

    console.log(result.stdout.toString())

    result = spawnSync("node", ["./sim.js",  "1000", "1000", "4", "4", "100", "./initial_params.json", "--no-files"], {cwd: "../"});

    console.log(result.stdout.toString())

    result = spawnSync("node", ["./sim.js",  "800", "800", "5", "5", "100", "./initial_params.json", "--no-files"], {cwd: "../"});

    console.log(result.stdout.toString())

    result = spawnSync("node", ["./sim.js",  "500", "500", "8", "8", "100", "./initial_params.json", "--no-files"], {cwd: "../"});

    console.log(result.stdout.toString())

    result = spawnSync("node", ["./sim.js",  "400", "400", "10", "10", "100", "./initial_params.json", "--no-files"], {cwd: "../"});

    console.log(result.stdout.toString())

})();