(function ()
{
    'use strict';
    
    class Grid
    {

        constructor(x, y, worker_id, boundaries)
        {
            /**
             * values =
             * 
             * [
             *  [0, 0, ..., 0],  |-> row with y + 2 elements
             *  [0, 0, ..., 0],      y = num columns
             *  [0, 0, ..., 0],
             *       ...
             *  [0, 0, ..., 0]
             * ]
             * |-> x = num rows
             * 
             */
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
            this.message_sent = new Map();
            this.time = 0;
            this.worker_id = worker_id || -1;
        }
        
        /**
         * Update the grid to the given time
         */
        go(new_time) {
            if (this.time < new_time)
            {
                while (this.time < new_time)
                {   
                    // Update grid and go to nex time
                    this.update();
                    this.time++;
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
                // Delete all history after current time
                for (let key of this.history.keys())
                {   
                    if (key > this.time)
                    {
                        this.history.delete(key);
                    }
                }
            }
            
            return this;
        }
        
        /**
         * Create the next history calling the transition
         * function on each element of the grid.
         */
        update()
        {   
            this.history.set(this.time + 1, []);
            for (let x=1; x != this.values.length - 1; ++x)
            {
                for (let y=1; y != this.values[x].length - 1; ++y)
                {
                    let tmp_next = this.getNext(x, y);
                    if (this.values[x][y] !== tmp_next)
                        this.history.get(this.time + 1).push({'x': x, 'y': y, 'new': tmp_next, 'old': this.values[x][y]});
                }
            }
            return this;
        }
        
        /**
         * Transition function of Game of Life automata.
         */
        getNext(x, y)
        {
            let count = 0;
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
         * Return only the grid with num of rows and columns
         */
        gridToString()
        {   
            let header = []
            let result = "";
            let length_str = -1;
            for (let y=0; y != this.values[0].length; ++y) 
            {
                header.push(y);
            }
            for (let x=0; x != this.values.length; ++x) {
                let tmp = this.values[x].map((value) => { return (value === 0) ? '·' : 'X'; });
                
                tmp.splice(1, 0, '|');
                tmp.splice(-1, 0, '|');
                tmp.splice(0, 0, `${x}\t|`);
                tmp.push('|')
                result += tmp.join(" ");
                if (x === 0 || x === this.values.length - 2) {
                    result += '\n';
                    result += '-'.repeat(tmp.join(' ').length + 8);
                    if (length_str === -1)
                        length_str = tmp.join(' ').length + 8
                }
                result += '\n';
            }
            header.splice(0, 0, '\t|');
            header.splice(2, 0, '|');
            header.splice(header.length, 0, '|');
            header.splice(-2, 0, '|');
            result = header.join(' ') + '\n' + '-'.repeat(length_str) + '\n' + result;
            return result;
        }
        
        /**
         * Set the value of the given row and column
         */
        setPoint(row, column, value)
        {
            this.values[row][column] = value;
            return this;
        }
    }
    
    exports.Grid = Grid;
})();
