/* global process */
'use strict';
const cluster = require('cluster');

Number.prototype.mod = function(base){ return ((this.valueOf() % base) + base) % base; }

class Message {
    constructor (sender, time, x, y, value) {
        this.sender = sender;
        this.data = {
            'time': time,
            'point': {
                'x': x,
                'y': y,
                'value': value
            }
        }
    }
}

class Grid {
    constructor(x, y, worker_id) {
        this.worker_id = worker_id;
        this.values = [];
        for (let i = 0; i != x + 2; ++i) {
            this.values[i] = new Array(y + 2).fill(0);
        }
        this.history = new Map([[0, []]]);
        this.boundary_history = new Map([[0, []]]);
        this.time = 0;
    }
    
    go(new_time) {
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
                for (let action of this.history.get(this.time)) {
                    this.setPoint(action.x, action.y, action.old);
                }
                this.history.delete(this.time);
                this.time--;
            }
        }
        // Set boundaries to 0
        for (let x=1; x != this.values.length - 1; ++x) {
            for (let y=1; y != this.values[x].length - 1; ++y) {
                if (x === 0 || y === 0 ||
                    x === this.values.length - 1 ||
                    y === this.values[x].length - 1)
                    this.values[x][y] = 0;
            }
        }
        // Check boundaries with history of current time
        for (let item of this.boundary_history.get(this.time)) {
            console.log(item);
            this.values[item.x][item.y] = item.value;
        }
        return this;
    }
    
    update() {
        if (!this.history.has(this.time + 1)) {
            this.history.set(this.time + 1, []);
        }
        // Calculate the configuration of the next time
        for (let x=1; x != this.values.length - 1; ++x) {
            for (let y=1; y != this.values[x].length - 1; ++y) {
                let tmp_next = this.getNext(x, y);
                this.history.get(this.time + 1).push({'x': x, 'y': y, 'new': tmp_next, 'old': this.values[x][y]});
            }
        }
        return this;
    }
    
    sendMessages() {
        let message_list = [];
        for (let x=1; x != this.values.length - 1; ++x) {
            for (let y=1; y != this.values[x].length - 1; ++y) {
                if (this.values[x][y] === 1 && (
                    x === 1 || y === 1 ||
                    x === this.values.length - 2 ||
                    y === this.values[x].length - 2
                   )) {
                    message_list.push(new Message(this.worker_id, this.time, x, y, 1));
                }
            }
        }
        message_list.forEach((message) => {
            process.send(message);
        });
        return this;
    }
    
    setBoundaryPoint(time, x, y, value) {
        if (!this.boundary_history.has(time)) {
            this.boundary_history.set(time, []);
        }
        this.boundary_history.get(time).push({'x': x, 'y': y, 'value': value});
    }
    
    /**
     * Transition function of Game of Life automata.
     */
    getNext(x, y) {
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
    
    /**
     * Set a point of the grid with a specific value.
     * This method returns the object for use chaining.
     */
    setPoint(x, y, value) {
        this.values[x][y] = value;
        return this;
    }
    
    /**
     * Convert to string the grid.
     * The result includes the boundaries and history.
     */
    toString() {
        let result = `====== time: ${this.time} ======\n`;
        for (let x=0; x != this.values.length; ++x) {
            let tmp = this.values[x].map((value) => { return (value === 0) ? '·' : 'X'; });
            tmp.splice(1, 0, '|');
            tmp.splice(-1, 0, '|')
            result += tmp.join(" ");
            if (x === 0 || x === this.values.length - 2) {
                result += '\n';
                result += '-'.repeat(tmp.join(" ").length);
            }
            result += '\n';
        }
        result += "====== history ======\n";
        this.history.forEach((value, key) => {
            result += `• ${key} => ${value.map((item) => { return JSON.stringify(item)})}\n`;
        });
        result += "====== boundary history ======\n";
        this.boundary_history.forEach((value, key) => {
            result += `• ${key} => ${value.map((item) => { return JSON.stringify(item)})}\n`;
        });
        result += '_'.repeat(28);
        return result;
    }
}

if (cluster.isMaster) {

  cluster.fork();
  
  for (let id in cluster.workers) {
    cluster.workers[id].on('message', (msg) => {
        console.log('MASTER received', msg);
        let new_point = {
            'time': msg.data.time,
            'value': msg.data.value,
            'x': (msg.data.point.x + 4).mod(7),
            'y': (-msg.data.point.y + 4).mod(8)
        }
         cluster.workers[msg.sender].send(new_point);
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
    //console.log(`I am worker #${cluster.worker.id}`);
    
    var grid = new Grid(5, 6, cluster.worker.id);
    grid.setPoint(1, 2, 1)
        .setPoint(3, 1, 1)
        .setPoint(3, 2, 1)
        .setPoint(3, 3, 1)
        .setPoint(2, 3, 1);
    console.log(grid.toString());
    grid.sendMessages().update().go(1);
    console.log(grid.toString());
    
    process.on('message', (msg) => {
        console.log(`I am worker #${cluster.worker.id} and I have received ${JSON.stringify(msg)}`);
        grid.setBoundaryPoint(msg.time, msg.x, msg.y, msg.value);
        grid.go(msg.time).update();
        console.log(grid.toString());
    });
}