require('./thunderboard.component.less')
const buttonImage = require('../badge-button/Button_Flat_White.svg')

var THREE = require('three')
THREE.MTLLoader = require('./MTLLoader');
THREE.OBJLoader = require('./OBJLoader');

var camera, scene, gyro, renderer, obj, loaded;

const HEIGHT = 300;
const WIDTH = 400;
const DegreeToRadiansFactor = (Math.PI/180);


function initBoard() {
  var mtlLoader = new THREE.MTLLoader.MTLLoader();
  mtlLoader.setPath('obj/thunderboard/');
  mtlLoader.load( "Thunderboard.mtl", function( materials ) {
    materials.preload();
    for(var key in materials.materials){ 
      if(materials.materials[key].map != null){ 
        materials.materials[key].color.r = 1; 
        materials.materials[key].color.g = 1; 
        materials.materials[key].color.b = 1; 
      } 
    } 
    var objLoader = new THREE.OBJLoader.OBJLoader();
    objLoader.setPath('obj/thunderboard/');
    objLoader.setMaterials( materials );
    objLoader.load("Thunderboard.obj", function ( object ) {
        obj = object;
        object.position.x = 3;
        scene.add(object);

      });
  });
}

function initScene(element){
  if(!element){
    return;
  }

  if(loaded){
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, WIDTH / HEIGHT, 0.1, 1000 );
  camera.position.z = 0;
  camera.position.x = 8;
  

  const ambient = new THREE.AmbientLight( 0x444444 );
  scene.add( ambient );

  const directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 8, 0, 1 ).normalize();
  scene.add( directionalLight );

  initBoard();

  renderer = new THREE.WebGLRenderer({alpha:true});
  renderer.setSize(WIDTH, HEIGHT);
  element.appendChild(renderer.domElement)
  loaded = true;
  render()
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  camera.lookAt( scene.position );
  renderer.render( scene, camera );
}

/* @ngInject */
const thunderboardComponent = {
  template: `
    <div class="thunderboard">
      <img class="thunderboard-qr" />

      <div class="io-controls">
        <div id="ledb" class="toggle-button" ng-click="tbControl.toggleLed('ledg')">
          <span ng-class="{ 'green': tbControl.device.sensors.io.ledg == 1}">${buttonImage}</span>
          <span class="label">Green LED</span>
        </div>
        <div id="ledg" class="toggle-button" ng-click="tbControl.toggleLed('ledb')">
          <span ng-class="{ 'blue': tbControl.device.sensors.io.ledb == 1}">${buttonImage}</span>
          <span class="label">Blue LED</span>
        </div>
        <div id="sw1" class="toggle-button">
          <span ng-class="{ 'red': tbControl.device.sensors.io.sw1 == 1}">${buttonImage}</span>
          <span class="label">Switch B</span>
        </div>
        <div id="sw0" class="toggle-button">
          <span ng-class="{ 'red': tbControl.device.sensors.io.sw0 == 1}">${buttonImage}</span>
          <span class="label">Switch A</span>
        </div>
      </div>

      <div class="env-controls">
        <div id="temp" class="env-control">
          <span class="value">{{ tbControl.device.sensors.environment.temperature }}</span><br/>
          <span class="label">Temp</span>
        </div>
        <div id="humidity" class="env-control" >
          <span class="value">{{ tbControl.device.sensors.environment.humidity }}</span><br/>
          <span class="label">Humidity</span>
        </div>
        <div id="ambientLight" class="env-control">
          <span class="value">{{ tbControl.device.sensors.environment.ambientLight }}</span><br/>
          <span class="label">Ambient Light</span>
        </div>
        <div id="uvIndex" class="env-control">
          <span class="value">{{ tbControl.device.sensors.environment.uvIndex }}</span><br/>
          <span class="label">UV Index</span>
        </div>
      </div>
    </div>
  `,
  replace: true,
  bindings: {device: "="},
  controllerAs: 'tbControl',
  /* @ngInject */
  controller ($scope) {
    var widget = this;
    widget.loaded = false;
    function setupController(){
      initScene(document.getElementsByClassName('thunderboard')[1]);
      $scope.box = obj;

      // var qrImg = document.getElementsByClassName('thunderboard-qr')[1];
      // var url = window.location.href;
      // var qrUrl = url.replace('demo?', 'demo-gyro-controller?')
      // var chartUrl = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl='+encodeURIComponent(qrUrl)
      // qrImg.src = chartUrl;    // creates an <img> tag as text


      //watch motion
      $scope.$watch(() => {
        return widget.device.sensors.motion
      }, (newValue) => {
        if(obj){
          obj.rotation.set( 
            -1*newValue.ox * DegreeToRadiansFactor,
            newValue.oz * DegreeToRadiansFactor,
            newValue.oy * DegreeToRadiansFactor, 
            'XZY');
        }
      })

      //watch environment
      $scope.$watch(() => {
        return widget.device.sensors.environment
      }, (newValue) => {
        //pass
      })

      //watch io
      $scope.$watch(() => {
        return widget.device.sensors.io
      }, (newValue) => {
        //pass
      })

      animate()
    }
    setTimeout(setupController, 2000)

    this.toggleLed = (led) => {
      if (this.device.sensors.io[led] === 0) {
        this.device.sensors.io[led] = 1;
      } else {
        this.device.sensors.io[led] = 0;
      }
      this.device.update('io', JSON.stringify({
        channel: "io",
        message: JSON.stringify({io:this.device.sensors.io})
      }));
    }
  }
}

module.exports = thunderboardComponent;