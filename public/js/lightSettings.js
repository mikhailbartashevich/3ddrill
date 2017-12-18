define(['threejs'], function() {

    function LightSettings () {
        this.lights = [];
    }    

    function createHemiSphereLight() {
        var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 500, 0 );

        return hemiLight;
    }

    function createDirectinalLight() {
        var dirLight =  new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 50 );

        dirLight.castShadow = true;

        dirLight.shadowMapWidth = 2048;
        dirLight.shadowMapHeight = 2048;

        var d = 50;

        dirLight.shadowCameraLeft = -d;
        dirLight.shadowCameraRight = d;
        dirLight.shadowCameraTop = d;
        dirLight.shadowCameraBottom = -d;

        dirLight.shadowCameraFar = 3500;
        dirLight.shadowBias = -0.0001;
        dirLight.shadowDarkness = 0.35;

        return dirLight
    }

    LightSettings.prototype.initLights = function() {
        this.hemiLight = createHemiSphereLight();
        this.lights.push(this.hemiLight);

        this.directinalLight = createDirectinalLight();
        this.lights.push(this.directinalLight);
    }

    LightSettings.prototype.getLights = function() {
        return this.lights;
    }

    LightSettings.prototype.getHemiLight = function() {
        return this.hemiLight;
    }
   

    return LightSettings;

});

