/**
 * Copyright 2021, Battelle Energy Alliance, LLC
 * Gets all labels (i.e. node ids) as array, sorted in the `forEachNode()` order
 * Author: Zachary Priest @ INL
 * Date: 5/30/2019
 */

module.exports = getLabels;

function getLabels(graph) {
  var labels = [];
  graph.forEachNode(saveNode);

  return labels;

  function saveNode(node) {
    console.log("Our node datas", node.data);
    labels.push(node.id);
  }
}
