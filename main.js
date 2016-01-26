'use strict';
const cluster = require('cluster');
const http = require('http');

class Message {
    constructor (sender, time, point) {
        this.sender = sender;
        this.data = {
            'time': time,
            'point': point
        }
    }
}

class Grid {
    constructor(x, y) {
        this.values = [];
        for (let i = 0; i != y + 2; ++i) {
            this.values[i] = new Array(x + 2).fill(0);
        }
        this.history = new Map();
        this.time = 0;
    }
    
    createMessages(processId) {
        let message_list = [];
        for (let x=1; x != this.values.length - 1; ++x) {
            for (let y=1; y != this.values[x].length - 1; ++y) {
                if (this.values[x][y] === 1) {
                    if (x === 1 || y === 1 || x === this.values.length - 2 || y === this.values[x].length - 2)
                        message_list.push(new Message(processId, this.time, {'x': x, 'y': y, 'value': 1}));
                }
            }
        }
        return message_list;
    }
    
    update() {
        if (!this.history.has(this.time + 1)) {
            this.history.set(this.time + 1, []);
        }
        for (let x=1; x != this.values.length - 1; ++x) {
            for (let y=1; y != this.values[x].length - 1; ++y) {
                let tmp_next = this.next(x, y);
                if (this.values[x][y] !== tmp_next) {
                    let inserted = false;
                    for (let item of this.history.get(this.time + 1)) {
                        if (item.old === undefined && item.x === x && item.y === y) {
                            inserted = true;
                            item.old = this.values[x][y];
                        }
                    }
                    if (!inserted)
                        this.history.get(this.time + 1).push({'x': x, 'y': y, 'new': tmp_next, 'old': this.values[x][y]});
                }
            }
        }
        for (let item of this.history.get(this.time + 1)) {
            if (item.old === undefined) {
                item.old = this.values[item.x][item.y];
            }
        }
        //console.log(this.history)
        this.timeWarp(this.time + 1);
    }
    
    backToTheFuture(new_time, point) {
        if (this.time <= new_time) {
            if (!this.history.has(new_time)) {
                this.history.set(new_time, []);
            }
            let inserted = false;
            for (let item of this.history.get(new_time)) {
                if (item.x === point.x && item.y === point.y) {
                    inserted = true;
                    item.new = point.value;
                }
            }
            if (!inserted)
                this.history.get(new_time).push({'x': point.x, 'y': point.y, 'new': point.value, 'old': undefined})
            console.log("HERe", new_time, this.history.get(new_time))
        }
        else {
            this.timeWarp(new_time);
            for (let item of this.history.get(new_time)) {
                if (item.x === point.x && item.y === point.y) {
                    inserted = true;
                    item.new = point.value;
                }
            }
        }
    }
    
    timeWarp(new_time) {
        if (this.time < new_time) {
            while (this.time < new_time) {
                for (let action of this.history.get(this.time + 1)) {
                    this.setPoint(action.x, action.y, action.new);
                }
                this.time++;
            }
        }
        else if (this.time > new_time) {
            while (this.time > new_time) {
                for (let action of this.history[this.time]) {
                    this.setPoint(action.x, action.y, action.old);
                }
                this.history.delete(this.time);
                this.time--;
            }
        }
    }
    
    next(x, y) {
        var count = 0;
        if (this.values[x-1][y] === 1) count++;
        if (this.values[x-1][y+1] === 1) count++;
        if (this.values[x-1][y-1] === 1) count++;
        if (this.values[x+1][y] === 1) count++;
        if (this.values[x+1][y+1] === 1) count++;
        if (this.values[x+1][y-1] === 1) count++;
        if (this.values[x][y+1] === 1) count++;
        if (this.values[x][y-1] === 1) count++;

        if (this.values[x][y] === 1) {
            if (count < 2 || count > 3) return 0;
            else return 1;
        }
        else if (this.values[x][y] === 0 && count === 3) {
            return 1;
        }
        else {
            return 0;
        }
    }
    
    setPoint(x, y, value) {
        this.values[x][y] = value;
        return this;
    }
    
    /**
     * Convert to string the grid.
     * The result includes the boundaries.
     */
    toString() {
        let result = `====== time: ${this.time} ======\n`;
        for (let x=0; x != this.values.length; ++x) {
            let tmp = this.values[x].map((value) => { return (value === 0) ? '· ' : 'X '; });
            tmp.splice(1, 0, '|');
            tmp.splice(-1, 0, '|')
            result += tmp.join(" ");
            if (x === 0 || x === this.values.length - 2) {
                result += '\n';
                result += '-'.repeat(tmp.join(" ").length);
            }
            result += '\n';
        }
        return result;
    }
}

const MAX_TIME = 6;

if (cluster.isMaster) {

  for (let i = 0; i < 2; i++) {
    cluster.fork();
  }
  
  for (let id in cluster.workers) {
    cluster.workers[id].on('message', (msg) => {
        console.log('received', msg)
    });  
  }
  
  process.on('SIGINT', () => {
    console.log("Caught interrupt signal!");

    for (let id in cluster.workers) {
        cluster.workers[id].kill();
    }
    
    process.exit(0);
  });

  
} else if (cluster.isWorker) {
    console.log(`I am worker #${cluster.worker.id}`);
    
    var grid = new Grid(8, 6);
    grid.setPoint(1, 2, 1)
        .setPoint(3, 1, 1)
        .setPoint(3, 2, 1)
        .setPoint(3, 3, 1)
        .setPoint(2, 3, 1)
        /*.setPoint(1, 5, 1)
        .setPoint(6, 5, 1)
        .setPoint(6, 1, 1)*/;
    console.log(grid.toString());
    
    function main_loop() {
        if (grid.time < MAX_TIME) {
            grid.update();
            for (let message of grid.createMessages()) {
                console.log(message);
                process.send(message);
            }
            console.log(grid.toString());
        }
        else {
            clearInterval(main_loop_reference);
            /*grid.timeWarp(0);
            console.log(grid.toString());*/
        }
    }
    
    var main_loop_reference = setInterval(main_loop, 25);
    
    process.on('message', (msg) => {
        console.log(`I am worker #${cluster.worker.id} and I have received ${JSON.stringify(msg)}`);
        clearInterval(main_loop_reference);
        grid.backToTheFuture(msg.time, msg.point);
        console.log("HERE\n", grid.toString());
        main_loop_reference = setInterval(main_loop, 0);
    });
}