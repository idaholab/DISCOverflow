import getGraphSpecificInfo from './graphSepcific/graphSpecificInfo.js';
import scene from './scene.js';
import formatNumber from '../utils/formatNumber.js';

export default getBaseNodeViewModel;

function getBaseNodeViewModel(nodeId) {
  var graphName = scene.getGraphName();
  var graphSpecificInfo = getGraphSpecificInfo(graphName);
  var nodeInfo = scene.getNodeInfo(nodeId);
  // console.log(nodeInfo.name);
  console.log('our node info ', nodeInfo);
  return {
    name: nodeInfo.name,
    id: nodeInfo.id,
    data: nodeInfo.data,

    inDegree: formatNumber(nodeInfo.in),
    inDegreeLabel: graphSpecificInfo.getInDegreeLabel(nodeInfo.in),

    outDegree: formatNumber(nodeInfo.out),
    outDegreeLabel: graphSpecificInfo.getOutDegreeLabel(nodeInfo.out)
  };
}
