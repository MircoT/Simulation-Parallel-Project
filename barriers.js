(function()
{
    'use strict';
    class BarrierMngr 
    {
        constructor()
        {
            this.barriers = {};
            this.not = {
                'all_true': (barrier_name) => {
                    return !this.all_true(barrier_name);
                },
                'all_false': (barrier_name) => {
                    return !this.all_false(barrier_name);
                }
            };
        }

        add(barrier_name, len, initial_state)
        {
            this.barriers[barrier_name] = new Array(len).fill(initial_state);
        }

        set(barrier_name, index, value)
        {
            this.barriers[barrier_name][index] = value;
        }

        all_true(barrier_names)
        {   
            let result = true;
            for (let barrier_name of barrier_names)
            {
                result = result && this.barriers[barrier_name].reduce(
                    (prev, cur) =>
                        {
                            return prev && cur;
                        },
                    true
                );
            }
            return result;
        }

        all_false(barrier_names)
        {
            let result = false;
            for (let barrier_name of barrier_names)
            {   
                result = result || this.barriers[barrier_name].reduce(
                    (prev, cur) =>
                        {
                            return prev || cur;
                        },
                    false
                );
            }
            return result;
        }
    }

    exports.BarrierMngr = BarrierMngr;
})();