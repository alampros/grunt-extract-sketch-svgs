module.exports = function (grunt) {
  const config = {
    clean: {
      build: 'build/*',
    },
    'extract-sketch': {
      main: {
        files: [{
          src: 'src/icons.sketch',
          dest: 'build',
        }],
      }
    },
  }
  grunt.loadTasks('tasks')
  grunt.loadNpmTasks('grunt-contrib-clean')

  grunt.registerTask('default', ['clean', 'extract-sketch'])
  
  grunt.initConfig(config)
}
