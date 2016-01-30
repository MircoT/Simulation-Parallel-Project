
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
var gofl = require('../gofl_parallel.js');

describe('Grid', function() {
    describe('Messages', function() {
        describe('Edges Scan', function () {
            it('Top Left (random)', function () {
                var boundaries = {
                    TL: Math.round(Math.random()* (10 - 0) + 0),
                    T: Math.round(Math.random()* (20 - 11) + 11),
                    L: Math.round(Math.random()* (30 - 21) + 21)
                };
                var num_rows = Math.round(Math.random() * (100 - 10) + 10);
                var num_cols = Math.round(Math.random() * (100 - 10) + 10);
                var grid = new gofl.Grid(num_rows, num_cols, 0, boundaries);
                
                grid.setPoint(1, 1, 1);
                var messages = grid.scanEdges();
                
                assert.lengthOf(messages, 3);
                
                assert.doesNotThrow(
                    function() {
                        for (var cur_msg of messages)
                        {
                            if (cur_msg.receiver !== boundaries.TL &&
                                cur_msg.receiver !== boundaries.T &&
                                cur_msg.receiver !== boundaries.L)
                                    throw new Error('Not in messages');
                        }
                    },
                    Error
                )

                for (var cur_msg of messages)
                {
                    if (cur_msg.receiver === boundaries.TL)
                    {
                        assert.strictEqual(cur_msg.point.x, num_rows + 1);
                        assert.strictEqual(cur_msg.point.y, num_cols + 1);
                    }      
                    else if (cur_msg.receiver === boundaries.T)
                    {
                        assert.strictEqual(cur_msg.point.x, num_rows + 1);
                        assert.strictEqual(cur_msg.point.y, 1);
                    }      
                    else if (cur_msg.receiver === boundaries.L)
                    {
                        assert.strictEqual(cur_msg.point.x, 1);
                        assert.strictEqual(cur_msg.point.y, num_cols + 1);
                    }      
                }   
            });
            it('Top Right (random)', function () {
                var boundaries = {
                    T: Math.round(Math.random()* (10 - 0) + 0),
                    TR: Math.round(Math.random()* (20 - 11) + 11),
                    R: Math.round(Math.random()* (30 - 21) + 21)
                };
                var num_rows = Math.round(Math.random() * (100 - 10) + 10);
                var num_cols = Math.round(Math.random() * (100 - 10) + 10);
                var grid = new gofl.Grid(num_rows, num_cols, 0, boundaries);

                grid.setPoint(1, num_cols, 1);
                var messages = grid.scanEdges();

                assert.lengthOf(messages, 3);
        
                assert.doesNotThrow(
                    function() {
                        for (var cur_msg of messages)
                        {
                            if (cur_msg.receiver !== boundaries.TR &&
                                cur_msg.receiver !== boundaries.T &&
                                cur_msg.receiver !== boundaries.R)
                                    throw new Error('Not in messages');
                        }
                    },
                    Error
                )

                for (var cur_msg of messages)
                {
                    if (cur_msg.receiver === boundaries.TR)
                    {
                        assert.strictEqual(cur_msg.point.x, num_rows + 1);
                        assert.strictEqual(cur_msg.point.y, 0);
                    }      
                    else if (cur_msg.receiver === boundaries.T)
                    {
                        assert.strictEqual(cur_msg.point.x, num_rows + 1);
                        assert.strictEqual(cur_msg.point.y, num_cols);
                    }      
                    else if (cur_msg.receiver === boundaries.R)
                    {
                        assert.strictEqual(cur_msg.point.x, 1);
                        assert.strictEqual(cur_msg.point.y, 0);
                    }      
                }   
            });
            it('Bottom Left (random)', function () { 
                var boundaries = {
                    L: Math.round(Math.random()* (10 - 0) + 0),
                    BL: Math.round(Math.random()* (20 - 11) + 11),
                    B: Math.round(Math.random()* (30 - 21) + 21)
                };
                var num_rows = Math.round(Math.random() * (100 - 10) + 10);
                var num_cols = Math.round(Math.random() * (100 - 10) + 10);
                var grid = new gofl.Grid(num_rows, num_cols, 0, boundaries);

                grid.setPoint(num_rows, 1, 1);
                var messages = grid.scanEdges();

                assert.lengthOf(messages, 3);
        
                assert.doesNotThrow(
                    function() {
                        for (var cur_msg of messages)
                        {
                            if (cur_msg.receiver !== boundaries.L &&
                                cur_msg.receiver !== boundaries.BL &&
                                cur_msg.receiver !== boundaries.B)
                                    throw new Error('Not in messages');
                        }
                    },
                    Error
                )

                for (var cur_msg of messages)
                {
                    if (cur_msg.receiver === boundaries.BL)
                    {
                        assert.strictEqual(cur_msg.point.x, 0);
                        assert.strictEqual(cur_msg.point.y, num_cols + 1);
                    }      
                    else if (cur_msg.receiver === boundaries.B)
                    {
                        assert.strictEqual(cur_msg.point.x, 0);
                        assert.strictEqual(cur_msg.point.y, 1);
                    }      
                    else if (cur_msg.receiver === boundaries.L)
                    {
                        assert.strictEqual(cur_msg.point.x, num_rows);
                        assert.strictEqual(cur_msg.point.y, num_cols + 1);
                    }      
                }   
            });
            it('Bottom Right (random)', function () {
                var boundaries = {
                    R: Math.round(Math.random()* (10 - 0) + 0),
                    B: Math.round(Math.random()* (20 - 11) + 11),
                    BR: Math.round(Math.random()* (30 - 21) + 21)
                };
                var num_rows = Math.round(Math.random() * (100 - 10) + 10);
                var num_cols = Math.round(Math.random() * (100 - 10) + 10);
                var grid = new gofl.Grid(num_rows, num_cols, 0, boundaries);

                grid.setPoint(num_rows, num_cols, 1);
                var messages = grid.scanEdges();

                assert.lengthOf(messages, 3);
        
                assert.doesNotThrow(
                    function() {
                        for (var cur_msg of messages)
                        {
                            if (cur_msg.receiver !== boundaries.R &&
                                cur_msg.receiver !== boundaries.BR &&
                                cur_msg.receiver !== boundaries.B)
                                    throw new Error('Not in messages');
                        }
                    },
                    Error
                )

                for (var cur_msg of messages)
                {
                    if (cur_msg.receiver === boundaries.BR)
                    {
                        assert.strictEqual(cur_msg.point.x, 0);
                        assert.strictEqual(cur_msg.point.y, 0);
                    }      
                    else if (cur_msg.receiver === boundaries.B)
                    {
                        assert.strictEqual(cur_msg.point.x, 0);
                        assert.strictEqual(cur_msg.point.y, num_cols);
                    }      
                    else if (cur_msg.receiver === boundaries.R)
                    {
                        assert.strictEqual(cur_msg.point.x, num_rows);
                        assert.strictEqual(cur_msg.point.y, 0);
                    }      
                }   
            });
            it('Top (random)', function () {
                var boundaries = {
                    T: Math.round(Math.random()* (10 - 1) + 1)
                };
                var num_rows = Math.round(Math.random() * (100 - 10) + 10);
                var num_cols = Math.round(Math.random() * (100 - 10) + 10);
                var grid = new gofl.Grid(num_rows, num_cols, 0, boundaries);

                var point = {
                    x: 1,
                    y: Math.round(Math.random()*((num_cols - 1) - 2) + 2)
                }
                grid.setPoint(point.x, point.y, 1);
                var messages = grid.scanEdges();
                
                assert.lengthOf(messages, 1);
                assert.strictEqual(messages[0].receiver, boundaries.T);
                assert.strictEqual(messages[0].point.x, num_rows + 1);
                assert.strictEqual(messages[0].point.y, point.y);
            });
            it('Bottom (random)', function () {
                var boundaries = {
                    B: Math.round(Math.random()* (10 - 1) + 1)
                };
                var num_rows = Math.round(Math.random() * (100 - 10) + 10);
                var num_cols = Math.round(Math.random() * (100 - 10) + 10);
                var grid = new gofl.Grid(num_rows, num_cols, 0, boundaries);
                
                var point = {
                    x: num_rows,
                    y: Math.round(Math.random()*((num_cols - 1) - 2) + 2)
                }
                grid.setPoint(point.x, point.y, 1);
                var messages = grid.scanEdges();

                assert.lengthOf(messages, 1);
                assert.strictEqual(messages[0].receiver, boundaries.B);
                assert.strictEqual(messages[0].point.x, 0);
                assert.strictEqual(messages[0].point.y, point.y);
            });
            it('Left (random)', function () { 
                var boundaries = {
                    L: Math.round(Math.random()* (10 - 1) + 1)
                };
                var num_rows = Math.round(Math.random()*100+10);
                var num_cols = Math.round(Math.random()*100+10);
                var grid = new gofl.Grid(num_rows, num_cols, 0, boundaries);
                
                var point = {
                    x: Math.round(Math.random()*((num_rows - 1) - 2) + 2),
                    y: 1
                }
                grid.setPoint(point.x, point.y, 1);
                var messages = grid.scanEdges();

                assert.lengthOf(messages, 1);
                assert.strictEqual(messages[0].receiver, boundaries.L);
                assert.strictEqual(messages[0].point.x, point.x);
                assert.strictEqual(messages[0].point.y, num_cols + 1);
            });
            it('Right (random)', function () {
                var boundaries = {
                    R: Math.round(Math.random()* (10 - 1) + 1)
                };
                var num_rows = Math.round(Math.random() * (100 - 10) + 10);
                var num_cols = Math.round(Math.random() * (100 - 10) + 10);
                var grid = new gofl.Grid(num_rows, num_cols, 0, boundaries);
                
                var point = {
                    x: Math.round(Math.random()*((num_rows - 1) - 2) + 2),
                    y: num_cols
                }
                grid.setPoint(point.x, point.y, 1);
                var messages = grid.scanEdges();

                assert.lengthOf(messages, 1);
                assert.strictEqual(messages[0].receiver, boundaries.R);
                assert.strictEqual(messages[0].point.x, point.x);
                assert.strictEqual(messages[0].point.y, 0);
            });
        });
    });
    describe('Go(back)', function() {
        describe('Spaceships', function () {
            it('Have to come back to initial position with rollback', function () {
                var grid = new gofl.Grid(6, 10);
                grid.setPoint(2, 7, 1)
                    .setPoint(2, 10, 1)
                    .setPoint(3, 6, 1)
                    .setPoint(4, 6, 1)
                    .setPoint(4, 10, 1)
                    .setPoint(5, 6, 1)
                    .setPoint(5, 7, 1)
                    .setPoint(5, 8, 1)
                    .setPoint(5, 9, 1);
                grid.go(8);
                grid.go(0);
                assert.deepEqual(grid.values, 
                  [ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
        });
        describe('Random matrix(10x10)', function () {
            it('Have to rollback to initial state after random steps', function () {
                var grid = new gofl.Grid(10, 10);
                var rnd_values = new Array(12);
                for (var x = 0; x !== rnd_values.length; ++x)
                {   
                    rnd_values[x] = new Array(12);
                    for (var y = 0; y !== rnd_values[x].length; ++y)
                    {   
                        if (y > 0 && x > 0 || y < rnd_values[x].length && x < rnd_values.length - 1)
                        {
                            var tmp = Math.round(Math.random()*1);
                            rnd_values[x][y] = tmp;
                            grid.setPoint(x, y, tmp);
                        }
                        else
                        {
                            rnd_values[x][y] = 0;
                        }
                    }
                }
                grid.go(Math.round(Math.random()*1000));
                grid.go(0);
                assert.deepEqual(grid.values, rnd_values);
            });
        });
    });
    describe('Update', function() {
        describe('Spaceships', function () {
            it('Glider have to slide by 1 in x and y after 4 step', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(1, 2, 1)
                    .setPoint(3, 1, 1)
                    .setPoint(3, 2, 1)
                    .setPoint(3, 3, 1)
                    .setPoint(2, 3, 1);
                grid.go(4);
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 1, 0, 0, 0 ],
                    [ 0, 0, 1, 1, 1, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
            it('Glider have to slide to bottom right', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(1, 2, 1)
                    .setPoint(3, 1, 1)
                    .setPoint(3, 2, 1)
                    .setPoint(3, 3, 1)
                    .setPoint(2, 3, 1);
                grid.go(8);
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 1, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 1, 0, 0 ],
                    [ 0, 0, 0, 1, 1, 1, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
            it('Lightweight spaceship (LWSS) go left by 4', function () {
                var grid = new gofl.Grid(6, 10);
                grid.setPoint(2, 7, 1)
                    .setPoint(2, 10, 1)
                    .setPoint(3, 6, 1)
                    .setPoint(4, 6, 1)
                    .setPoint(4, 10, 1)
                    .setPoint(5, 6, 1)
                    .setPoint(5, 7, 1)
                    .setPoint(5, 8, 1)
                    .setPoint(5, 9, 1);
                grid.go(8);
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
        });
        describe('Oscillator', function () {
            it('Blinker horizontal after 1 step', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(1, 3, 1)
                    .setPoint(2, 3, 1)
                    .setPoint(3, 3, 1);
                grid.go(1);
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 1, 1, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
                
            });
            it('Blinker Starting position (Vertical) after 2 step', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(1, 3, 1)
                    .setPoint(2, 3, 1)
                    .setPoint(3, 3, 1);
                grid.go(2);
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
            it('Toad return to initial state after 2 step', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(2, 2, 1)
                    .setPoint(2, 3, 1)
                    .setPoint(2, 4, 1)
                    .setPoint(3, 1, 1)
                    .setPoint(3, 2, 1)
                    .setPoint(3, 3, 1);
                grid.go(2);
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 1, 1, 0, 0, 0 ],
                    [ 0, 1, 1, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
        });
        describe('Still Lifes', function () {
            it('Block type after random steps step don\'t change', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(1, 2, 1)
                    .setPoint(1, 3, 1)
                    .setPoint(2, 2, 1)
                    .setPoint(2, 3, 1);
                grid.go(Math.round(Math.random() * 100));
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
                
            });
            it('Loaf type after random steps step don\'t change', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(1, 3, 1)
                    .setPoint(1, 4, 1)
                    .setPoint(2, 2, 1)
                    .setPoint(3, 3, 1)
                    .setPoint(4, 4, 1)
                    .setPoint(2, 5, 1)
                    .setPoint(3, 5, 1);
                grid.go(Math.round(Math.random() * 100));
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 1, 1, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0, 1, 0, 0 ],
                    [ 0, 0, 0, 1, 0, 1, 0, 0 ],
                    [ 0, 0, 0, 0, 1, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
            it('Beehive type after random steps step don\'t change', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(1, 3, 1)
                    .setPoint(1, 4, 1)
                    .setPoint(2, 2, 1)
                    .setPoint(3, 3, 1)
                    .setPoint(3, 4, 1)
                    .setPoint(2, 5, 1)
                grid.go(Math.round(Math.random() * 100));
                assert.deepEqual(grid.values, 
                [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 1, 1, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0, 1, 0, 0 ],
                    [ 0, 0, 0, 1, 1, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
            it('Boat type after random steps don\'t change', function () {
                var grid = new gofl.Grid(5, 6);
                grid.setPoint(1, 2, 1)
                    .setPoint(1, 3, 1)
                    .setPoint(2, 2, 1)
                    .setPoint(3, 3, 1)
                    .setPoint(2, 4, 1);
                grid.go(Math.round(Math.random() * 100));
                assert.deepEqual(grid.values,
                  [ [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 1, 0, 0, 0 ],
                    [ 0, 0, 0, 1, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ] ]);
            });
        });
    });
});