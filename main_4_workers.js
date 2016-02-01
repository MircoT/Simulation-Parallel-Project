(function() {
    'use strict';
    const gofl = require('./gofl_parallel.js');
    const cluster = require('cluster');

     // Max time of the simulation
    const MAX_TIME = parseInt(process.argv[2]) || 12;
    // Time interval of the main function of the workers
    const TIME_INTERVAL = 0;
    // Number of workers
    const NUM_WORKERS = 4;

    if (cluster.isMaster)
    {
        console.log("<===== I am master =====>");

        let cur_time = 0;
        let work_start = new Array(NUM_WORKERS).fill(false);
        let work_go = new Array(NUM_WORKERS).fill(true);
        let work_rollback = new Array(NUM_WORKERS).fill(true);
        let message_queue = [];

        // Create workers
        for(var i = 0; i != NUM_WORKERS; ++i)
        {
            cluster.fork();
        }

        let initial_params = [
            // Worker 1
            {   
                x: 6,
                y: 6,
                boundaries: {
                   TL: 4,
                    T: 3,
                    L: 2,
                    R: 2,
                    B: 3,
                    BR: 4
                }
            },
            // Worker 2
            {   
                x: 6,
                y: 6,
                boundaries: {
                    T: 4,
                    TR: 3,
                    L: 1,
                    R: 1,
                    BL: 3,
                    B: 4
                }
            },
            // Worker 3
            {   
                x: 6,
                y: 6,
                boundaries: {
                    T: 1,
                    TR: 2,
                    L: 4,
                    R: 4,
                    BL: 2,
                    B: 1
                }
            },
            // Worker 4
            {   
                x: 6,
                y: 6,
                boundaries: {
                    T: 2,
                    TL: 1,
                    L: 3,
                    R: 3,
                    BR: 1,
                    B: 2
                }
            }
        ];

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
                    console.log(`MASTER received => ${JSON.stringify(msg)}`);
                    message_queue.unshift(msg);
                }
            );
        }

        let all_done = (prev, cur) =>
        {
            return prev && cur;
        };

        let main_loop = () =>
        {   
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
                        clearInterval(main_loop_ref);
                        for (let id in cluster.workers) {
                            cluster.workers[id].kill();
                            console.log(`-> Worker ${id} killed...`);
                        }
                        
                        console.log("<===== Exit done =====>");
                        process.exit(0);
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
                        cur_msg.start_params.x,
                        cur_msg.start_params.y,
                        cluster.worker.id,
                        cur_msg.start_params.boundaries
                    );
                    // // Glider top left
                    // grid.setPoint(1, 2, 1)
                    //     .setPoint(3, 1, 1)
                    //     .setPoint(3, 2, 1)
                    //     .setPoint(3, 3, 1)
                    //     .setPoint(2, 3, 1);
                    // Glider bottom right
                    if (cluster.worker.id === 1)
                    {
                         grid.setPoint(4, 5, 1)
                            .setPoint(6, 4, 1)
                            .setPoint(6, 5, 1)
                            .setPoint(6, 6, 1)
                            .setPoint(5, 6, 1);
                    }
                    grid.go(cur_time);
                    grid.sendMessages(grid.scanEdges());
                    console.log(grid.toString());
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
                    console.log(`------------------------------ !!!!!!!!!! ROLLBACK TO -> (${cur_msg.data.time}) !!!!!!!!!! ------------------------------`);
                    cur_time = grid.processMessage(cur_msg.data);
                    grid.go(cur_time);
                    grid.sendMessages(grid.scanEdges());
                    if (cluster.worker.id === 4)
                    {
                        console.log(grid.toString());
                    }
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
                    console.log(`<======================================== Go -> (${cur_time}) ========================================>`);
                    cur_time = cur_msg.time;
                    grid.go(cur_time);
                    grid.sendMessages(grid.scanEdges());
                    if (cluster.worker.id === 4)
                    {
                        console.log(grid.toString());
                    }
                    process.send(
                        {
                            ack_go: true,
                            worker_id: cluster.worker.id
                        }
                    );
                }
            }
            
        };

        process.on('message',(msg) => 
            {   
                console.log(`Worker ${cluster.worker.id} received => ${JSON.stringify(msg)}`);
                message_queue.unshift(msg);
            }
        );

        setInterval(main_loop, TIME_INTERVAL);
    }
})();