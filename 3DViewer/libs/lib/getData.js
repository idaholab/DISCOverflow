/**
 * Copyright 2021, Battelle Energy Alliance, LLC
 * Gets all data (i.e. node data) as array, sorted in the 'forEachNode()' order
 * Author: Zachary Priest @ INL
 * Date: 5/30/2019
 */

module.exports = getData;

function getData(graph) {
   var data = [];
   graph.forEachNode(saveData);

   return data;

   function saveData(node) {
     data.push(node.data);
   }

}
