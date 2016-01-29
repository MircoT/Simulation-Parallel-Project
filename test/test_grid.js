var assert = require('assert');
var gofl = require('../gofl_parallel.js');

describe('Grid', function() {
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