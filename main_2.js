'use strict';
const cluster = require('cluster');

class Message 
{
    constructor (sender, time, point)
     {
        this.sender = sender;
        this.data = 
        {
            'time': time,
            'point': point
        }
    }
}

class Point
{
    constructor(x,y)
    {
        this.x = x || 0;
        this.y = y || 0;
    }
    
    sum(point)
    {
       return  new Point(this.x+point.x,this.y+point.y);
    }
    
    sub(point)
    {
       return  new Point(this.x-point.x,this.y-point.y);
    }
}

class Grid
{
    constructor( info )
    {
        this.pos = info.pos;
        this.size = info.size;
        
        this.values = [];
        for (let i = 0; i != this.size.y + 2 ; ++i)
        {
            this.values[i] = new Array(this.size.x + 2).fill(0);
        }
    }
    
    get(index) 
    {
        var relative = index.min(this.pos).sum(new Point(1,1));
        return this.value[relative.x][relative.y];  
    }
    
    set(index, val) 
    {
        var relative = index.min(this.pos).sum(new Point(1,1));
        this.value[relative.x][relative.y] = val;  
    }
    
}


function main() 
{
    if(cluster.isMaster)
    {
        for(var i = 0; i < 4; ++i)
        {
            cluster.fork();
        }
        
        var info =
        [
            {
                pos  : new Point(0,0),
                size : new Point(4,4)
            },
            {
                pos  : new Point(0,4),
                size : new Point(4,4)
            },
            {
                pos  : new Point(4,0),
                size : new Point(4,4)
            },
            {
                pos  : new Point(4,4),
                size : new Point(4,4)
            },
        ]
        
        for(let id in cluster.workers)
        {
            cluster.workers[id].on('message',
            function (msg) 
            {
                console.log("master: +"+msg);
            });
            //send info
            cluster.workers[id].send(
            {
                type   : 'start',
                value  : info[id-1]
            });
        }
        console.log("I am master");
    }
    else if(cluster.isWorker)
    {
        console.log("I am worker:"+cluster.worker.id);
        //attribute
        var info = 
        {
              pos  : new Point(),
              size : new Point()
        }
        //global grid
        var grid = null;
        //
        process.on('message',function(msg)
        {
            switch (msg.type)
            {
                case 'start':
                    //start
                    info = msg.value;
                    console.log("start, "+info);
                    //alloc
                    grid = new Grid(info);
                break;
                default: break;
            }
        });
        
    }
}


//call main
main();