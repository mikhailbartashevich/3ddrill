define(['colladaModelLoader', 'jQuery', 'eventEmitter', 'linkedlist'], function(ColladaModelLoader, jQuery) {

	function TubeBuilder(tubeBuilderSettings) {
		this.colladaModelLoader = null;
		this.tubeParts = new LinkedList();
        this.loadedModels = {
        };

        this.heightsMap = {
            basic : 5.6
        };

        this.initialTubePosition = tubeBuilderSettings.initialTubePosition || { x : 0, y : 20, z : 0 };
        this.partsSequence = tubeBuilderSettings.partsSequence || [];
	}

	TubeBuilder.prototype.createTubePart = function(tubePartIn, previousTubePart, positionY) {
        var tubePart = tubePartIn.clone();
        tubePart.isColladaModel = true;
        tubePart.modelType = tubePartIn.modelType;

        tubePart.position.y = this.initialTubePosition.y; //TODO initial position of the tube
        tubePart.position.x = this.initialTubePosition.x;
        tubePart.position.z = this.initialTubePosition.z;

        tubePart.name = tubePart.uuid;

        if(previousTubePart) {
            tubePart.position.y = previousTubePart.position.y - this.heightsMap[tubePartIn.modelType]; //TODO height of the tube part
        }

        if(positionY) {
            tubePart.position.y = positionY; //TODO height of the tube part
        }
        
        tubePart.position.z = 0;
        return tubePart;
    }

    function onModelsLoad(models) {
        
        models.forEach(function(loadedModel) {
            this.loadedModels[loadedModel.modelType] = loadedModel;
        }.bind(this));

	    this.createTube();
        this.emit('tubeCreated');
    }

    jQuery.extend(TubeBuilder.prototype, jQuery.EventEmitter);

    TubeBuilder.prototype.createTube = function() {
        this.partsSequence.forEach(function(tubePartInSequence) {
            var previousPart = this.tubeParts.getLast();
            var modelToApply = this.loadedModels[tubePartInSequence.modelType];
            var tubePart = this.createTubePart(modelToApply, previousPart ? previousPart.data() : null);
            this.tubeParts.push(tubePart);
        }.bind(this));
    }

    TubeBuilder.prototype.buildTubeModel = function() {
    	this.colladaModelLoader = new ColladaModelLoader();
    	this.colladaModelLoader.loadModels(onModelsLoad.bind(this));
    }

    TubeBuilder.prototype.deleteTubePart = function(index) {
        var oldNode = this.tubeParts.get(index);
        this.tubeParts.remove(oldNode);

        this.updateOldPartsPosition(index, true);

        this.emit('tubeUpdated', oldNode.data().name);
    }

    TubeBuilder.prototype.insertNewTubePart = function(index, rolloverMesh) {
        var oldNode = this.tubeParts.get(index);
        var oldNodeBefore = null, positionY = null;

        if(this.tubeParts.size()) {

            if(index === 0) {
                var positionY = this.tubeParts.getFirst().data().position.y;
            } else {
                oldNodeBefore = this.tubeParts.get(index - 1).data();
            }

            this.tubeParts.insertBefore(oldNode, this.createTubePart(rolloverMesh, oldNodeBefore, positionY) );
            this.updateOldPartsPosition(index);
        } else {
            this.tubeParts.push(this.createTubePart(rolloverMesh, oldNodeBefore, this.initialTubePosition.y));
        }

        this.emit('tubeUpdated');
    }

    TubeBuilder.prototype.updateOldPartsPosition = function(index, up) {
        var i = 0;
        this.tubeParts.each(function(element) {
            var model = element.data();

            var newYposition = model.position.y;

            if(up && i >= index) {
                newYposition = model.position.y + this.heightsMap[model.modelType];
            } else if(i > index) {
                newYposition = model.position.y - this.heightsMap[model.modelType]; //down
            }

            model.position.y = newYposition;

            i++;
        }.bind(this));
    }

    TubeBuilder.prototype.moveTube = function(down) {

        this.tubeParts.each(function(element) {
            var model = element.data();

            var newYposition = model.position.y + this.heightsMap[model.modelType];

            if(down) {
                newYposition = model.position.y - this.heightsMap[model.modelType];
            }

            model.position.y = newYposition;

        }.bind(this));
    }

    TubeBuilder.prototype.createRolloverMesh = function(partType) {
        var rolloverMesh = this.loadedModels[partType].clone();
        rolloverMesh.modelType = partType;
        return rolloverMesh;
    }

    TubeBuilder.prototype.getTubeParts = function() {
        return this.tubeParts;
    }

	return TubeBuilder;
})

