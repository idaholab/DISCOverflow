/**
 * Copyright 2021, Battelle Energy Alliance, LLC
 * Author: Andrei Kashcha
 * Edited by: Zachary Priest @ INL
 * Date: 6/19/2019
 */

var merge = require('ngraph.merge');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
module.exports = save;

function save(graph, options) {

  var thisTimestamp = typeof options.timestamp === 'string' ? options.timestamp : '2019-04-02T09-30-00Z';
  var outDir = typeof options.outDir === 'string' ? options.outDir : './broken/data';
  console.log('saving data to: ', outDir);
  options = merge(options, {
    //outDir: './430ATest2',
    //timestamp:'./2019-04-02T09-30-00Z',
    labels: 'labels.json',
    meta: 'meta.json',
    links: 'links.bin',
    data: 'data.json',
    manifest: 'manifest.json'
  });

  fixPaths();

  var labels = require('./lib/getLabels.js')(graph);
  saveLabels(labels);

  var data = require('./lib/getData.js')(graph);
  saveData(data);

  var linksBuffer = require('./lib/getLinksBuffer.js')(graph, labels);
  fs.writeFileSync(options.links, linksBuffer);
  console.log(graph.getLinksCount() + ' links saved to ' + options.links);

  saveMeta();

  function fixPaths() {
    if (!fs.existsSync(options.outDir)) {
      mkdirp.sync(options.outDir);
    }
    options.manifest = path.join(options.outDir, options.manifest);
    options.outDir = path.join(options.outDir, options.timestamp);
    if (!fs.existsSync(options.outDir)) {
      mkdirp.sync(options.outDir);
    }
    options.labels = path.join(options.outDir, options.labels);
    options.meta = path.join(options.outDir, options.meta);
    options.links = path.join(options.outDir, options.links);
    options.data = path.join(options.outDir, options.data);
  }

  var mani = JSON.stringify({last: "2019-04-02T09-30-00Z"});
  fs.writeFileSync(options.manifest, mani);


  function saveMeta() {
    var meta = getMetaInfo();
    fs.writeFileSync(options.meta, JSON.stringify(options.outDir+meta), 'utf8');
    console.log('Meta information saved to ' + options.meta);
  }

  function getMetaInfo() {
    return {
      date: +new Date(),
      nodeCount: graph.getNodesCount(),
      linkCount: graph.getLinksCount(),
      nodeFile: options.labels,
      linkFile: options.links,
      dataFile: options.data,
      version: '0.0.1'//require(path.join(__dirname, 'package.json')).version
    };
  }

  function saveLabels(labels) {
    fs.writeFileSync(options.labels, JSON.stringify(labels), 'utf8');
    console.log(labels.length + ' ids saved to ' + options.labels);
  }

  function saveData(data) {
    fs.writeFileSync(options.data, JSON.stringify(data), 'utf8');
    console.log(data.length + ' sets of information saved to ' + options.data);
  }
}
