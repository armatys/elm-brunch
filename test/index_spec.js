var chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , expect = chai.expect;

chai.use(sinonChai);

var ElmCompiler = require('../index')
  , exec;

describe('ElmCompiler', function (){
  var elmCompiler, baseConfig = {
        paths: {
          public: 'test/public/folder'
        },
        plugins: {
          elmBrunch: {}
        }
      };

  describe('plugin', function () {
    beforeEach(function () {
      elmCompiler = new ElmCompiler(baseConfig);
    });

    it('is an object', function () {
      expect(elmCompiler).to.be.ok;
    });

    it('has a #compile method', function () {
      expect(elmCompiler.compile).to.be.an.instanceof(Function);
    });
  });

  describe('elm config', function () {
    describe('outputFolder', function () {
      describe('when an outputFolder is not specified', function () {
        beforeEach(function () {
          elmCompiler = new ElmCompiler(baseConfig);
        });

        it('defaults to the public js folder', function () {
          expect(elmCompiler.elm_config.outputFolder).to.equal('test/public/folder/js');
        });
      });

      describe('when an outputFolder is specified', function () {
        beforeEach(function () {
          config = JSON.parse(JSON.stringify(baseConfig));
          config.plugins.elmBrunch.outputFolder = 'test/output/folder'
          elmCompiler = new ElmCompiler(config);
        });

        it('uses the specified outputFolder', function () {
          expect(elmCompiler.elm_config.outputFolder).to.equal('test/output/folder');
        });
      });
    });

    describe('mainModules', function () {
      describe('when no mainModules are specified', function () {
        beforeEach(function () {
          elmCompiler = new ElmCompiler(baseConfig);
        });

        it('is undefined', function () {
          expect(elmCompiler.elm_config.mainModules).to.be.undefined;
        });
      });

      describe('when one mainModule is specified', function () {
        beforeEach(function () {
          config = JSON.parse(JSON.stringify(baseConfig));
          config.plugins.elmBrunch.mainModules = ['Test.elm']
          elmCompiler = new ElmCompiler(config);
        });

        it('provides the specified mainModule', function () {
          expect(elmCompiler.elm_config.mainModules.length).to.equal(1);
          expect(elmCompiler.elm_config.mainModules).to.include('Test.elm');
        });
      });

      describe('when more than one mainModule is specified', function () {
        beforeEach(function () {
          config = JSON.parse(JSON.stringify(baseConfig));
          config.plugins.elmBrunch.mainModules = ['Test1.elm', 'Test2.elm']
          elmCompiler = new ElmCompiler(config);
        });

        it('provides the specified mainModule', function () {
          expect(elmCompiler.elm_config.mainModules.length).to.equal(2);
          expect(elmCompiler.elm_config.mainModules).to.include('Test1.elm');
          expect(elmCompiler.elm_config.mainModules).to.include('Test2.elm');
        });
      });
    });

    describe('elmFolder', function () {
      describe('when an elmFolder is not specified', function () {
        beforeEach(function () {
          elmCompiler = new ElmCompiler(baseConfig);
        });

        it('defaults to null', function () {
          expect(elmCompiler.elm_config.elmFolder).to.be.null;
        });
      });

      describe('when an elmFolder is specified', function () {
        beforeEach(function () {
          config = JSON.parse(JSON.stringify(baseConfig));
          config.plugins.elmBrunch.elmFolder = 'test/elm/folder'
          elmCompiler = new ElmCompiler(config);
        });

        it('uses the specified elmFolder', function () {
          expect(elmCompiler.elm_config.elmFolder).to.equal('test/elm/folder');
        });
      });
    });
  });

  describe('compiling Elm', function () {
    var childProcess = require('child_process')
      , sampleConfig;

    beforeEach(function () {
      exec = sinon.stub(childProcess, 'exec');

      sampleConfig = JSON.parse(JSON.stringify(baseConfig));
      sampleConfig.plugins.elmBrunch.outputFolder = 'test/output/folder';
      sampleConfig.plugins.elmBrunch.mainModules = ['Test.elm'];
    });

    afterEach(function () {
      exec.restore();
    });

    describe('when an elm folder has not been given', function () {
      beforeEach(function () {
        config = JSON.parse(JSON.stringify(sampleConfig));
        elmCompiler = new ElmCompiler(config);
      });

      it('shells out to the `elm make` command with a null cwd', function () {
        var content = '';
        elmCompiler.compile(content, 'File.elm', function(error) {
          expect(error).to.not.be.ok;
        });
        expected = 'elm make --yes --output test/output/folder/test.js Test.elm';
        expect(childProcess.exec).to.have.been.calledWith(expected, {cwd: null});
      });
    });

    describe('when an elm folder has been given', function () {
      beforeEach(function () {
        config = JSON.parse(JSON.stringify(sampleConfig));
        config.plugins.elmBrunch.elmFolder = 'test/elm/folder';
        elmCompiler = new ElmCompiler(config);
      });

      it('shells out to the `elm make` command with the specified elm folder as the cwd', function () {
        var content = '';
        elmCompiler.compile(content, 'File.elm', function(error) {
          expect(error).to.not.be.ok;
        });
        expected = 'elm make --yes --output test/output/folder/test.js Test.elm';
        expect(childProcess.exec).to.have.been.calledWith(expected, {cwd: 'test/elm/folder'});
      });
    });
  });
});
