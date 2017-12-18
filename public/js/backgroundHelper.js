define(['threejs'], function() {

    function BackgroundHelper(hemiLight) {
        this.planeToIntersect = null;
        this.skyBackground = null;
        this.hemiLight = hemiLight;
    }

    BackgroundHelper.prototype.createSkyBackground = function() {
        // SKYDOME
        var vertexShader = document.getElementById( 'vertexShader' ).textContent;
        var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;

        var uniforms = {
            topColor:    { type: "c", value: new THREE.Color( 0x0077ff ) },
            bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
            offset:      { type: "f", value: 33 },
            exponent:    { type: "f", value: 0.6 }
        }

        uniforms.topColor.value.copy( this.hemiLight.color );

        var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
        var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

        this.skyBackground = new THREE.Mesh( skyGeo, skyMat );
    }

    BackgroundHelper.prototype.createPlaneMesh = function() {
        this.planeToIntersect = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(10000, 10000),
            new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.25, transparent: true})
        );

        this.planeToIntersect.visible = false;
        this.planeToIntersect.position.z = -2;
    }

    BackgroundHelper.prototype.getPlaneToIntersect = function() {
        return this.planeToIntersect;
    }

    BackgroundHelper.prototype.getBackground = function() {
        return this.skyBackground;
    }

    BackgroundHelper.prototype.initPlanes = function() {
        this.createSkyBackground();
        this.createPlaneMesh();
    }


    return BackgroundHelper;

});

  