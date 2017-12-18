//creates different types of controls and init them

define(['threejs', 'trackballControls'], function() {

    function ControlSettings (camera) {
    	this.camera = camera;
    	this.mouse = new THREE.Vector2();
    	this.controls = null;
    }

	ControlSettings.prototype.create = function(controlsType) {
		this.controls = new THREE.TrackballControls( this.camera );
		initTrackBallControls(this.controls);
	}

	ControlSettings.prototype.getControls = function(controlsType) {
		return this.controls;
	}

	ControlSettings.prototype.getMouse = function() {
		return this.mouse;
	}

	function initTrackBallControls(controls) {
        controls.rotateSpeed = 1.5;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
    }

	return ControlSettings;


});