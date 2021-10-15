/**
 * Copyright 2021, Battelle Energy Alliance, LLC
 * Author: Andrei Kashcha
 * Edited by: Zachary Priest @ INL
 * Date: 6/19/2019
 */

module.exports = getLinksBuffer;

function getLinksBuffer(graph, labels) {
  var nodeMap = Object.create(null);

  labels.forEach(function(element, i) {
    // +1 to avoid 0 uncertainty
    console.log('element: ', element);
    nodeMap[element] = i + 1;
    //console.log('our nodeMap ', nodeMap);
  });
  //console.log("final nodeMap: ",nodeMap);
  var linksCount = graph.getLinksCount();
  //console.log("our links Count before writing: ", linksCount);
  var buf = new Buffer.alloc((labels.length + linksCount) * 4);
  var idx = 0;

  graph.forEachNode(function(node) {
    var startWriten = false;
    //console.log("getLinksBuffer Node: ", node);
    var start = nodeMap[node.id];
    graph.forEachLinkedNode(node.id, saveLink, true);

    function saveLink(node) {
      if (!startWriten) {
        startWriten = true;
        buf.writeInt32LE(-start, idx);

	//console.log("start: ", start);
        idx += 4;
      }
      var other = nodeMap[node.id];

      buf.writeInt32LE(other, idx);

     // console.log("other: ", other);
      idx += 4;
    }
    //console.log('after saving link: ', node);
  });

  return buf.slice(0, idx);
}
