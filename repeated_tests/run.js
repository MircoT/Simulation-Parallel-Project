(function() {
    'use strict';
    const GofL = require('../gofl_parallel.js');
    const barriers = require('../barriers.js');
    const spawn = require('child_process').spawn;

    let start_time = Date.now();

    var grid = new GofL.Grid(4000, 4000);
    grid.setPoint(1, 2, 1)
        .setPoint(3, 1, 1)
        .setPoint(3, 2, 1)
        .setPoint(3, 3, 1)
        .setPoint(2, 3, 1);
    grid.go(1000);

    let time_elapsed = (Date.now() - start_time) / 1000;

    console.log(`<===== Elapsed time serial simulation: ${time_elapsed} =====>`)

    let simulations = []

    for (let num=0; num != 2; ++num)
    {
        simulations[num] = {};
        simulations[num].proc = spawn("node", ["./sim.js",  "1000", "1000", "4", "4", "1000", "./initial_params.json", "--no-files"], { detached: true, cwd: "../"});
        simulations[num].proc.stdout.on('data', (data) => {
            if (data.indexOf("Elapsed time") !== -1)
                simulations[num].elapsed_time = data;
        });
        simulations[num].proc.on('close', (code) => {
            console.log(`<===== Simulation ${num} ened =====>\n${simulations[num].elapsed_time}`);
        });
    }

})();