define(['threejs', 'linkedlist'], function() {

	function StateKeeper() {

		this.selectedTubeParts = new LinkedList();
		this.hoveredTubeParts = new LinkedList();

		this.draggableOffset = new THREE.Vector3(); //for draggable rollover meshes
		this.rollOverMesh = null;
	}

	StateKeeper.prototype.getTubePartIndex = function(object, objects) {
		var index = 0, result = -1;

		if(object && object.data()) {

			objects.each(function(element) {
				
				if(element && element.data() && element.data().uuid === object.data().uuid) {
					result = index;
				}

				index++;
			});
			
		}

		return result;
	}

	StateKeeper.prototype.isFirstTubePart = function(object, objects) {
		return this.getTubePartIndex(object, objects) === 0;
	}

	StateKeeper.prototype.addHoveredObject = function(hoveredObject) {
		this.hoveredTubeParts.push(hoveredObject);
	}

	StateKeeper.prototype.clearHoveredObjects = function() {
		this.hoveredTubeParts.removeAll();
	}

	StateKeeper.prototype.getHoveredObjects = function() {
		return this.hoveredTubeParts;
	}

	StateKeeper.prototype.addSelectedObject = function(selectedObject) {
		this.selectedTubeParts.push(selectedObject);
	}

	StateKeeper.prototype.getSelectedObjects = function() {
		return this.selectedTubeParts;
	}

	StateKeeper.prototype.changeSelectedObject = function(selectedObject) {
		var previouslySelectedObject = this.selectedTubeParts.pop();
		this.selectedTubeParts.push(selectedObject);

		var sameObjects = false;
		var previouslySelected  = null;

		if(previouslySelectedObject) {
			sameObjects = previouslySelectedObject.data().uuid === selectedObject.uuid;
			previouslySelected = previouslySelectedObject.data();
		}

		return {previouslySelected : previouslySelected, sameObjects : sameObjects};
	}

	StateKeeper.prototype.changeRolloverMeshPosition = function(firstPlaneIntersect) {
		if(this.rollOverMesh) {
			this.rollOverMesh.position.copy( firstPlaneIntersect.point.sub( this.draggableOffset ) );

		    if(this.rollOverMesh.position.x < 2 && this.rollOverMesh.position.x > -2) { //TODO tube borders -2 |tube| 2
		        this.rollOverMesh.position.z = 10; //TODO zoom rollover mesh
		    }
		}
	}

	StateKeeper.prototype.setRolloverMesh = function(rollOverMesh) {
		return this.rollOverMesh = rollOverMesh;
	}

	StateKeeper.prototype.getRolloverMesh = function() {
		return this.rollOverMesh;
	}

	StateKeeper.prototype.deleteRolloverMesh = function() {
		this.rollOverMesh = null;
	}

	StateKeeper.prototype.changeDraggableOffset = function(point, position) {
		return this.draggableOffset.copy(point).sub(position);
	}

	StateKeeper.prototype.isSelected = function(object) {

		var existingObject = this.selectedTubeParts.find(function(element) {

			if(element && element.data() && object) {
				return element.data().name === object.name;
			}

			return false;
		});

		var selected = existingObject ? true : false;

		return selected;
	}
	return StateKeeper;

});







