module.exports = function(grunt) {

   
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

	concat: {   
		dist: {
		src: [
			'source/intro.js',
			'source/options.js', 
			'source/preInit.js', 
			'source/init.js', 
			'source/helpers.js', 
			'source/fading.js', 
			'source/particle.js', 
			'source/emitters.js',
			'source/background.js',  
			'source/fps.js',  
			'source/end.js' 
		   
		],
		dest: 'ParticlesEngine.js',
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
			files: ['source/*.js'],
			tasks: ['concat', 'uglify'],
			options: {
				spawn: false,
			},
		} 
	}

    });

   
    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify')
	grunt.loadNpmTasks('grunt-contrib-watch');

  
    grunt.registerTask('default', ['concat', 'uglify']);

};