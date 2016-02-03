(function() {
    'use strict';
    const gofl = require('./gofl_parallel.js');
    const cluster = require('cluster');

    const usage_text = `===== !!! Wrong arguments !!! =====
|
|  Usage:
|
|    node sim.js rows cols wXrow wXcol steps params [-v]
|
|    - rows: number of rows per worker (integer > 0)
|    - cols: number of columns per worker (integer > 0)
|    - wXrow: number of workers in a row (integer > 0)
|    - wXcol: number of workers in a column (integer > 0)
|    - steps: number of steps of the simulation (integer > 0)
|    - params: initial params for each worker (JSON file path)
|
|  The result will be stored in the current working directory
|  inside the folder named 'out'.
|
|  The folder and his contents will be overwritten.
|
=====-`

    // Time interval of the main function of the processes
    const TIME_INTERVAL = 0;
    const fs = require('fs');

    var LOG = false;

    Number.prototype.mod = function(base){ return ((this.valueOf() % base) + base) % base; };

    let isInt = (value) =>
    {
        var x;
        if (isNaN(value)) {
            return false;
        }
        x = parseFloat(value);
        return (x | 0) === x;
    }

    let args = process.argv.slice(2);
    if ((args.length === 1 && (args[0] === "--help" || args[0] === "-h")) ||
         args.length < 6)
    {
        console.log(usage_text);
        process.exit(0);
    }

    if (args.length === 7 && args[6] === "-v")
    {
        if (args[6] !== "-v")
        {
            console.log(usage_text);
            process.exit(0); 
        }
        else
        {
            LOG = true;
        }
    }
    

    let rows = parseInt(args[0]);
    let columns = parseInt(args[1]);
    let workers_x_row = parseInt(args[2]);
    let workers_x_column = parseInt(args[3]);
    let MAX_TIME = parseInt(args[4]);
    let workers_params = null;
    try
    {
        workers_params = JSON.parse(fs.readFileSync(args[5]));
    }
    catch(e)
    {
        console.log(usage_text);
        process.exit(0);
    }

    // Check args
    if(
        !isInt(rows) || rows <= 0 ||
        !isInt(columns) || columns <= 0 ||
        !isInt(workers_x_row) || workers_x_row <= 1 ||
        !isInt(workers_x_column) || workers_x_column <= 1 ||
        !isInt(MAX_TIME) || MAX_TIME < 0
      )
    {
        console.log(usage_text);
        process.exit(0);
    }

    let NUM_WORKERS = workers_x_row * workers_x_column;

    let initial_params = [];
    let configuration = new Map();

    for (let cur_row=0; cur_row != workers_x_row; ++cur_row)
    {   
        configuration.set(cur_row, new Map());
        for (let cur_col=0; cur_col != workers_x_column; ++cur_col)
        {
            let cur_worker_id = cur_col + cur_row*workers_x_column + 1;
            configuration.get(cur_row).set(cur_col, cur_worker_id);
        }
    }

    let getXY = (w_id) =>
    {   
        let result = null;
        configuration.forEach(
            (columns, cur_x) =>
            {
                columns.forEach(
                    (cur_id, cur_y) =>
                    {   
                        if (cur_id === w_id)
                        {
                           result = {row: cur_x, col: cur_y};
                            return; 
                        }   
                    }
                );
                if (result !== null)
                    return;
            }
        );
        return result;
    }

    for (let cur_worker=1; cur_worker <= NUM_WORKERS; ++cur_worker)
    {   
        let coords = getXY(cur_worker);
        let cur_params = {   
            'rows': rows,
            'columns': columns,
            'boundaries': {
                T: configuration.get((coords.row - 1).mod(workers_x_row)).get(coords.col),
                L: configuration.get(coords.row).get((coords.col - 1).mod(workers_x_column)),
                R: configuration.get(coords.row).get((coords.col + 1).mod(workers_x_column)),
                B: configuration.get((coords.row + 1).mod(workers_x_row)).get(coords.col)
            }
        }
        
        if ( (coords.row === 0 && coords.col === 0) ||
             (coords.row === workers_x_row - 1 && coords.col === workers_x_column - 1)
            )
        {
            cur_params.boundaries.TL = configuration.get((coords.row - 1).mod(workers_x_row))
                                         .get((coords.col - 1).mod(workers_x_column));
            cur_params.boundaries.BR = configuration.get((coords.row + 1).mod(workers_x_row))
                                         .get((coords.col + 1).mod(workers_x_column));                   
        }
        else if (
            (coords.row === 0 && coords.col === workers_x_column - 1) ||
            (coords.row === workers_x_row - 1 && coords.col === 0)
            )
        {
            cur_params.boundaries.TR = configuration.get((coords.row - 1).mod(workers_x_row))
                                         .get((coords.col + 1).mod(workers_x_column));
            cur_params.boundaries.BL = configuration.get((coords.row + 1).mod(workers_x_row))
                                         .get((coords.col - 1).mod(workers_x_column));                            
        }
        else if (coords.row === 0)
        {
            cur_params.boundaries.BR = configuration.get((coords.row + 1).mod(workers_x_row))
                                         .get((coords.col + 1).mod(workers_x_column));
            cur_params.boundaries.BL = configuration.get((coords.row + 1).mod(workers_x_row))
                                         .get((coords.col - 1).mod(workers_x_column));                            
        }
        else if (coords.row === workers_x_row - 1)
        {
            cur_params.boundaries.TR = configuration.get((coords.row - 1).mod(workers_x_row))
                                         .get((coords.col + 1).mod(workers_x_column));
            cur_params.boundaries.TL = configuration.get((coords.row - 1).mod(workers_x_row))
                                         .get((coords.col - 1).mod(workers_x_column));
        }
        else if (coords.col === 0)
        {
            cur_params.boundaries.TR = configuration.get((coords.row - 1).mod(workers_x_row))
                                         .get((coords.col + 1).mod(workers_x_column));
            cur_params.boundaries.BR = configuration.get((coords.row + 1).mod(workers_x_row))
                                         .get((coords.col + 1).mod(workers_x_column));                            
        }
        else if (coords.col === workers_x_column - 1)
        {
            cur_params.boundaries.TL = configuration.get((coords.row - 1).mod(workers_x_row))
                                         .get((coords.col - 1).mod(workers_x_column));
            cur_params.boundaries.BL = configuration.get((coords.row + 1).mod(workers_x_row))
                                         .get((coords.col - 1).mod(workers_x_column));                            
        }
        else
        {
            cur_params.boundaries.TL = configuration.get((coords.row - 1).mod(workers_x_row))
                                         .get((coords.col - 1).mod(workers_x_column));
            cur_params.boundaries.TR = configuration.get((coords.row - 1).mod(workers_x_row))
                                         .get((coords.col + 1).mod(workers_x_column));
            cur_params.boundaries.BL = configuration.get((coords.row + 1).mod(workers_x_row))
                                         .get((coords.col - 1).mod(workers_x_column));
            cur_params.boundaries.BR = configuration.get((coords.row + 1).mod(workers_x_row))
                                         .get((coords.col + 1).mod(workers_x_column));
        }

        if (workers_params.hasOwnProperty(cur_worker.toString()))
        {
            cur_params.start_points = workers_params[cur_worker.toString()];
        }

        initial_params.push(cur_params);
    }

    if (cluster.isMaster)
    {   
        if (LOG)
            console.log("<===== I am master =====>");

        let package_conf = {
            'rows': rows*workers_x_row,
            'cols': columns*workers_x_column,
            'steps': MAX_TIME,
            'workers_x_row': workers_x_row,
            'workers_x_column': workers_x_column
        }

        let loading = ["\\", "|", "/", "–"];

        try {
            fs.lstatSync(`out`).isDirectory();
        } catch(e) {
        if ( e.code == 'ENOENT')
            fs.mkdirSync(`out`);
        }
        fs.writeFileSync(`out/conf.json`, JSON.stringify(package_conf, null, 4));

        console.log(`<===== Startin simulation =====>
-> matrix: ${rows}×${columns}
-> workers: ${NUM_WORKERS}
-> steps: ${MAX_TIME}`);

        let cur_time = 0;
        let work_start = new Array(NUM_WORKERS).fill(false);
        let work_go = new Array(NUM_WORKERS).fill(true);
        let work_rollback = new Array(NUM_WORKERS).fill(true);
        let work_done = new Array(NUM_WORKERS).fill(false);
        let message_queue = [];

        // Create workers
        for(var i = 0; i != NUM_WORKERS; ++i)
        {
            cluster.fork();
        }

        // Assign on message function and
        // send initial state to workers
        for(let id in cluster.workers)
        {   
            // Send initial params
            cluster.workers[id].send(
                {
                    start_params: initial_params[parseInt(id) - 1]
                }
            );
            // Set on message function
            cluster.workers[parseInt(id)].on('message', (msg) =>
                {
                    if (LOG)
                        console.log(`MASTER received => ${JSON.stringify(msg)}`);
                    message_queue.unshift(msg);
                }
            );
        }

        let all_done = (prev, cur) =>
        {
            return prev && cur;
        };

        let all_false = (prev, cur) =>
        {
            return prev || cur;
        };

        let main_loop = () =>
        {   
            // Show loading
            if(!LOG)
            {   
                process.stdout.write(`--> Simulating time: ${cur_time}/${MAX_TIME} ${loading[Date.now() % 4]}\r`);
            }
            // ----- Handle message -----
            if (message_queue.length > 0)
            {
                let cur_msg = message_queue.pop();
                if (cur_msg.hasOwnProperty('ack_start'))
                {
                    work_start[cur_msg.worker_id - 1] = cur_msg.ack_start;
                }
                else if (cur_msg.hasOwnProperty('ack_go'))
                {
                    work_go[cur_msg.worker_id - 1] = cur_msg.ack_go;
                }
                else if (cur_msg.hasOwnProperty('ack_rollback'))
                {
                    work_rollback[cur_msg.worker_id - 1] = cur_msg.ack_rollback;
                }
                else if (cur_msg.hasOwnProperty('ack_done'))
                {
                    work_done[cur_msg.worker_id - 1] = cur_msg.ack_done;
                }
                else
                {
                    for(let id in cluster.workers)
                    {
                        if (cur_msg.receiver === parseInt(id))
                        {   
                            work_rollback[parseInt(id) - 1] = false;
                            cluster.workers[parseInt(id)].send(
                                {
                                   data: cur_msg 
                                }
                            );
                        }
                    }
                }
            }
            // ----- Main procedure -----
            else
            {   
                if (
                    work_start.reduce(all_done, true) === true &&
                    work_go.reduce(all_done, true) === true &&
                    work_rollback.reduce(all_done, true) === true
                   )
                {
                    if (cur_time <= MAX_TIME)
                    {
                        for(let id in cluster.workers)
                        {   
                            work_go[parseInt(id) - 1] = false;
                            // Send initial params
                            cluster.workers[parseInt(id)].send(
                                {
                                    time: cur_time
                                }
                            );
                        }
                        cur_time++;
                    }
                    else
                    {   
                        if (work_done.reduce(all_false, false) === false)
                        {
                            for(let id in cluster.workers)
                            {   
                                // Send initial params
                                cluster.workers[id].send(
                                    {
                                        to_the_end: true
                                    }
                                );
                            }
                        }
                        else if (work_done.reduce(all_done, true) === true)
                        {
                            clearInterval(main_loop_ref);
                            console.log("<===== !!!!! All jobs done !!!!! =====>");
                            for (let id in cluster.workers) {
                                cluster.workers[id].kill();
                                console.log(`-> Worker ${id} killed...`);
                            }                           
                            console.log("<===== !!!!! Exit done !!!!! =====>");
                            process.exit(0);
                        }
                        
                    }
                }
            }
            
        } ;  

        let main_loop_ref = setInterval(main_loop, TIME_INTERVAL);    

        process.on('SIGINT', () => {
            console.log("\n<===== Caught interrupt signal =====>");

            for (let id in cluster.workers) {
                cluster.workers[id].kill();
                console.log(`-> Worker ${id} killed...`);
            }
                        
            console.log("<===== Exit done =====>");
            process.exit(0);
        });
    }
    else if (cluster.isWorker)
    {   
        if (LOG)
            console.log(`<===== I am worker num ${cluster.worker.id} =====>`);

        let message_queue = [];
        let grid = null;
        let cur_time = 0;

        let main_loop = () =>
        {   
            if (message_queue.length > 0)
            {   
                let cur_msg = message_queue.pop();
                // ----- Handle message -----
                if (cur_msg.hasOwnProperty('start_params'))
                {
                    grid = new gofl.Grid(
                        cur_msg.start_params.rows,
                        cur_msg.start_params.columns,
                        cluster.worker.id,
                        cur_msg.start_params.boundaries
                    );
                    if (cur_msg.start_params.hasOwnProperty('start_points'))
                    {
                        for (let point of cur_msg.start_params.start_points)
                        {
                            grid.setPoint(point.row, point.col, point.val);
                        }
                    }
                    grid.go(cur_time);
                    grid.sendMessages(grid.scanEdges());
                    if (LOG)
                        console.log(grid.toString());
                    grid.gridToFile();
                    process.send(
                        {
                            ack_start: true,
                            worker_id: cluster.worker.id
                        }
                    );
                }
                // ----- Rollback -----
                else if (cur_msg.hasOwnProperty('data'))
                {   
                    if (LOG)
                        console.log(`------------------------------ !!!!!!!!!! ROLLBACK TO -> (${cur_msg.data.time}) !!!!!!!!!! ------------------------------`);
                    cur_time = grid.processMessage(cur_msg.data);
                    grid.go(cur_time);
                    grid.sendMessages(grid.scanEdges());
                    if (LOG)
                        console.log(grid.toString());
                    grid.gridToFile();
                    process.send(
                        {
                            ack_rollback: true,
                            worker_id: cluster.worker.id
                        }
                    );
                }
                // ----- Main procedure -----
                else if (cur_msg.hasOwnProperty('time'))
                {   
                    if (LOG)
                        console.log(`<======================================== Go -> (${cur_time}) ========================================>`);
                    cur_time = cur_msg.time;
                    grid.go(cur_time);
                    grid.sendMessages(grid.scanEdges());
                    if (LOG)
                        console.log(grid.toString());
                    grid.gridToFile();
                    process.send(
                        {
                            ack_go: true,
                            worker_id: cluster.worker.id
                        }
                    );
                }
                // ----- done and exit -----
                else if (cur_msg.hasOwnProperty('to_the_end'))
                {
                    process.send(
                        {
                            ack_done: cur_msg.to_the_end,
                            worker_id: cluster.worker.id
                        }
                    );
                }
            }
            
        };

        process.on('message',(msg) => 
            {   
                if (LOG)
                    console.log(`Worker ${cluster.worker.id} received => ${JSON.stringify(msg)}`);
                message_queue.unshift(msg);
            }
        );

        setInterval(main_loop, TIME_INTERVAL);
    }
})();