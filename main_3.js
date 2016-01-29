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
    static fromJSon(json)
    {
        return new Point(json.x,json.y);
    }
    
    constructor(x,y)
    {
        this.x = x || 0;
        this.y = y || 0;
    }
    
    add(point)
    {
       return  new Point(this.x+point.x,this.y+point.y);
    }
    
    sub(point)
    {
       return  new Point(this.x-point.x,this.y-point.y);
    }
    
    abs()
    {
        return new Point( Math.abs(this.x),  Math.abs(this.y) );
    }
    
    positive()
    {
        return new Point( this.x < 0 ? this.x : 0,  
                          this.y < 0 ? this.y : 0 );
    }
}

class Grid
{
    static fromJSon(json)
    {
        //copy meta data
        var grid = new Grid({
            pos : Point.fromJSon(json.pos),
            size: Point.fromJSon(json.size),
            values: json.values
        });
        //return
        return grid;
    }
    
    constructor( info )
    {
        this.pos = info.pos;
        this.size = info.size;
        
        this.pos.__proto__ = Point.prototype;
        this.size.__proto__ = Point.prototype;
        
        if("values" in info)
        {
            this.values = info.values;
        }
        else
        {
            this.values = new Array(this.size.y + 2).fill(0);
            for (let i = 0; i != this.size.y + 2 ; ++i)
            {
                this.values[i] = new Array(this.size.x + 2).fill(0);
            }
        }
    }
    
    get(index) 
    {
        if(!this.isInside(index)) return 0;
        var relative = index.sub(this.pos).add(new Point(1,1));
        return this.values[relative.x][relative.y];  
    }
    
    set(index, val) 
    {
        if(!this.isInside(index)) return;
        var relative = index.sub(this.pos).add(new Point(1,1));
        this.values[relative.x][relative.y] = val;  
    }
    
    endPoint()
    {
        return this.pos.add(this.size).add(new Point(-1,-1));
    }
    
    haveEndBorder()
    {
        return this.pos.add(this.size)
    }
    
    global(index)
    {
        return index.add(this.pos);
    }
    
    isInside(index)
    {
        var relative = index.sub(this.pos).add(new Point(1,1));
        return relative.x >= 0 &&
               relative.y >= 0 &&
               relative.x < this.values.length && 
               relative.y < this.values[0].length;
    }
    
    isDifferent(grid,point)
    {
        return this.isInside(point) &&
               grid.isInside(point) && 
               this.get(point) != grid.get(point);
    }
    
    getDifferent(grid)
    {
        var points = [];
        var top    = this.pos.add(new Point(-1,-1));
        var bottom = this.endPoint();
        
        for(var x = top.x; x < bottom.x; ++x)
        {
            //diff top line
            var pointTop = new Point(x,top.y);
            if(this.isDifferent(grid,pointTop))
            {
                points.push
                ({
                    pos : pointTop,
                    value : this.get(pointTop)
                });
            }
            //diff bottom line
            var pointBottom = new Point(x,bottom.y);
            if(this.isDifferent(grid,pointBottom))
            {
                points.push
                ({
                    pos : pointBottom,
                    value : this.get(pointBottom)
                });
            }
        }
        
        for(var y = top.y; y < bottom.y; ++y)
        {
            //diff left colunm
            var pointLeft = new Point(top.x,y);
            if(this.isDifferent(grid,pointLeft))
            {
                points.push
                ({
                    pos : pointLeft,
                    value : this.get(pointLeft)
                });
            }
            //diff right colunm
            var pointRight = new Point(bottom.x,y);
            if(this.isDifferent(grid,pointRight))
            {
                points.push
                ({
                    pos : pointRight,
                    value : this.get(pointRight)
                });
            }
        }
       return points;
    }
    
    toString()
    {
        var output = "";
        var xSize= this.values.length;
        var ySize= this.values[0].length;
         
        for (var x = 0; x < ySize; ++x)
        {
            for (var y = 0; y < xSize; ++y)
            {
                output += this.values[y][x]+" ";
            }
            output+="\n";
        }
        return output;
    }
    
    print()
    {
        console.log(this.toString())
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
        //test grid
        var leftGrid = new Grid(info[0]);
        var rightGrid = new Grid(info[2]);
        //print tables
        leftGrid.print();
        //add diff
        rightGrid.set(new Point(3,0),1);
        //print
        rightGrid.print();
        //diff
        console.log(rightGrid.getDifferent(leftGrid));
        
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
            //send diff
            cluster.workers[id].send(
            {
                type   : 'grid',
                value  : testGrid
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
        var this_grid = null;
        //...
        process.on('message',function(msg)
        {
            switch (msg.type)
            {
                case 'start':
                    //start
                    info = msg.value;
                    console.log("start, "+info);
                    //alloc
                    this_grid = new Grid(info);
                break;
                case 'grid':
                    //get new grid
                    var newGrid = Grid.fromJSon(msg.value);
                    //diff
                    console.log("I'm ["+String(cluster.worker.id)+"] and diff:\n");
                    console.log(this_grid.getDifferent(newGrid));
                break;
                default: break;
            }
        });
        
    }
}


//call main
main();