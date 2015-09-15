var istanbul = require('browserify-istanbul');

module.exports = function(config) {
    config.set({
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'mocha'],

        client: {
            captureConsole: true
        },

        // list of files / patterns to load in the browser
        files: [
          'test/**/*.spec.js'
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/**/*.spec.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: [
                'babelify',
                'brfs',
                istanbul({
                    ignore: ['**/node_modules/**', '**/test/**']
                })
            ]
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'coverage'],

        coverageReporter: {
            instrumenters: {isparta: require('isparta')},
            instrumenter: {
                'src/*.js': 'isparta'
            },
            reporters: [{
                type: 'lcov',
                dir: 'coverage/',
                subdir: '.'
            }, {
                type: 'html',
                dir: 'coverage/html'
            }]
        },


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        plugins: [
            'karma-mocha',
            'karma-browserify',
            'karma-phantomjs-launcher',
            'karma-coverage',
            'karma-mocha-reporter'
        ]
    })
};
