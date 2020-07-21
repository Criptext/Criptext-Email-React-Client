module.exports = function(grunt) {

    grunt.initConfig({
        exec: {
          install_dependencies: {
            command: 'yarn install'
          },
          compile_alice: {
            command: 'node-gyp configure build',
            options: {
                cwd: '../signal_interface'
            }
          },
          clean_old_build: {
              command: 'yarn clear-build'
          },
          package_projects: {
              command: 'yarn package'
          },
          create_build: {
              command: 'yarn release'
          }
        }
    });

    grunt.loadNpmTasks('grunt-exec');
    grunt.registerTask('default', ['exec']);
  
};