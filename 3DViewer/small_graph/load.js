// Copyright 2021, Battelle Energy Alliance, LLC

function loadFile() {
  var input, file, fr;

  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

  input = document.getElementById('fileinput');
  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  }
  else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
    alert("Please select a file before clicking 'Load'");
  }
  else {
    file = input.files[0];
    fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);
  }

  function receivedText(e) {
    let lines = e.target.result;
    var newArr = JSON.parse(lines);
    console.log(newArr);
    onLoad(newArr);
    onLoad2(newArr);
  }
}

function ChangeView() {
  var mainFrameOne = document.getElementById("graph");
  var mainFrameTwo = document.getElementById("cy");

  mainFrameOne.style.display = (
      mainFrameOne.style.display == "none" ? "block" : "none");
  mainFrameTwo.style.display = (
      mainFrameTwo.style.display == "block" ? "none" : "block");
}

function onLoad(array) {
    var theJson = array;

    let nodes = [...theJson.nodes].map(i => ({
        id: i['id'],
        name: i['data']['name'],
        class: i['data']['class']
    }));

    let links = [...theJson.edges].map(i => ({
        source: i['source'],
        target: i['target'],
        name: i['data']['class']
    }));

    let graph = {
        'nodes': nodes,
        'links': links
    }
    console.log(graph);

    // var container = document.body.childNodes[1].childNodes[1];
    var container = (document.getElementById('graph'));


    // var container = document.body;

    var myGraph = ForceGraph3D();
    myGraph(container).graphData(graph)
        (container)
        .linkDirectionalArrowLength(7)
        .linkDirectionalArrowRelPos(1)
        .linkCurvature(0.25)
        .linkOpacity(.85)
        .linkAutoColorBy('name')
        .nodeAutoColorBy("class")
        .nodeLabel('name')
        .onNodeHover(node => container.style.cursor = node ? 'pointer' : null)
        .onNodeClick(node => {
            // Aim at node from outside it
            const distance = 80;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            myGraph.cameraPosition({
                    x: node.x * distRatio,
                    y: node.y * distRatio,
                    z: node.z * distRatio
                }, // new position
                node, // lookAt ({ x, y, z })
                3000 // ms transition duration
            );
        });
}

function onLoad2(array) {
  console.log('print array', array)
  var container = (document.getElementById('cy'));
  console.log('container', container)

//   try{
  window.cy = cytoscape({
    container: container,
    layout: {
        name: 'cose-bilkent',

        nodeDimensionsIncludeLabels: true,

        refresh: 30,

        fit: true,

        padding: 10,

        // randomize: false,
        randomize: true,


        nodeRepulsion: 1000,

        idealEdgeLength: 40,

        edgeElasticity: 0.3,

        nestingFactor: 0.03,

        gravity: 0.15,

        numIter: 5000,

        tile: true,

        animate: 'end',

        tilingPaddingVertical: 30,

        tilingPaddingHorizontal: 30,

        gravityRangeCompound: 1.0,

        gravityCompound: 0.08,

        gravityRange: 2.0,

        initialEnergyOnIncremental: 0.9
        
        // name: 'spread',
        // animate: true, // Whether to show the layout as it's running
        // ready: undefined, // Callback on layoutready
        // stop: undefined, // Callback on layoutstop
        // fit: true, // Reset viewport to fit default simulationBounds
        // minDist: 20, // Minimum distance between nodes
        // padding: 20, // Padding
        // expandingFactor: -1.0, // If the network does not satisfy the minDist
        // // criterium then it expands the network of this amount
        // // If it is set to -1.0 the amount of expansion is automatically
        // // calculated based on the minDist, the aspect ratio and the
        // // number of nodes
        // prelayout: { name: 'cose' }, // Layout options for the first phase
        // maxExpandIterations: 4, // Maximum number of expanding iterations
        // boundingBox: undefined, // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        // randomize: false // Uses random initial node positions on true
    },
    style:[
        {
            selector: 'core',
            style: {
                "active-bg-opacity": 0.3,
                "active-bg-color": "#ff0",
            }
        },
        {
            selector: 'node',
            style: {
                'shape': 'tag',
                'border-color': '#323232',
                'border-opacity': 0.7,
                'border-width': 1,
                'border-style': 'solid',
                "font-weight": 300
            }
        },
        {
            selector: 'node[color]',
            style: {
                'shape': 'tag',
                'background-color': 'data(color)'
            }
        },
        {
            selector: 'node.global',
            style: {
                'shape': 'ellipse'
            }
        },
        {
            selector: 'node.unexported',
            style: {
                'border-color': '#323232',
                'border-opacity': 0.6,
                'border-width': 2,
                'border-style': 'dashed'
            }
        },

        {
            selector: 'node[label]',
            style: {
                label: "data(name)",//done
                "font-family": "monospace"
            }
        },

        {
            selector: 'node:parent',
            style: {
                'background-opacity': 0.333,
                'border-width': 0,
                'border-opacity': 0,
            },
        },
        {
            selector: 'node.function',
            style: {
                'font-style': "italic",
                "font-weight": 700
            },
        },
        {
            selector: 'node.type',
            style: {
                "font-weight": 700
            },
        },
        {
            selector: 'node:parent',
            style: {
                'compound-sizing-wrt-labels': 'include'
            },
        },

        {
            selector: 'edge',
            style: {
                'line-color': '#a12b87',
                'curve-style': "straight",
                "target-arrow-shape": "vee",
                "target-arrow-color": "#a12b87",
                "arrow-scale": 1.5,
                "label": 'data(class)'
            },
        },
        {
            selector: 'edge.function_return',
            style: {
                "curve-style": "bezier"
            }
        },
        {
            selector: 'edge.concurrent',
            style: {
                "mid-target-arrow-shape": "triangle-tee",
            }
        },
        {
            selector: 'edge.calls',
            style: {
                "mid-target-arrow-shape": "diamond",
            }
        },
        {
            selector: 'edge.has_block',
            style: {
                "line-style": "dashed",
                "curve-style": "bezier",
                "line-dash-pattern": [6, 6],
            }
        },
        {
            selector: 'edge.branch_true',
            style: {
                'line-color': '#ef60f9',
                "target-arrow-color": "#ef60f9",
            }
        },
        {
            selector: 'edge.branch_false',
            style: {
                'line-color': '#5ece5c',
                "target-arrow-color": "#5ece5c",
            }
        },
        {
            selector: 'edge.branch_unconditional',
            style: {
                'line-color': '#64a1a0',
                "target-arrow-color": "#64a1a0",
            }
        },
    ],  elements: array

  });

//   }catch(err){
//     console.log("ERROR IN CYTO" + err);
//   }
}