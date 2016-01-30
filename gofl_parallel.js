(function ()
{
    'use strict';
    
    Number.prototype.mod = function(base){ return ((this.valueOf() % base) + base) % base; };

    class Point {
        constructor (x, y, value) {
            this.x = x;
            this.y = y;
            this.value = value;
        }
    }
    
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
            this.boundaries = boundaries || {};
            this.history = new Map([[0, []]]);
            this.boundary_history = new Map([[0, []]]);
            this.message_sent = new Map();
            this.time = 0;
            this.worker_id = worker_id || -1;
        }

        /**
         * Send all given messages
         */
        sendMessages(messages)
        {
            
        }
        
        /**
         * Check the edges and prepare messages for the neighbors
         */
        scanEdges()
        {   
            let messages = new Map();
            
            let row_len = this.values.length;
            let col_len = this.values[1].length;
            
            // CORNERS
            if (this.boundaries.hasOwnProperty('TL') && this.values[1][1] === 1)
            {
                if (!messages.has(this.boundaries.TL)) {
                    messages.set(this.boundaries.TL, []);
                }
                messages.get(this.boundaries.TL).push(
                    new Point(row_len - 1, col_len - 1, 1));
            }
            if (this.boundaries.hasOwnProperty('TR') && this.values[1][col_len - 2] === 1)
            {
                if (!messages.has(this.boundaries.TR)) {
                    messages.set(this.boundaries.TR, []);
                }
                messages.get(this.boundaries.TR).push(
                    new Point(row_len - 1, 0, 1));
            }
            if (this.boundaries.hasOwnProperty('BL') && this.values[row_len - 2][1] === 1)
            {
                if (!messages.has(this.boundaries.BL)) {
                    messages.set(this.boundaries.BL, []);
                }
                messages.get(this.boundaries.BL).push(
                    new Point(0, col_len - 1, 1));
            }
            if (this.boundaries.hasOwnProperty('BR') && this.values[row_len - 2][col_len - 2] === 1)
            {
                if (!messages.has(this.boundaries.BR)) {
                    messages.set(this.boundaries.BR, []);
                }
                messages.get(this.boundaries.BR).push(
                    new Point(0, 0, 1));
            }
            
            // TOP & BOTTOM
            for (let y = 1; y != col_len - 1; ++y)
            {
                if (this.values[1][y] === 1)
                {   
                    if (!messages.has(this.boundaries.T)) {
                        messages.set(this.boundaries.T, []);
                    }
                    messages.get(this.boundaries.T).push(
                        new Point(row_len - 1, y, 1));
                }
                else if (this.values[row_len - 2][y] === 1)
                {
                    if (!messages.has(this.boundaries.B)) {
                        messages.set(this.boundaries.B, []);
                    }
                    messages.get(this.boundaries.B).push(
                        new Point(0, y, 1));
                }
            }
            
            // LEFT & RIGHT
            for (let x = 1; x != row_len - 1; ++x)
            {
                if (this.values[x][1] === 1)
                {
                    if (!messages.has(this.boundaries.L)) {
                        messages.set(this.boundaries.L, []);
                    }
                    messages.get(this.boundaries.L).push(
                        new Point(x, col_len - 1, 1));
                }
                else if (this.values[x][col_len - 2] === 1)
                {
                    if (!messages.has(this.boundaries.R)) {
                        messages.set(this.boundaries.R, []);
                    }
                    messages.get(this.boundaries.R).push(
                        new Point(x, 0, 1));
                }
            }
            
            return messages;
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
