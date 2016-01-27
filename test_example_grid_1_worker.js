(function()
{
    'use strict';
    const cluster = require('cluster');

    Number.prototype.mod = function(base){ return ((this.valueOf() % base) + base) % base; };

    class Message {
        constructor (receiver, time, x, y, value) {
            this.receiver = receiver;
            this.data = {
                'time': time,
                'point': {
                    'x': x,
                    'y': y,
                    'value': value
                }
            };
        }
    }

    class Grid
    {
        /**
         * x = num rows
         * y = num cols
         */
        constructor(x, y, boundaries)
        {
            this.values = [];
            for (let i = 0; i != x + 2; ++i) {
                this.values[i] = new Array(y + 2).fill(0);
            }
            /**
             * List of ID:
             * - [TL, T, TR, L, R, BL, B, BR]
             */
            this.boundaries = boundaries;
            this.history = new Map([[0, []]]);
            this.boundary_history = new Map([[0, []]]);
            this.message_sent = [];
            this.time = 0;
        }
        
        sendMessages()
        {   
            let sent = this.message_sent.indexOf(this.time) !== -1;
            
            if (!sent) {
                let message_list = [];
                // TOP LINE
                for (let y=1; y != this.values[1].length - 1; ++y)
                {
                    let cur_x = 1;
                    if (this.values[cur_x][y] === 1)
                    {   
                        let y_len = this.values[1].length;
                        let x_len = this.values.length;
                        if (y === 1)
                        {
                            message_list.push(new Message(this.boundaries.L, this.time, cur_x, (y - 2).mod(y_len), 1));
                            message_list.push(new Message(this.boundaries.TL, this.time, (-cur_x).mod(x_len), (y - 2).mod(y_len), 1));
                            message_list.push(new Message(this.boundaries.T, this.time, (-cur_x).mod(x_len), y, 1));
                        }
                        else if (y === y_len - 2) {
                            message_list.push(new Message(this.boundaries.R, this.time, cur_x, (y + 2).mod(y_len), 1));
                            message_list.push(new Message(this.boundaries.TR, this.time, (-cur_x).mod(x_len), (y + 2).mod(y_len), 1));
                            message_list.push(new Message(this.boundaries.T, this.time, (-cur_x).mod(x_len), y, 1));
                        }
                        else {
                            message_list.push(new Message(this.boundaries.T, this.time, (-cur_x).mod(x_len), y, 1));
                        }
                    }
                }
                // BOTTOM LINE
                for (let y=1; y != this.values[this.values.length - 2].length - 1; ++y)
                {   
                    let cur_x = this.values.length - 2;
                    if (this.values[cur_x][y] === 1)
                    {   
                        let y_len = this.values[this.values.length - 2].length;
                        if (y === 1)
                        {
                            message_list.push(new Message(this.boundaries.L, this.time, cur_x, (y - 2).mod(y_len), 1));
                            message_list.push(new Message(this.boundaries.BL, this.time, 0, (y - 2).mod(y_len), 1));
                            message_list.push(new Message(this.boundaries.B, this.time, 0, y, 1));
                        }
                        else if (y === y_len - 2) {
                            message_list.push(new Message(this.boundaries.R, this.time, cur_x, (y + 2).mod(y_len), 1));
                            message_list.push(new Message(this.boundaries.BR, this.time, 0, (y + 2).mod(y_len), 1));
                            message_list.push(new Message(this.boundaries.B, this.time, 0, y, 1));
                        }
                        else {
                            message_list.push(new Message(this.boundaries.B, this.time, 0, y, 1));
                        }
                    }
                }
                // LEFT & RIGHT
                for (let x=2; x != this.values.length - 2; ++x)
                {   
                    let y_len = this.values[x].length;
                    if (this.values[x][1] === 1)
                    {   
                    message_list.push(new Message(this.boundaries.L, this.time, x, (-1).mod(y_len), 1)); 
                    }
                    if (this.values[x][y_len - 2] === 1)
                    {   
                    message_list.push(new Message(this.boundaries.R, this.time, x, 0, 1)); 
                    }
                        
                }
                process.send(
                    {
                        messages: message_list
                    }
                );
                
                this.message_sent.push(this.time);
            }
            return this;
        }
        
        update()
        {   
            // Calculate the configuration of the next time
            this.time++;
            if (!this.history.has(this.time))
            {
                this.history.set(this.time, []);
            }
            for (let x=1; x != this.values.length - 1; ++x)
            {
                for (let y=1; y != this.values[x].length - 1; ++y)
                {
                    let tmp_next = this.getNext(x, y);
                    this.history.get(this.time).push({'x': x, 'y': y, 'new': tmp_next, 'old': this.values[x][y]});
                }
            }
            return this;
        }
        
        updateBoundaries()
        {
            // Set boundaries to 0
            for (let y=0; y != this.values[0].length; ++y)
            {
                this.values[0][y] = 0;
                this.values[this.values.length - 1][y] = 0;
            }
            for (let x=0; x != this.values.length - 1; ++x)
            {
                this.values[x][0] = 0;
                this.values[x][this.values[x].length - 1] = 0;
            }
            // Check boundaries with history of current time
            if (this.boundary_history.has(this.time))
            {
                for (let item of this.boundary_history.get(this.time))
                {
                    this.values[item.x][item.y] = item.value;
                }
            }
        }
        
        go(new_time) {
            if (this.time < new_time)
            {
                while (this.time < new_time)
                {   
                    // Send messages
                    this.sendMessages();
                    // Update boundaries
                    this.updateBoundaries();
                    // Update grid
                    this.update();
                    // Apply the update
                    for (let action of this.history.get(this.time)) {
                        this.setPoint(action.x, action.y, action.new);
                    }
                }
            }
            else if (this.time > new_time)
            {
                while (this.time > new_time)
                {
                    for (let action of this.history.get(this.time))
                    {
                        this.setPoint(action.x, action.y, action.old);
                    }
                    this.time--;
                }
                // Delete all history
                for (let key of this.history.keys())
                {   
                    if (key > this.time)
                    {
                        this.history.delete(key);
                        this.boundary_history.delete(key);
                        if (this.message_sent.indexOf(key) !== -1)
                            this.message_sent.splice(this.message_sent.indexOf(key), 1);
                    }
                }
                // Update boundaries
                this.updateBoundaries();
            }
            else {
                // Update boundaries
                this.updateBoundaries();
            }
            
            
            return this;
        }
        
        clearBoundaries(time)
        {
            this.boundary_history.set(time, []);
        }
        
        setBoundaryPoint(time, x, y, value)
        {
            let inserted = this.boundary_history.get(time).reduce((prev, cur) => 
            {
                if (cur.x === x && cur.y === y && cur.value === value) return prev || true;
                return prev || false;
            }, false);

            if (!inserted)
            {
                this.boundary_history.get(time).push({'x': x, 'y': y, 'value': value});    
            }
        }
        
        /**
         * Transition function of Game of Life automata.
         */
        getNext(x, y)
        {
            var count = 0;
            if (this.values[x-1][y] === 1) count++;
            if (this.values[x-1][y+1] === 1) count++;
            if (this.values[x-1][y-1] === 1) count++;
            if (this.values[x+1][y] === 1) count++;
            if (this.values[x+1][y+1] === 1) count++;
            if (this.values[x+1][y-1] === 1) count++;
            if (this.values[x][y+1] === 1) count++;
            if (this.values[x][y-1] === 1) count++;

            if (this.values[x][y] === 1)
            {
                if (count < 2 || count > 3) return 0;
                else return 1;
            }
            else if (this.values[x][y] === 0 && count === 3)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        }
        
        /**
         * Set a point of the grid with a specific value.
         * This method returns the object for use chaining.
         */
        setPoint(x, y, value)
        {
            this.values[x][y] = value;
            return this;
        }
        
        /**
         * Convert to string the grid.
         * The result includes the boundaries and history.
         * 
         * @return {String} The conversion of Grid object to string
         */
        toString()
        {
            let result = `====== time: ${this.time} ======\n`;
            for (let x=0; x != this.values.length; ++x) {
                let tmp = this.values[x].map((value) => { return (value === 0) ? '·' : 'X'; });
                tmp.splice(1, 0, '|');
                tmp.splice(-1, 0, '|');
                result += tmp.join(" ");
                if (x === 0 || x === this.values.length - 2) {
                    result += '\n';
                    result += '-'.repeat(tmp.join(" ").length);
                }
                result += '\n';
            }
            result += "====== history ======\n";
            this.history.forEach((value, key) => {
                result += `• ${key} => ${value.map((item) => { return JSON.stringify(item); })}\n`;
            });
            result += "====== boundary history ======\n";
            this.boundary_history.forEach((value, key) => {
                result += `• ${key} => ${value.map((item) => { return JSON.stringify(item); })}\n`;
            });
            result += "====== time messages sent ======\n";
            result += JSON.stringify(this.message_sent) + "\n";
            result += '_'.repeat(28);
            return result;
        }
    }


    // Max time of the simulation
    const MAX_TIME = 12;

    /* ========================= MASTER ========================= */
    if(cluster.isMaster)
    {   
        console.log("I am master");
        // Create workers
        for(var i = 0; i != 1; ++i)
        {
            cluster.fork();
        }
        
        let initial_params = [
            {   
                x: 6,
                y: 6,
                boundaries: {
                    TL: 1,
                    T: 1,
                    TR: 1,
                    L: 1,
                    R: 1,
                    BL: 1,
                    B: 1,
                    BR: 1
                }
            }
        ];

        // Filter for messages, select a specific receiver
        let message_filter = function(inner_id)
        {
            return (value) => { return value.receiver === parseInt(inner_id); };
        };

        // Message handler
        let message_handler = (msg) =>
        {
            console.log(`MASTER received => ${JSON.stringify(msg)}`);
            for(let inner_id in cluster.workers)
            {
               let tmp_messages = msg.messages.filter(message_filter(inner_id));
               if (tmp_messages.length > 0)
               {
                   cluster.workers[inner_id].send(
                    {
                        boundary_msg: tmp_messages
                    }  
                );
               }  
            }
        };
        
        // Assign on message function and
        // send initial state to workers
        for(let id in cluster.workers)
        {   
            // Set on message function
            cluster.workers[id].on('message', message_handler);

            // Send initial params
            cluster.workers[id].send(
            {
                start_params: initial_params[parseInt(id) - 1]
            }
            );
        }
                
        process.on('SIGINT', () => {
            console.log("\n===== Caught interrupt signal =====");

            for (let id in cluster.workers) {
                cluster.workers[id].kill();
                console.log(`-> Worker ${id} killed...`);
            }
            
            console.log("===== Exit done =====");
            process.exit(0);
        });
    }
    /* ========================= WORKER ========================= */
    else if(cluster.isWorker)
    {
        console.log(`I am worker num ${cluster.worker.id}`);
        
        let worker_grid = null;
        
        // Set on message function
        process.on('message',(msg) =>
            {
                console.log(`WORKER received => ${JSON.stringify(msg)}`);
                if (msg.hasOwnProperty('start_params'))
                {
                    worker_grid = new Grid(
                        msg.start_params.x,
                        msg.start_params.y,
                        msg.start_params.boundaries
                    );
                    // Base example
                    //worker_grid.setPoint(1, 6, 1);
                    /*worker_grid.setPoint(1, 2, 1)
                        .setPoint(3, 1, 1)
                        .setPoint(3, 2, 1)
                        .setPoint(3, 3, 1)
                        .setPoint(2, 3, 1);*/
                    worker_grid.setPoint(4, 5, 1)
                        .setPoint(6, 4, 1)
                        .setPoint(6, 5, 1)
                        .setPoint(6, 6, 1)
                        .setPoint(5, 6, 1);
                    console.log(worker_grid.toString());
                    worker_grid.go(MAX_TIME);
                }
                else if (msg.hasOwnProperty('boundary_msg'))
                {   
                    let msg_time = msg.boundary_msg[0].data.time;
                    worker_grid.clearBoundaries(msg_time);
                    for (let cur_msg of msg.boundary_msg)
                    {
                        let data = cur_msg.data;
                        worker_grid.setBoundaryPoint(
                            data.time,
                            data.point.x,
                            data.point.y,
                            data.point.value
                        );
                    }
                    worker_grid.go(msg_time);
                    //console.log(worker_grid.toString());
                    //worker_grid.go(1);
                    //console.log(worker_grid.toString());
                    worker_grid.go(MAX_TIME);
                    console.log(worker_grid.toString());
                }
            }
        );
    }
})();