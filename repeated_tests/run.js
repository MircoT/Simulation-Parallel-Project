(function() {
    'use strict';

    const spawnSync = require('child_process').spawnSync;
    const fs = require('fs');

    const width = 512;
    const height = 512;
    const num_steps = 20;
    const repetition = 2;
    let matrix = [];
    let tmp_params = null;
    let result = null;

    for (let x=0; x !== height; ++x)
    {
        matrix[x] = [];
        for (let y=0; y !== width; ++y)
        {
            matrix[x][y] = Math.round(Math.random() * 1);
        }
    }

    function create_initial_params(workers_x_row, workers_x_col)
    {   
        let cells_row = height / workers_x_row;
        let cells_col = width / workers_x_col;
        let initial_params = {};

        let configuration = [];

        for (let x=0; x !== workers_x_row; ++x)
        {
            configuration[x] = [];
            for (let y=0; y !== workers_x_col; ++y)
            {   
                configuration[x][y] = (y + x*workers_x_col) + 1;
            }
        }

        for (let x=0; x !== height; ++x)
        {
            for (let y=0; y !== width; ++y)
            {   
                if (matrix[x][y] === 1)
                {   
                    let col_index = Math.floor(y / cells_col);
                    let row_index = Math.floor(x / cells_row);

                    if (!initial_params.hasOwnProperty(configuration[row_index][col_index]))
                        initial_params[configuration[row_index][col_index]] = [];

                    initial_params[configuration[row_index][col_index]].push({row: (x%cells_row)+1, col: (y%cells_col)+1, val: 1});
                }
            }
        }

        return initial_params;
    }

    for (let cur_rep=0; cur_rep !== repetition; ++cur_rep)
    {
        tmp_params = create_initial_params(Math.pow(2, cur_rep), Math.pow(2, cur_rep));
        fs.writeFileSync("./tmp_params.json", JSON.stringify(tmp_params, null, 2));
        result = spawnSync("node", 
            [
                "../sim.js",  
                width / Math.pow(2, cur_rep), 
                height / Math.pow(2, cur_rep), 
                Math.pow(2, cur_rep), 
                Math.pow(2, cur_rep), 
                num_steps,
                "tmp_params.json", 
                "-zip",
                `-name=${width}x${height}x${num_steps}_${Math.pow(2, cur_rep)*Math.pow(2, cur_rep)}`
            ]
        );
        console.log(result.stdout.toString());
    }

    fs.unlinkSync("./tmp_params.json");

})();