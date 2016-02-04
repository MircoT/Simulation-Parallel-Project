# Simulation-Parallel-Project

The project have to simulate the "Game of life automata" in a grid where the workers comunicate by messages.

### Test module

```bash
npm install --dev
npm test
```

### Use the simulator

Read the help for more details:
```bash
node ./sim.js --help
```

An example of use:
```bash
node ./sim.js 6 6 3 3 64 initial_params.json
```

**NOTE**: *initial_params.json* is included in the repository as example.

### Use the viewer

To run the viewver you have to install [NW.js](http://nwjs.io/) for your platform, then you can simply run it like that:
```bash
cd app
/path/to/nw .
```

After that you can drag the *out* folder, with your result and see what happened.

**NOTE**: If you need more information about how using *NW.js* check the [documentation](http://docs.nwjs.io/en/v0.13.0-beta5/For%20Users/Getting%20Started/#getting-started-with-nwjs).