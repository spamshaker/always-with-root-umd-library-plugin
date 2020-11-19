const UmdLibraryPlugin = require('webpack/lib/library/UmdLibraryPlugin');
const EnableLibraryPlugin = require('webpack/lib/library/EnableLibraryPlugin');
const {ReplaceSource} = require('webpack-sources');

class AlwaysWithRootUmdLibraryPlugin extends UmdLibraryPlugin {
  REPLACEMENT = ';\n\n\troot[';
  TO_REPLACE = ';\n\telse\n\t\troot[';

  constructor({optionalAmdExternalAsGlobal, type = 'umd'} = {}) {
    super({optionalAmdExternalAsGlobal, type});
  }

  apply(compiler) {
    EnableLibraryPlugin.setEnabled(compiler, 'umd');
    EnableLibraryPlugin.setEnabled(compiler, 'umd2');
    let {options} = compiler;
    if (!options) options = compiler.options = {};
    let {output} = options;
    if (!output) output = options.output = {};
    let {library} = output;
    if (!library) library = output.library = {};
    if (!library.type) {
      library.type = 'umd';
    }
    super.apply(compiler);
  }

  render(source, {chunkGraph, runtimeTemplate, chunk, moduleGraph}, {options, compilation}) {
    return this.findAndReplace(
      new ReplaceSource(super.render(source, {chunkGraph, runtimeTemplate, chunk, moduleGraph}, {options, compilation}))
    );
  }

  find(source) {
    const start = source.source().indexOf(this.TO_REPLACE);
    const end = start + this.TO_REPLACE.length - 1;
    return {start, end};
  }

  findAndReplace(source) {
    const {start, end} = this.find(source);
    source.replace(start, end, this.REPLACEMENT, 'root without else');
    return source;
  }
}

module.exports = AlwaysWithRootUmdLibraryPlugin;
