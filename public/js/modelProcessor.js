define(['linkedlist'], function() {


    function ColladaModelProcessor() {

    }

    ColladaModelProcessor.prototype.getLoaderModelFromMesh = function(selectedObject, objects) {
        
        if(selectedObject.modelIndex || selectedObject.modelIndex === 0) {
           return objects.get(selectedObject.modelIndex - 1).data();
        }

        return selectedObject;
        
    }

    ColladaModelProcessor.prototype.getMeshesFromObjects = function(objects) { //collada scenes
        var objectsToCheck = [], index = 0, that = this;

        if(objects) {
            objects.each(function(element) {
                index++;

                if(element.data() && element.data().isColladaModel) {
                    if(element.data().children) {

                        element.data().children.forEach(function(threeDObject, index3d, array) {
                            var deepestChildren = that.getAllTheDeepestChildren(threeDObject, [], index);
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

    ColladaModelProcessor.prototype.getAllTheDeepestChildren = function(threeDObject, arrayToReturn, modelIndex) {

        if(!threeDObject.children || threeDObject.children.length === 0) {
            threeDObject.modelIndex = modelIndex;
            arrayToReturn.push(threeDObject);
            return arrayToReturn;
        }

        threeDObject.children.forEach(function(element) {
            this.getAllTheDeepestChildren(element, arrayToReturn, modelIndex);
        }.bind(this));

        return arrayToReturn;

    }

    ColladaModelProcessor.prototype.deselectAllChildrenMeshes = function(selectedScene) {
        if(selectedScene) {
            this.selectAllChildrenMeshes(selectedScene, null);
        }
    }

    ColladaModelProcessor.prototype.selectAllChildrenMeshes = function(selectedScene, material) {

        if(selectedScene && selectedScene.children && selectedScene.children.length) {

            selectedScene.children.forEach(function(threeDObject, index3d, array) {
                if(threeDObject.children.length == 1) {
                    if(material) {
                        
                        if(!threeDObject.children[0].material.temporary) {
                            threeDObject.children[0].previousMaterial = threeDObject.children[0].material;
                        }

                        threeDObject.children[0].material = material;
                    } else {
                        threeDObject.children[0].material = threeDObject.children[0].previousMaterial;
                    }
                }
            });

        }

    }

    ColladaModelProcessor.prototype.highLightAllChildrenMeshesInList = function(listOfObjects, material) {
        listOfObjects.each(function(objectInList) {
            this.selectAllChildrenMeshes(objectInList.data(), material);
        }.bind(this));
    }

    ColladaModelProcessor.prototype.unHighLightAllChildrenMeshesInList = function(listOfObjects) {
        this.highLightAllChildrenMeshesInList(listOfObjects, null);
    }

    return ColladaModelProcessor;

});

    