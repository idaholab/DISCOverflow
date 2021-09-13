# DISCOverflow

Copyright 2021, Battelle Energy Alliance, LLC

This project contains two subprojects which run independently and allow for the visualization of data produced from the binary disassembly tool @DisCo:

- 2DViewer: 2D visualization that provides a traditional control-flow graph seen in other disassemblers.
- 3DViewer: 3D visualization of control-flow graphs.

These viewers use the same database schema/type as inputs, which is OrientDB database holding dissassembled code from @DisCo. The viewers should work on any Operating System, this has been thorougly tested on Ubuntu 18.04 and MacOS Catalina.

## OrientDB

Download and install OrientDB. Version 3.0.x works, newer versions have not been tested.

```bash
wget https://s3.us-east-2.amazonaws.com/orientdb3/releases/3.0.32/orientdb-3.0.32.tar.gz -O orientdb-community-3.0.32.tar.gz
```

You can set up OrientDB to run as a service, or you can manually start the service from your orient install directory.

```bash
cd /path/to/orientdb/bin/
sudo ./server.sh
```

Next head over to the @DisCo repository, follow the readme to install the program and run it against a binary.

## 2D Dissasembly Visualization

### Installation

#### Manual

Prerequisites:

- [yarn](https://yarnpkg.com/)
- [Java](https://jdk.java.net)
- Orientdb Database with @DisCo disassembled code

```bash
cd ./client
yarn install
yarn run build

cd ../server
./gradlew jettyRun
```

#### Docker

``` bash
docker build -t 2DView -f Dockerfile .
docker run -it --name 2DView 2DView
```

#### Usage

Open a browser to `http://localhost:8080/`
Authenticate with the webpage by entering username/password in the dropdown Auth button. Choose a database, library and function to begin exploring the control-flow graph.

## 3D Dissassembly Visualization

### Installation

There are two separate views included in 3D Disassembly Visualization, large_graph and small_graph.

#### Preparing data

getData.js - This script sends HTTP requests to an OrientDB database and saves files into two folders:

- A JSON file is saved into the smallgraph_data directory that can be used with the small_graph visualization.
- A directory tree is created inside largegraph_data directory which is what large_graph uses to display. See below section largegraph_data for more information.

- Currently, the username and password are hard coded in the query function within getData.js, modify this line to whatever your orientdb credentials are.
To run getData.js we must install dependencies from the root folder of this folder:

```bash
cd 3DViewer
npm install
node getData.js <database_name>
```

#### large_graph

Prerequisites:

- Firefox: download CORS Everywhere (or some other CORS extension into either firefox/chrome). One could also use a Chromium browser itself.

Allow data in largegraph_data to be accessible for large_graph:

```bash
cd ./largegraph_data
npm i http-server -g
http-server -p 1338
```

In the another terminal run:

```bash
cd ./large_graph
npm install
npm start
```

Open a browser to:

http://localhost:8081/#/galaxy/<library_name>

#### small_graph

Smaller graph viewer package that allows us to select from a drop down list, a graph exported from OrientDB as a JSON object of specific schema. This is a force directed graph that shows names of nodes when hovering over them, automatically colors nodes based on node_type and other useful things you might want to see when viewing a binary as a 3d blob.

Simply open the small_graph_3d.html page inside small_graph folder, and then target a JSON file that is stored in the smallgraph_data folder.

### Folders

#### libs

Holds ngraph related modules forked and customized to work with our @DisCo OrientDB database.

#### smallgraph_data

Holds properly formatted JSON that small_graph uses.

#### largegraph_data

All output from getData.js call to createBinaryGraph.js is stored here.

The folder structure is as follows:

- library_name
  - manifest.json
  - \<date> folder
    - positions.bin
    - links.bin
    - labels.json
    - meta.json
    - data.json
    - data folder

The \<date> folder holds the node locations saved on disc to save from pulling from the database too often, increasing performance.

## Allowing Cross Site Requests For OrientDB

The OrientDB Documentation provides the below:

        To enable it, set a couple of additional headers in orientdb-server-config.xml under the HTTP listener XML tag:

        <listener protocol="http" ip-address="0.0.0.0" port-range="2480-2490" socket="default">
        <parameters>
            <parameter name="network.http.additionalResponseHeaders" value="Access-Control-Allow-Origin: *;Access-Control-Allow-Credentials: true" />
        </parameters>
        </listener>
        This setting is also global, so you can set it at JVM startup (java ... -Dnetwork.http.additionalResponseHeaders="Access-Control-Allow-Origin: *;Access-Control-Allow-Credentials: true") or by setting it as property in orientdb-server-config.xml file under "properties" XML tag.

## Notes

- Docker 3DViewer
- Should remove this date/manifest in 3DViewer/large_graph, but for now, the project expects it.
- For largegraph_data port (1338) is specified for our endpoint. This port can be modified to whichever port a user chooses to run http-server on. If you use a different port, you must change the port in large_graph_pm/src/config.js uses as a target.
- The port might also be different for the galaxy view (8081), look at what was generated by webpack after running npm start.
- large_graph is heavily based on github user Avanka's ngraph galaxy view (https://github.com/anvaka/pm). Modifications were made to work with our data and customize what is seen in the graph pane.
- We can also run two different binaries at the same time. The idea here was to compare two graphs side by side, and display the differences in PM. This currently does not work, and will be a heavy lift to get working. Keeping for history sake.

```bash
node getData.js <database1_name> <database2_name>
```
