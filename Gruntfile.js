module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    "jsbeautifier": {
      files: [
        'source/modules/*.js',
      ],

      options: {
        js: {
          "braceStyle": "end-expand",
          "indentChar": " ",
          "indentLevel": 0,
          "indentSize": 2,
          "indentWithTabs": false,
          "jslintHappy": true,
          "keepArrayIndentation": true,
          "keepFunctionIndentation": false,
          "maxPreserveNewlines": 10,
          "preserveNewlines": true,
          "spaceBeforeConditional": true,
          "spaceInParen": false,
          "unescapeStrings": false,
          "wrapLineLength": 0
        }
      }
    },

    concat: {
      dist: {
        src: [
          'source/intro.js',
          'source/modules/*.js',
          'source/end.js'
        ],
        dest: 'ParticlesEngine.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'ParticlesEngine.min.js': ['ParticlesEngine.js']
        }
      }
    },

    watch: {
      scripts: {
        files: ['source/*.js', 'source/modules/*.js'],
        tasks: ['concat', 'uglify'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-jsbeautifier");

  grunt.registerTask('default', ['jsbeautifier', 'concat', 'uglify', ]);

};