(function() {
  var ElmCompiler, elmCompile, childProcess, path;

  childProcess = require('child_process');

  path = require('path');

  module.exports = ElmCompiler = (function() {
    ElmCompiler.prototype.brunchPlugin = true;

    ElmCompiler.prototype.type = 'javascript';

    ElmCompiler.prototype.extension = 'elm';

    function ElmCompiler(config) {
      var elm_config = {};
      elm_config.outputFolder = (config.plugins.elmBrunch || {}).outputFolder || path.join(config.paths.public, 'js');
      elm_config.mainModules = (config.plugins.elmBrunch || {}).mainModules;
      elm_config.elmFolder = (config.plugins.elmBrunch || {}).elmFolder || null;
      this.elm_config = elm_config;
    }

    ElmCompiler.prototype.compile = function(data, file, callback) {
      callback(null, null);
    };

    ElmCompiler.prototype.onCompile = function(files) {
      var elmFolder = this.elm_config.elmFolder;
      var modules = this.elm_config.mainModules;
      var outputFolder = this.elm_config.outputFolder;

      modules.forEach(function(src) {
        var moduleName = path.basename(src, '.elm').toLowerCase();
        return elmCompile(src, elmFolder, path.join(outputFolder, moduleName + '.js'));
      });
    };

    return ElmCompiler;

  })();

  elmCompile = function(srcFile, elmFolder, outputFile, callback) {
    var info = 'Elm compile: ' + srcFile;
    if (elmFolder) {
      info += ', in ' + elmFolder;
    }
    info += ', to ' + outputFile;
    console.log(info);

    childProcess.exec('elm make --yes --output ' + outputFile + ' ' + srcFile, {cwd: elmFolder}, function (error, stdout, stderr) {
      if (callback) {
        callback(error, error ? stderr : null);
      }
    });
  };

}).call(this);
