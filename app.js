window.onload = function() {

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000 ),
        scene = new THREE.Scene(),
        renderer = new THREE.WebGLRenderer(),
        raycaster = new THREE.Raycaster(),
        controls = new THREE.TrackballControls( camera ),
        mouse = new THREE.Vector2();

    new DrillApp(camera, scene, renderer, raycaster, controls, mouse).init();

};

window.DrillApp = function(camera, scene, renderer, raycaster, controls, mouse) {

    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.raycaster = raycaster;
    this.controls = controls;
    this.mouse = mouse;
    this.offset = new THREE.Vector3();

    this.render = function() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    this.animate = function() {

        var listenAnimationCycle = function () {
            requestAnimationFrame(listenAnimationCycle);
            this.render();
        }.bind(this);

        listenAnimationCycle();
    }

    var objects = new LinkedList(), drillModel, plane;

    var INTERSECTED, 
        SELECTED, 
        previousSelected, 
        rollOverMesh,
        addPart = false;

    this.init = function() {

        initEnvironment.call(this);        

    }

    function initEnvironment() {

        initRenderer.call(this);
        initCamera.call(this);
        initLights.call(this);
        addSky.call(this);

        addEventListeners.call(this);
        
        addControls.call(this);

        loadModels.call(this);

        addRollOverMesh.call(this);

        addPlaneMesh.call(this);

        this.animate();

        return this;  
    }

    function addPlaneMesh() {
        plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(10000, 10000),
            new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.25, transparent: true})
        );

        plane.visible = false;

        plane.position.z = -2;

        scene.add(plane);

        return plane;
    }

    function addRollOverMesh() {
        // var rollOverGeo = new THREE.BoxGeometry( 5, 5, 5 );
        // var rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
        // rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
        // this.scene.add( rollOverMesh );
    }

    function loadModels() {

        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;

        var that = this;

        loader.load( 'models/collada/parts/bha-2.dae', function ( collada ) {

            var model = collada.scene;

            rollOverMesh = model.clone();
            rollOverMesh.position.x = 0;
            rollOverMesh.position.z = 10;

            that.scene.add( rollOverMesh );

            for (var i = 0; i < 5; i++) {
                var previousPart = objects.getLast();
                var tubePart = createTubePart.call(that, model, previousPart ? previousPart.data() : null);

                objects.push(tubePart);
                that.scene.add(tubePart);
            }

        });

    }

    function createTubePart(tubePartIn, previousTubePart) {
        var tubePart = tubePartIn.clone();
        tubePart.isColladaModel = true;
        tubePart.position.y = 10;

        if(previousTubePart) {
            tubePart.position.y = previousTubePart.position.y - 5.6;
        }
        
        tubePart.position.z = 0;
        return tubePart;
    }

    function addEventListeners() {
        this.renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove.bind(this), false );
        this.renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown.bind(this), false );
        this.renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp.bind(this), false );
        document.addEventListener( 'keydown', onDocumentKeyDown.bind(this), false );
        document.addEventListener( 'keyup', onDocumentKeyUp.bind(this), false );

        window.addEventListener( 'resize', onWindowResize.bind(this), false );
    }

    function addControls() {
        this.controls.rotateSpeed = 1.5;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;
    }

    function initRenderer() {
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
    }

    function initCamera() {
        this.camera.position.set( 0, 0, 50);
    }

    function addSky() {
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

        var sky = new THREE.Mesh( skyGeo, skyMat );
        this.scene.add( sky );
    }

    function initLights() {
        // LIGHTS

        var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 500, 0 );
        this.scene.add( hemiLight );

        this.hemiLight = hemiLight;

        //

        var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 50 );
        this.scene.add( dirLight );

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
        //dirLight.shadowCameraVisible = true;
    }

    function onDocumentMouseMove( event ) {

        event.preventDefault();

        this.mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

        raycaster.setFromCamera( mouse, camera );


        if(plane && rollOverMesh && this.offset) {
            var intersects = raycaster.intersectObject( plane );

            if ( intersects.length > 0 ) {
                var intersect = intersects[ 0 ];

                rollOverMesh.position.copy( intersects[ 0 ].point.sub( this.offset ) );

                if(rollOverMesh.position.x < 2 && rollOverMesh.position.x > -2) {
                    rollOverMesh.position.z = 10;
                }

            } else {
                INTERSECTED = null;
            }
        }

        this.render();

    }

    function onDocumentMouseDown( event ) {

        event.preventDefault();

        var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 ).unproject( camera );

        var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

        var objectsToCheck = getMeshesFromObjects();        

        var intersects = raycaster.intersectObjects( objectsToCheck );

        if ( intersects.length > 0 ) {

            var planeIntersects = raycaster.intersectObject( plane );
            this.offset.copy( planeIntersects[ 0 ].point ).sub( plane.position );

            if(previousSelected) {
               selectAllChildrenMeshes(previousSelected, null);
            }

            this.controls.enabled = false;

            var selectedMesh = SELECTED = intersects[ 0 ].object;

            if(selectedMesh.modelIndex || selectedMesh.modelIndex === 0) {
                SELECTED = objects.get(selectedMesh.modelIndex - 1).data();
            }

            previousSelected = SELECTED;

            selectAllChildrenMeshes(SELECTED, new THREE.MeshBasicMaterial({color : 0x0cfffa}));

        }

    }

    function getMeshesFromObjects() {
        var objectsToCheck = [], index = 0;

        if(objects) {
            objects.each(function(element) {
                index++;

                if(element.data() && element.data().isColladaModel) {
                    if(element.data().children) {

                        element.data().children.forEach(function(threeDObject, index3d, array) {
                            var deepestChildren = getAllTheDeepestChildren(threeDObject, [], index);
                            objectsToCheck = objectsToCheck.concat(deepestChildren);
                        });
                    }
                    
                } else {
                    objectsToCheck.push(element.data());
                }

            });
        }

        return objectsToCheck;
    }

    function getAllTheDeepestChildren(threeDObject, arrayToReturn, modelIndex) {

        if(!threeDObject.children || threeDObject.children.length === 0) {
            threeDObject.modelIndex = modelIndex;
            arrayToReturn.push(threeDObject);
            return arrayToReturn;
        }

        threeDObject.children.forEach(function(element) {

            getAllTheDeepestChildren(element, arrayToReturn, modelIndex);

        });

        return arrayToReturn;

    }

    function selectAllChildrenMeshes(selectedScene, material) {

        if(selectedScene.children) {

            selectedScene.children.forEach(function(threeDObject, index3d, array) {
                if(threeDObject.children.length == 1) {
                    if(material) {
                        threeDObject.children[0].previousMaterial = threeDObject.children[0].material;
                        threeDObject.children[0].material = material;
                    } else {
                        threeDObject.children[0].material = threeDObject.children[0].previousMaterial;
                    }
                }
            });
        }

    }

    function onDocumentKeyDown( event ) {

        switch( event.keyCode ) {
            case 16: addPart = true; break;
        }

    }

    function onDocumentKeyUp( event ) {

        switch ( event.keyCode ) {
            case 16: addPart = false; break;
        }

    }

    function onDocumentMouseUp( event ) {

        event.preventDefault();

        this.controls.enabled = true;

        this.mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

        this.raycaster.setFromCamera( mouse, camera );

        if(addPart) {
            var newPart = rollOverMesh.clone();
            objects.push(newPart);
            this.scene.add(newPart)
        }

        this.render();
    }

    function onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    
}