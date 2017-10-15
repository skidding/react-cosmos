// @flow

import path from 'path';
import getCosmosConfig from '../../';

jest.mock('yargs', () => ({ argv: { config: 'cozmos.config' } }));

const mocksPath = path.join(__dirname, '__fsmocks__');

beforeEach(() => {
  global.process.cwd = () => mocksPath;
});

describe('when no config exists', () => {
  it('gets extended server defaults', () => {
    const config = getCosmosConfig();
    expect(config).toMatchObject({
      globalImports: [path.join(mocksPath, 'some-polyfill')],
      hostname: '127.0.0.1',
      port: 9000,
      publicUrl: '/loader/',
      hot: true
    });
  });

  it('gets default proxies path', () => {
    const config = getCosmosConfig();
    expect(config.proxiesPath).toBe(path.join(mocksPath, 'cosmos.proxies'));
  });

  it('gets default webpack config path', () => {
    const config = getCosmosConfig();
    expect(config.webpackConfigPath).toBe(
      path.join(mocksPath, 'webpack.config')
    );
  });

  it('gets default output path', () => {
    const config = getCosmosConfig();
    expect(config.outputPath).toBe(path.join(mocksPath, 'cosmos-export'));
  });
});
