// https://stackoverflow.com/questions/34260297/how-to-add-a-large-number-of-visible-arrows-in-three-js-using-three-arrowhelper
// https://stackoverflow.com/questions/41817879/minimizing-number-of-three-js-draws
// http://jsfiddle.net/pardo/bgyem42v/3/
import appConfig from './appConfig.js';
import sceneStore from '../store/scene.js';

export default renderLinks;

function renderLinks(scene, THREE) {
  var linksVisible = true;
  var linkMesh;

  var api = {
    /**
     * Renders links based on current graph model
     */
    render: render,
    /**
     * Turns links rendering on or off
     */
    toggleLinks: toggleLinks,
    /**
     * Gets or sets links visibility. If you pass truthy argument
     * sets visibility to that value. Otherwise returns current visibility
     */
    linksVisible: setOrGetLinksVisible
  };

  return api;

  function setOrGetLinksVisible(newValue) {
    if (newValue === undefined) {
      return linksVisible;
    }

    if (newValue) {
      scene.add(linkMesh);
    } else {
      scene.remove(linkMesh);
    }

    linksVisible = newValue;
    return linksVisible;
  }

  /*Modifying to include THREE geometry objects to draw arrows from nodes*/
  function render(links, idxToPos, linksCount) {

    var jsPos = [];
    var jsColors = [];
    var arrow = [];
    var normals = [];

    var r = 16000;
    var i = 0;
    var linkId = 0;
    var maxVisibleDistance = appConfig.getMaxVisibleEdgeLength();

    // for(i=0; i< links.length; ++i){
    //   if (to === undefined) continue; // no links for this node
    //   console.log('info;, ', i);
    //   console.log('our info: ', sceneStore.getNodeInfo(i));//TODO: IMPORT linkInfo[] to determine class type    
    // }

    var lines = new THREE.Geometry();
    for (i = 0; i < links.length; ++i) {
      var to = links[i];
      if (to === undefined) continue; // no links for this node
      // console.log('info', idxToPos);
      // console.log('our info: ', sceneStore.getNodeInfo(i));//TODO: IMPORT linkInfo[] to determine class type

      var fromX = idxToPos[i * 3];
      var fromY = idxToPos[i * 3 + 1];
      var fromZ = idxToPos[i * 3 + 2];

      var from = new THREE.Vector3(fromX, fromY, fromZ);

      for (var j = 0; j < to.length; j++) {
        var toIdx = to[j];

        var toX = idxToPos[toIdx * 3];
        var toY = idxToPos[toIdx * 3 + 1];
        var toZ = idxToPos[toIdx * 3 + 2];

        // var to = new THREE.Vector3(toX, toY, toZ);

        var dist = distance(fromX, fromY, fromZ, toX, toY, toZ);
        // var direction = to.clone().sub(from);
        // var length = direction.length();
        if (maxVisibleDistance < dist) continue;
        jsPos.push(fromX, fromY, fromZ, toX, toY, toZ);
        //x arrow.push(direction.normalize(), from, length, 0xffff00);
        //x lines.faces.push( new THREE.Face3(0, 1, 2) );

        // var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xffff00, 10, 5);
        //x scene.add(arrowHelper);
        // arrow.push(arrowHelper);
        
        jsColors.push(fromX / r + 0.5, fromY / r + 0.5, fromZ / r + 0.5, toX / r + 0.5, toY / r + 0.5, toZ / r + 0.5)
      }

    }
    // console.log("arrow", arrow);
    var positions = new Float32Array(jsPos);
    var colors = new Float32Array(jsColors);

    console.log("Pos: ", positions);
    console.log("Colors: ", colors);

    // var group = new THREE.Group();
    var geometry = new THREE.BufferGeometry();

    var material = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending,
      opacity:0.5,
      transparent: true
    });


    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

    // arrow.forEach(function(element) {
    //   element.line
    //   group.add(element);
    // });
    //x geometry.addAttribute('normal', new THREE.BufferAttribute(normal, 3));

    geometry.computeBoundingSphere();

    if (linkMesh) {
      scene.remove(linkMesh);
    }
    linkMesh = new THREE.Line(geometry, material, THREE.LinePieces); //DRAWS LINES

    //x scene.add(group);

    scene.add(linkMesh);
  }

  function toggleLinks() {
    setOrGetLinksVisible(!linksVisible);
  }
}

function distance(x1, y1, z1, x2, y2, z2) {
  return (x1 - x2) * (x1 - x2) +
        (y1 - y2) * (y1 - y2) +
        (z1 - z2) * (z1 - z2);
}
