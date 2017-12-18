define(['threejs', 'intersectHelper', 'jQuery', 'eventEmitter'], function(threejs, IntersectHelper, jQuery) {

    function EventHandlers (domElement) {
        this.domElement = domElement;
        this.deleteSelectedPart = false;
        this.rolloverMeshCreated = false;
    }

    function onDocumentKeyDown( event ) {

        switch( event.keyCode ) {

            case 16: // shift
                if(!this.deleteSelectedPart) {
                    this.deleteSelectedPart = true;
                }

                break;

            case 17: //  ctrl
                if(!this.rolloverMeshCreated) {
                    this.emit('createRolloverMesh');
                    this.rolloverMeshCreated = true;
                }

                break;
            
            case 38: // up
                this.emit('moveUp');

                break;
            
            case 40: // down
                this.emit('moveDown');

                break;
        }

    }

    function onDocumentKeyUp( event ) {

        switch ( event.keyCode ) {

            case 16: // shift
                this.deleteSelectedPart = false; 
                break; 

            case 17: // ctrl
                this.emit('deleteRolloverMesh');
                this.rolloverMeshCreated = false;
                break; 
        }

    }

    function onDocumentMouseUp( event ) {
        event.preventDefault();
        this.intersectHelper.processMouseUpEvent(this.deleteSelectedPart);
    }

    function onDocumentMouseMove( event ) {
        event.preventDefault();
        this.intersectHelper.processMouseMoveEvent(event);
    }

    function onDocumentMouseDown( event ) {
        event.preventDefault();
        this.intersectHelper.processMouseDownEvent(this.deleteSelectedPart);
    }

    jQuery.extend(EventHandlers.prototype, jQuery.EventEmitter);

    EventHandlers.prototype.initIntersectHelpers = function(mouse, controls, camera, plane, tubeBuilder, colors) {

        this.intersectHelper = new IntersectHelper(mouse, controls, camera, plane, tubeBuilder, colors);

        this.on('deleteRolloverMesh', function() {
            this.intersectHelper.getStateKeeper().deleteRolloverMesh();
        }.bind(this));

        this.on('moveUp', function() {
            this.intersectHelper.getTubeBuilder().moveTube();
        }.bind(this));

        this.on('moveDown', function() {
           this.intersectHelper.getTubeBuilder().moveTube(true);
        }.bind(this));
    }

    EventHandlers.prototype.getIntersectHelper = function() {
        return this.intersectHelper;
    }

    EventHandlers.prototype.addEventListeners = function() {
        this.domElement.addEventListener( 'mousemove', onDocumentMouseMove.bind(this), false );
        this.domElement.addEventListener( 'mousedown', onDocumentMouseDown.bind(this), false );
        this.domElement.addEventListener( 'mouseup', onDocumentMouseUp.bind(this), false );

        document.addEventListener( 'keydown', onDocumentKeyDown.bind(this), false );
        document.addEventListener( 'keyup', onDocumentKeyUp.bind(this), false );
    }

    return EventHandlers;
});


