export default graphSpecificInfo;

function graphSpecificInfo(graphName) {
  switch(graphName) {
    case 'fit_trilog':
    // case '430ATest':
    // case 'bower':
    // case 'cpan':
    // case 'cran':
    // case 'composer':
    // case 'rubygems':
    // case 'debian':
    // case 'fedora':
    // case 'arch':
    // case 'brew':
    // case 'nuget':
    // case 'python':
    //   return new PackagesGraph(graphName);
    // case 'gosearch':
    //   return new GoGraph(graphName);
    // case 'github':
    //   return new FollowersGraph(graphName);
  }
  return new DefaultGraph(graphName);
}


//TODO change this to match the actual edge_name (from edge @class)
function DefaultGraph(graphName) {
  this.graphName = graphName;
  this.getInDegreeLabel = function getInDegreeLabel(inDegreeValue) {
    console.log('in graphSpecificInfo.js inDegreeLabel: ', inDegreeValue)
    return 'in';
  };

  this.getOutDegreeLabel = function getInDegreeLabel(outDegreeValue) {
    console.log('in graphSpecificInfo.js outDegreeLabel: ', outDegreeValue)

    return 'out';
  };
}

// function PackagesGraph(graphName) {
//   DefaultGraph.call(this, graphName);
//
//   this.getInDegreeLabel = function getInDegreeLabel(inDegreeValue) {
//     return inDegreeValue === 1 ? 'dependent' : 'dependents';
//   };
//
//   this.getOutDegreeLabel = function getInDegreeLabel(outDegreeValue) {
//     return outDegreeValue === 1 ? 'dependency' : 'dependencies';
//   };
// }
//
// function GoGraph(graphName) {
//   PackagesGraph.call(this, graphName);
// }
//
// function FollowersGraph(graphName) {
//   DefaultGraph.call(this, graphName);
//
//   this.getInDegreeLabel = function getInDegreeLabel(inDegreeValue) {
//     return inDegreeValue === 1 ? 'follower' : 'followers';
//   };
//
//   this.getOutDegreeLabel = function getInDegreeLabel(outDegreeValue) {
//     return 'following';
//   };
// }
