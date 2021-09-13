/**
 * Copyright 2021, Battelle Energy Alliance, LLC
 * Author: Andrei Kashcha
 * Edited by: Zachary Priest @ INL
 * Date: 6/19/2019
 */

module.exports = load;

var createGraph = require('ngraph.graph');

function load(jsonGraph, nodeTransform, linkTransform) {
  var stored;
  nodeTransform = nodeTransform || id;
  linkTransform = linkTransform || id;
  if (typeof jsonGraph === 'string') {
    stored = JSON.parse(jsonGraph);
  } else {
    stored = jsonGraph;
  }

  console.log('our jsongraph: ', jsonGraph);

  var graph = createGraph(),
      i;

  if (stored.edges === undefined || stored.nodes === undefined) {
    throw new Error('Cannot load graph without links and nodes');
  }

  for (i = 0; i < stored.nodes.length; ++i) {
    var parsedNode = nodeTransform(stored.nodes[i]);
    if (!parsedNode.hasOwnProperty('id')) {
      throw new Error('Graph node format is invalid: Node id is missing');
    }
    console.log("our node: ",parsedNode);
    graph.addNode(parsedNode.id, parsedNode.data);
  }

  for (i = 0; i < stored.edges.length; ++i) {
    var link = linkTransform(stored.edges[i]);
    if (!link.hasOwnProperty('source') || !link.hasOwnProperty('target')) {
      throw new Error('Graph link format is invalid. Both fromId and toId are required');
    }

    console.log("our link data: ", link.data);
    graph.addLink(link.source, link.target, link.data);

  }

  return graph;
}

function id(x) { return x; }
