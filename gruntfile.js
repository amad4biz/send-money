module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
      mochaTest: {
        test: {
          options: {
            reporter: 'spec'
          },
          src: ['tests/specs.js']
        }
      }
    });

    grunt.registerTask('default', 'mochaTest');

};