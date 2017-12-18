define(['cameraSettings', 'controlSettings', 'lightSettings', 'eventHandlers', 'tubeBuilder', 'backgroundHelper', 'jQuery', 'eventEmitter' ], 

    function(CameraSettings, ControlSettings, LightSettings, EventHandlers, TubeBuilder, BackgroundHelper, jQuery) {

        function DrillApp(applicationSettings) {
            this.scene = new THREE.Scene();
            this.renderer = new THREE.WebGLRenderer();
            this.applicationSettings = applicationSettings;
        }

        function initRenderer(renderer) {
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild(renderer.domElement );
        }

        function updateSceneWithObjects(scene, objects) {
            
            if(objects.forEach) { // if it is array
                objects.forEach(function(object) {
                    addObjectToScene(scene, object);
                });
            } else if(objects.each) { //linked list
                objects.each(function(element) {
                    addObjectToScene(scene, element.data());
                });
            }

        }

        function addObjectToScene(scene, threeDObject) {
            var oldObject = scene.getObjectByName(threeDObject.name);

            if(threeDObject.name !== "" && oldObject) {
                scene.remove(oldObject);
            }

            scene.add(threeDObject);
        }

        function onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }

        function addRolloverMeshToScene() {
            var rollOverMesh = this.tubeBuilder.createRolloverMesh('basic');
            rollOverMesh.name = 'rollOverMesh';
            this.scene.add(rollOverMesh);

            this.eventHandlers.intersectHelper.getStateKeeper().setRolloverMesh(rollOverMesh);
        }

        jQuery.extend(DrillApp.prototype, jQuery.EventEmitter);

        DrillApp.prototype.applySettings = function() {

            initRenderer(this.renderer);

            this.cameraSettings = new CameraSettings(this.applicationSettings.cameraPosition);
            this.cameraSettings.create('perspective');
            this.camera = this.cameraSettings.getCamera();

            this.controlSettings = new ControlSettings(this.camera);
            this.controlSettings.create('trackball');

            this.lightSettings = new LightSettings();
            this.lightSettings.initLights();
            updateSceneWithObjects(this.scene, this.lightSettings.getLights());

        }

        DrillApp.prototype.applyEventListeners = function() {

            this.eventHandlers = new EventHandlers(this.renderer.domElement);

            this.eventHandlers.initIntersectHelpers(
                                    this.controlSettings.getMouse(), 
                                    this.controlSettings.getControls(), 
                                    this.cameraSettings.getCamera(), 
                                    this.backgroundHelper.getPlaneToIntersect(),
                                    this.tubeBuilder,
                                    this.applicationSettings.colors
                                );

            this.eventHandlers.getIntersectHelper().on('tubePartSelected', function(event, selectedObject) {
                console.log(selectedObject.name);
            });

            this.eventHandlers.on('createRolloverMesh', function() {
                this.controlSettings.getControls('trackball').reset();
                addRolloverMeshToScene.call(this);
            }.bind(this));

            this.eventHandlers.on('deleteRolloverMesh', function() {
                var rollOverMesh = this.scene.getObjectByName('rollOverMesh');
                this.scene.remove(rollOverMesh);
            }.bind(this));

            this.eventHandlers.addEventListeners(this);
        }

        DrillApp.prototype.render = function() {
            this.controlSettings.getControls().update();
            this.renderer.render(this.scene, this.camera);
        }

        DrillApp.prototype.animate = function() {

            var listenAnimationCycle = function () {
                requestAnimationFrame(listenAnimationCycle);
                this.render();
            }.bind(this);

            listenAnimationCycle();
        }

        DrillApp.prototype.startBuilder = function() {
            this.tubeBuilder = new TubeBuilder(this.applicationSettings.tubeSettings);
            this.tubeBuilder.buildTubeModel();

            this.tubeBuilder.on('tubeCreated', function() {
                updateSceneWithObjects(this.scene, this.tubeBuilder.getTubeParts());
            }.bind(this));

            this.tubeBuilder.on('tubeUpdated', function(event, deletedObjectName) {
                
                if(deletedObjectName) {
                    var oldObject = this.scene.getObjectByName(deletedObjectName);
                    this.scene.remove(oldObject);
                }

                updateSceneWithObjects(this.scene, this.tubeBuilder.getTubeParts());

            }.bind(this));
        }

        DrillApp.prototype.initBackgroundHelpers = function() {
            this.backgroundHelper = new BackgroundHelper(this.lightSettings.getHemiLight());
            this.backgroundHelper.initPlanes();
            updateSceneWithObjects(this.scene, [this.backgroundHelper.getBackground(), this.backgroundHelper.getPlaneToIntersect()])
        }

        DrillApp.prototype.init = function() {
            this.applySettings();
            this.animate();

            this.initBackgroundHelpers();
            this.startBuilder();

            this.applyEventListeners();

            window.addEventListener( 'resize', onWindowResize.bind(this), false );
        }

        return DrillApp;

});
