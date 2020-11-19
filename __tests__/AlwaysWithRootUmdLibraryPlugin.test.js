const AlwaysWithRootUmdLibraryPlugin = require('../lib/AlwaysWithRootUmdLibraryPlugin');
const UmdLibraryPlugin = require('webpack/lib/library/UmdLibraryPlugin');
const webpack = require('webpack');
const {OriginalSource, ReplaceSource} = require('webpack-sources');
const EnableLibraryPlugin = require('webpack/lib/library/EnableLibraryPlugin');

jest.mock('webpack/lib/library/EnableLibraryPlugin', () => {
  return jest.fn().mockImplementation(() => {
    return {apply: jest.fn()};
  });
});

const getOriginalSource = () => new OriginalSource('...;\n\telse\n\t\troot[...');
describe('AlwaysWithRootUmdLibraryPlugin test suite', () => {
  let plugin;
  beforeEach(() => {
    plugin = new AlwaysWithRootUmdLibraryPlugin();
  });
  afterEach(() => {
    plugin = undefined;
    jest.resetAllMocks();
  });

  it('should create new instance of CustomLibraryWebpackPlugin', () => {
    expect(plugin).toBeInstanceOf(AlwaysWithRootUmdLibraryPlugin);
    expect(plugin).toBeInstanceOf(UmdLibraryPlugin);
  });

  it('should find and return correct position in source', () => {
    expect(plugin.find(getOriginalSource())).toEqual({start: 3, end: 17});
  });

  it('should replace found string in source', () => {
    expect(plugin.findAndReplace(new ReplaceSource(getOriginalSource())).source()).toEqual('...;\n\n\troot[...');
  });

  it('should enable custom library', () => {
    EnableLibraryPlugin.setEnabled = jest.fn();
    const compiler = webpack({});
    plugin.apply(compiler);
    expect(EnableLibraryPlugin.setEnabled).toHaveBeenCalledWith(compiler, 'umd');
    expect(EnableLibraryPlugin.setEnabled).toHaveBeenCalledWith(compiler, 'umd2');
  });

  it('should render with replacement', async (done) => {
    jest.unmock('webpack/lib/library/EnableLibraryPlugin');
    const compiler = webpack({mode: 'development', output: {library: {type: 'umd'}}, plugins: [plugin]});
    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBeFalsy();
      done();
    });
  });
});
