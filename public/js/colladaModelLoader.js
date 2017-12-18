define(['colladaLoader', 'jQuery', 'eventEmitter'], function(ColladaLoader, jQuery) {

    function ColladaModelLoader() {
        this.models = [];
    }

    jQuery.extend(ColladaModelLoader.prototype, jQuery.EventEmitter);

    ColladaModelLoader.prototype.loadModels = function(callback) {

        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;

        loader.load( 'models/collada/parts/bha-2.dae', function (collada) {
            var model = collada.scene;
            model.modelType = 'basic';
            this.models.push(model);
            callback(this.models);
        }.bind(this));

    }

    ColladaModelLoader.prototype.getModels = function() {
        return this.models;
    }

    return ColladaModelLoader;

});

