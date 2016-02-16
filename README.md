# Simulation-Parallel-Project

The project have to simulate the "Game of life automata" in a grid where the workers comunicate by messages.

This project was tested with:

* [nodejs](https://nodejs.org/en/) v5.5.0
* [nw.js](http://nwjs.io/) v0.12.3 (needed by the viewver)

### Test module

```bash
npm install --dev
npm test
```

### Use the simulator

First install the dependencies:
```bash
npm install
```

Read the help for more details about the parameters:
```bash
node ./sim.js --help
```

An example of use:
```bash
node ./sim.js 6 6 3 3 64 initial_params.json -zip
```

**NOTE**: *initial_params.json* is included in the repository as example and it contains only the initial values for the worker *1*.

### Use the viewer

To run the viewver you have to install [nw.js](http://nwjs.io/) for your platform, then you have to installe the dependencies::
```bash
cd app
/path/to/nw .
```

After that you can run the viewer directly from the app folder:
```bash
/path/to/nw .
```

After that you can drag the *out* folder (or zip file), with your results and see what happened.

**NOTE**: If you need more information about how using *nw.js* check the [documentation](http://docs.nwjs.io/en/v0.13.0-beta5/For%20Users/Getting%20Started/#getting-started-with-nwjs).