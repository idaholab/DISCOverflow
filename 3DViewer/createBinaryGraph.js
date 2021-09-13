/**
 * Copyright 2021, Battelle Energy Alliance, LLC
 * Author: Zachary Priest @ Idaho National Laboratory
 * This is a node module that allows us to:
 * Create the binary representation for (positions, links, labels.json, data.json) the ngraph library uses for the PM project to get a static view
 */

'use strict';
module.exports = process;
//TODO: Extend this to loop through a list of arguments.  Possibly a list files.
// var ourFile = process.argv[2];
async function process(ourFile, jsonData) {
		let finished = false;
		let fromJson = require('./libs/fromJson.js');
		let createPositions = require('./libs/positions.js');
		let toBinary = require('./libs/toBinary.js');
		let data = JSON.parse(jsonData);
		try{
			//custom transformer/serialization of the data
			var jsonToGraph = fromJson(data,function nodeLoadTransform(node) {
				return {id: node.id, data: node.data };
				},function linkLoadTransform(link) {
				return {source: link.source, target: link.target, data:link.data };
				});
			var links = toBinary(jsonToGraph, {outDir: 'largegraph_data/'+ourFile, timestamp:'2019-04-02T09-30-00Z'});
			//send in custom args to speed up debugging, change iterations to 500 and saveEach to 5  for better results
			var positions = createPositions(jsonToGraph, {iterations: 300, saveEach: 5, outDir: 'largegraph_data/'+ourFile+'/2019-04-02T09-30-00Z/data/', layout: require('ngraph.forcelayout3d')});
			positions.run();
			finished = true;
		} catch(err){
			console.log('error in createBinaryGraph', err);
		}
		return finished;
}
