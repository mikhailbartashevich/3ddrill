requirejs.config({

    // baseUrl : 'js',

    paths: {
        jQuery :            '../bower_components/jquery/dist/jquery',
        threejs:            '../bower_components/threejs/build/three',
        trackballControls : '../bower_components/threejs/examples/js/controls/TrackballControls',
        colladaLoader :     '../bower_components/threejs/examples/js/loaders/ColladaLoader',
        linkedlist :        '../bower_components/linkedlist.js/LinkedList'
    },

    shim: {
        'trackballControls': {
            deps: ['threejs']
        },

        'colladaLoader': {
            deps: ['threejs']
        },

        jQuery : {
            exports : '$'
        }
    }

});


require(['jQuery', 'application'], function($, DrillApp) {


    $(document).ready(function() {
        new DrillApp({

            colors : {
                highLightColor : 0xFFCC99,
                selectionColor : 0x0CFFFA
            },

            cameraPosition : {
                x : 0,
                y : 0,
                z : 50 
            },

            tubeSettings : {
                initialTubePosition : {
                    x : 0, 
                    y : 15,
                    z : 0
                },

                partsSequence : [ { modelType : 'basic'}, { modelType : 'basic'}, { modelType : 'basic'}, { modelType : 'basic'}, { modelType : 'basic'}, { modelType : 'basic'}, { modelType : 'basic'}]
            }
            
        }).init();
    });

});