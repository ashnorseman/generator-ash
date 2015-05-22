/**
 * Created by Ash.Zhang on 2015/5/20.
 */


'use strict';

var mkdirp = require('mkdirp'),
    yeoman = require('yeoman-generator');

module.exports = yeoman.generators.Base.extend({

  init: function () {
    var time = new Date();

    this.currentDate =
      [time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/');
  },

  end: function () {

    this.installDependencies({
      skipInstall: this.options['skip-install'],

      callback: function () {
        this.spawnCommand('grunt');
      }.bind(this)
    });
  },

  askFor: function () {
    var done = this.async(),
        keywords = [],
        self = this;

    function repeatPrompt(prompt, cb) {
      self.prompt(prompt, function (props) {
        if (props.keyword !== '') {
          keywords.push(props.keyword);
          repeatPrompt(prompt, cb);
        } else {
          cb();
        }
      });
    }

    this.prompt([
      {
        name: 'appname',
        message: 'App name:',
        default: this.appname
      },
      {
        name: 'version',
        message: 'Version:',
        default: '0.1.0'
      },
      {
        name: 'description',
        message: 'Description:'
      },
      {
        name: 'author',
        message: 'Author:',
        default: 'Ash Zhang'
      },
      {
        name: 'port',
        message: 'Port:',
        default: '80'
      }
    ], function (props) {
      this.appname = props.appname;
      this.version = props.version;
      this.description = props.description;
      this.author = props.author;
      this.port = props.port;

      repeatPrompt({
        name: 'keyword',
        message: 'Keywords:'
      }, function () {
        self.keywords = keywords;
        done();
      });
    }.bind(this));
  },

  projectFiles: function () {
    this.template('_package.json', 'package.json');
    this.template('readme.md');
    this.copy('gitignore', '.gitignore');
  },

  app: function () {
    mkdirp('db');
    mkdirp('public');
    mkdirp('public/dist');
    mkdirp('public/dist/css');
    mkdirp('public/dist/fonts');
    mkdirp('public/dist/images');
    mkdirp('public/dist/js');
    mkdirp('public/dist/js/lib');
    mkdirp('public/js');
    mkdirp('public/less');
    mkdirp('public/less/lib');
    mkdirp('public/less/modules');
    mkdirp('public/less/settings');
    mkdirp('public/views');
    mkdirp('test');
    mkdirp('views');
    mkdirp('views/layouts');

    this.fs.copy(this.templatePath('js/lib/backbone-min.js'), 'public/dist/js/lib/backbone-min.js');
    this.fs.copy(this.templatePath('js/lib/detect-mobile.js'), 'public/dist/js/lib/detect-mobile.js');
    this.fs.copy(this.templatePath('js/lib/jquery.min.js'), 'public/dist/js/lib/jquery.min.js');
    this.fs.copy(this.templatePath('js/lib/modernizr.custom.js'), 'public/dist/js/lib/modernizr.custom.js');
    this.fs.copy(this.templatePath('js/app.js'), 'public/js/app.js');

    this.fs.copy(this.templatePath('js/lib/underscore-min.js'), 'public/dist/js/lib/underscore-min.js');
    this.fs.copy(this.templatePath('less/lib/lesshat.less'), 'public/less/lib/lesshat.less');
    this.fs.copy(this.templatePath('less/lib/normalize.less'), 'public/less/lib/normalize.less');
    this.template(this.templatePath('less/settings/colors.less'), 'public/less/settings/colors.less');
    this.template(this.templatePath('less/settings/fonts.less'), 'public/less/settings/fonts.less');
    this.template(this.templatePath('less/settings/mixins.less'), 'public/less/settings/mixins.less');
    this.template(this.templatePath('less/settings/variables.less'), 'public/less/settings/variables.less');
    this.template(this.templatePath('less/modules/grid.less'), 'public/less/modules/grid.less');
    this.template(this.templatePath('less/modules/typography.less'), 'public/less/modules/typography.less');
    this.template(this.templatePath('less/base.less'), 'public/less/base.less');

    this.template(this.templatePath('views/layouts/main.hbs'), 'views/layouts/main.hbs');
    this.fs.copy(this.templatePath('views/404.hbs'), 'views/404.hbs');
    this.fs.copy(this.templatePath('views/500.hbs'), 'views/500.hbs');
    this.fs.copy(this.templatePath('views/index.hbs'), 'views/index.hbs');

    this.fs.copy(this.templatePath('karma.conf.js'), 'karma.conf.js');
    this.template(this.templatePath('server'), 'server.js');
  },

  grunt: function () {
    var uglifyFileName = 'public/dist/js/' + this.appname.toLowerCase() + '.min.js',
        lessFileName = 'public/dist/css/' + this.appname.toLowerCase() + '.min.css',
        uglify = {
          out: {
            options: {
              preserveComments: false
            },
            files: {}
          }
        },
        less = {
          options: {
            compress: true
          },
          out: {
            files: {}
          }
        },
        karma = {
          unit: {
            configFile: 'karma.conf.js',
            background: true
          }
        },
        watch = {
          css: {
            files: ['public/less/**/*'],
            tasks: ['less']
          },
          karma: {
            files: ['public/js/**/*.js', 'test/**/*.js'],
            tasks: ['karma:unit:run']
          }
        };

    uglify.out.files[uglifyFileName] = [
      'public/js/app.js',
      'public/js/modules/*.js'
    ];
    less.out.files[lessFileName] = ['public/less/base.less'];

    this.gruntfile.insertConfig('uglify', JSON.stringify(uglify));
    this.gruntfile.insertConfig('less', JSON.stringify(less));
    this.gruntfile.insertConfig('karma', JSON.stringify(karma));
    this.gruntfile.insertConfig('watch', JSON.stringify(watch));

    this.gruntfile.loadNpmTasks([
      'grunt-contrib-less',
      'grunt-contrib-uglify',
      'grunt-contrib-watch',
      'grunt-karma'
    ]);

    this.gruntfile.registerTask('default', ['less', 'uglify', 'karma', 'watch']);
  }
});

