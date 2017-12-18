define(['threejs', 'modelProcessor', 'stateKeeper', 'jQuery', 'eventEmitter'], function(threejs, ColladaModelProcessor, StateKeeper, jQuery) {

	function IntersectHelper(mouse, controls, camera, plane, tubeBuilder, tubeBuilderSettings) {
		this.mouse = mouse;
		this.controls = controls;
		this.camera = camera;
		this.plane = plane;
		this.tubeBuilder = tubeBuilder;
		this.modelProcessor = new ColladaModelProcessor(); //TODO factory
		this.stateKeeper = new StateKeeper();

		this.highLightMaterial = new THREE.MeshBasicMaterial({color : tubeBuilderSettings.highLightColor});
		this.highLightMaterial.temporary = true;

		this.selectMaterial = new THREE.MeshBasicMaterial({color : tubeBuilderSettings.selectionColor});
		this.selectMaterial.temporary = true;

		this.mouseOffset = 0.1;
	}

	function disableControls() {
		this.controls.enabled = false;
	}

	function enableControls() {
		this.controls.enabled = true;
	}

	function adjustDraggableOffset(raycaster) {
		var planeIntersects = raycaster.intersectObject(this.plane);
		this.stateKeeper.changeDraggableOffset(planeIntersects[ 0 ].point, this.plane.position);
	}

	jQuery.extend(IntersectHelper.prototype, jQuery.EventEmitter);

	IntersectHelper.prototype.createRaycaster = function(startPosition) {

		var x = this.mouse.x;
		var y = this.mouse.y;
		var z = 0.5;

		if(startPosition) {
			x = startPosition.x;
			y = startPosition.y;
			z = startPosition.z;
		}

		var vector = new THREE.Vector3(x, y, z).unproject(this.camera);
		return new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
	}

	IntersectHelper.prototype.calculateHoveredObjects = function() {
		
		this.clearHoveredObjects();

		var hoveredPart = this.calculateHoveredTubePart({ x : this.mouse.x, y : this.mouse.y + this.mouseOffset, z : 0.5}); // up to the half of the height of the model
		this.stateKeeper.addHoveredObject(hoveredPart);

		hoveredPart = this.calculateHoveredTubePart({ x : this.mouse.x, y : this.mouse.y -this.mouseOffset, z : 0.5}); // down to the half of the height of the model
		this.stateKeeper.addHoveredObject(hoveredPart);

		this.highLightHoveredObjects();
	}

	IntersectHelper.prototype.highLightHoveredObjects = function() {
		if(this.stateKeeper.getHoveredObjects().size()) {
			this.modelProcessor.highLightAllChildrenMeshesInList(this.stateKeeper.getHoveredObjects(), this.highLightMaterial);
		}
	}

	IntersectHelper.prototype.clearHoveredObjects = function() {
		if(this.stateKeeper.getHoveredObjects().size()) {
			this.modelProcessor.unHighLightAllChildrenMeshesInList(this.stateKeeper.getHoveredObjects());
			this.stateKeeper.clearHoveredObjects();
		}
	}

	IntersectHelper.prototype.calculateHoveredTubePart = function(startPosition) {
		var raycaster = this.createRaycaster(startPosition);
		var intersect = this.calculateSelectedObject(raycaster);

		if(intersect) {
			var loaderModel = this.modelProcessor.getLoaderModelFromMesh(intersect, this.tubeBuilder.getTubeParts());
		}

		return loaderModel;
	}

	IntersectHelper.prototype.highLightIntersectedTubeParts = function(raycaster) {
		var planeIntersects = raycaster.intersectObject(this.plane);

        if (planeIntersects.length > 0) {
            this.stateKeeper.changeRolloverMeshPosition(planeIntersects[0]);
        }

        this.calculateHoveredObjects();
	}

	IntersectHelper.prototype.highLightTubeParts = function() {
		this.clearHoveredObjects();
    	var hoveredPart = this.calculateHoveredTubePart();
		this.stateKeeper.addHoveredObject(hoveredPart);
		this.highLightHoveredObjects();
		if(this.stateKeeper.getSelectedObjects().size()) {
			this.modelProcessor.selectAllChildrenMeshes(this.stateKeeper.getSelectedObjects().getFirst().data(), this.selectMaterial);
		}
	}

	IntersectHelper.prototype.processMouseMoveEvent = function(event) {
		this.mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
 
		var raycaster = this.createRaycaster();
		raycaster.setFromCamera(this.mouse, this.camera);

		if(this.stateKeeper.getRolloverMesh()) {
			this.highLightIntersectedTubeParts(raycaster);
	    } else {
	    	this.highLightTubeParts();
	    }

	}

	IntersectHelper.prototype.processMouseUpEvent = function() {
		enableControls.call(this);

		if(this.stateKeeper.getRolloverMesh()) {
			this.addNewTubePart();
		} 
	}

	IntersectHelper.prototype.processMouseDownEvent = function(deleteSelectedPart) {
		if(!this.stateKeeper.getRolloverMesh()) {
			this.selectTubePart(deleteSelectedPart);
		}
	}

	IntersectHelper.prototype.addNewTubePart = function() {
		var index = this.getIndexForNewTubePart(this.stateKeeper.getHoveredObjects());

		if(index > -1) {
			this.clearHoveredObjects();
			this.tubeBuilder.insertNewTubePart(index, this.stateKeeper.getRolloverMesh());
		}

	}

	IntersectHelper.prototype.getIndexForNewTubePart = function(hoveredObjects) {

		if(this.tubeBuilder.getTubeParts().size() === 0) {
			return 0;
		}

		var oldTubeParts = this.tubeBuilder.getTubeParts();

		if(hoveredObjects.size() === 1) {

			if( this.stateKeeper.isFirstTubePart(hoveredObjects.pop(), oldTubeParts) ) {
				return 0;
			}

			return this.tubeBuilder.getTubeParts().size() - 1; //else last one

		} else if(hoveredObjects.size() === 2) {
			var firstIndex = this.stateKeeper.getTubePartIndex(hoveredObjects.getFirst(), oldTubeParts);
			var secondIndex = this.stateKeeper.getTubePartIndex(hoveredObjects.getLast(), oldTubeParts);

			if(firstIndex > secondIndex) {
				return firstIndex;
			}
			
			return secondIndex;

		} else {
			//else something goes wrong
			console.log("hoveredObjects size = " + hoveredObjects.size());
		}

	}

	IntersectHelper.prototype.updateSelectedMeshes = function(selectionResult, selectedLoaderModel) {
		if(!selectionResult.sameObjects) {
			this.modelProcessor.selectAllChildrenMeshes(selectedLoaderModel, this.selectMaterial);
			this.modelProcessor.deselectAllChildrenMeshes(selectionResult.previouslySelected);
		}
	}

	IntersectHelper.prototype.deleteSelectedPart = function() {
		var latestSelectedObject = this.stateKeeper.getSelectedObjects().pop();
		this.modelProcessor.deselectAllChildrenMeshes(latestSelectedObject.data());
		
		var oldTubeParts = this.tubeBuilder.getTubeParts();
		var index = this.stateKeeper.getTubePartIndex(latestSelectedObject, oldTubeParts);
		this.tubeBuilder.deleteTubePart(index);
		this.emit('deleteObjectFromScene', latestSelectedObject.data().name);
	}

	IntersectHelper.prototype.selectTubePart = function(deleteSelectedPart) {
		var raycaster = this.createRaycaster();
		var selectedObject = this.calculateSelectedObject(raycaster);

		if(selectedObject) {
			disableControls.call(this);
			
			var selectedLoaderModel = this.modelProcessor.getLoaderModelFromMesh(selectedObject, this.tubeBuilder.getTubeParts());
			var selectionResult = this.stateKeeper.changeSelectedObject(selectedLoaderModel);
			this.updateSelectedMeshes(selectionResult, selectedLoaderModel);

			if(deleteSelectedPart) {
				this.deleteSelectedPart();
			}

			this.emit('tubePartSelected', selectedLoaderModel);

		} else {
			var latestSelectedObject = this.stateKeeper.getSelectedObjects().pop();

			if(latestSelectedObject) {
				this.modelProcessor.deselectAllChildrenMeshes(latestSelectedObject.data());
			}

		}
	}

	IntersectHelper.prototype.calculateSelectedObject = function(raycaster) {
	    var objectsToCheck = this.modelProcessor.getMeshesFromObjects(this.tubeBuilder.getTubeParts());
	    var intersects = raycaster.intersectObjects(objectsToCheck);

	    if(intersects.length && intersects[0].object) {
	    	return intersects[0].object;
	    }

	    return null;
	}

	IntersectHelper.prototype.getStateKeeper = function() {
		return this.stateKeeper;
	}

	IntersectHelper.prototype.getTubeBuilder = function() {
		return this.tubeBuilder;
	}

	return IntersectHelper;

});
