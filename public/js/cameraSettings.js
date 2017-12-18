//creates different types of controls and init them

define(['threejs'], function() {

    function CameraSettings (cameraPosition) {
    	this.initialCamerPosition = cameraPosition;
    }

	CameraSettings.prototype.create = function(cameraType) {
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000 );
		this.initPerspectiveCamera();
	}

	CameraSettings.prototype.getCamera = function(controlsType) {
		return this.camera;
	}

	CameraSettings.prototype.initPerspectiveCamera = function() {
       this.camera.position.set(this.initialCamerPosition.x, this.initialCamerPosition.y, this.initialCamerPosition.z);
       this.camera.updateProjectionMatrix ()
    }

	return CameraSettings;


});