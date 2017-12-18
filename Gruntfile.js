var path = require('path');

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        dest: {
            path: 'prod/public',
            images: '<%= dest.path %>/images',
            templates: '<%= dest.path %>/templates',
            models: '<%= dest.path %>/models/collada/parts',
            js: '<%= dest.path %>/scripts'
        },

        requirejs: {

            options: {
                mainConfigFile: 'public/js/main.js',
                uglify2: {
                    mangle: false
                },
                optimize: 'uglify2',
                baseUrl : 'public/js',
                include: ['main.js'],
                out: '<%= dest.path %>/scripts/main.min.js'
            },

            prod: {
                optimize: 'uglify2'
            }

        },

        copy: {

            models: {
                expand:true, cwd: 'public/models/collada/parts', src: '**', dest: '<%= dest.models %>', filter: 'isFile'
            },

            index: {
                src: 'public/index/index.html', dest: '<%= dest.path %>/index.html'
            },

            styles: {
                src: 'public/styles/main.css', dest: '<%= dest.path %>/styles/main.css'
            },

            requirejs : {
                src: 'public/bower_components/requirejs/require.js', dest: '<%= dest.path %>/scripts/vendor/require.js'
            },

            server : {
                src: 'server.js', dest: 'prod/server.js'
            }

        },

        clean: {
            dest: ['<%= dest.path %>'],
            tmp: ['.tmp', 'prod'],
            deploy: ['deploy/<%= dest.path %>', 'deploy/server']
        },

        // jshint: {
        //     options: {
        //         jshintrc : true,
        //         reporter: require('jshint-stylish')
        //     },

        //     files: ['app/scripts/**/*.js', '!**/tests/**', '!**/templates/**']
        // }

    });


    grunt.registerTask('build', 'Compile all sources', function (target) {
        grunt.task.run([
            'clean',
            'requirejs:prod',
            'copy'
        ]);
    });

};