// @flow

import { wait } from 'react-testing-library';
import { loadPlugins } from 'react-plugin';
import {
  cleanup,
  mockState,
  mockEvent,
  mockCall
} from '../../../testHelpers/plugin';
import {
  mockFixtureState,
  getReadyRes,
  getRendererState
} from '../testHelpers';
import { register } from '..';

afterEach(cleanup);

function registerTestPlugins({ handleRendererRequest }) {
  register();
  mockState('router', { urlParams: { fixturePath: 'fixtures/zwei.js' } });
  mockEvent('renderer.request', handleRendererRequest);
}

function loadTestPlugins({ rendererState = null } = {}) {
  loadPlugins({ state: { renderer: rendererState } });
}

it('posts "selectFixture" renderer request', async () => {
  const handleRendererRequest = jest.fn();
  registerTestPlugins({ handleRendererRequest });
  loadTestPlugins();

  mockCall('renderer.receiveResponse', getReadyRes('foo-renderer'));

  await wait(() =>
    expect(handleRendererRequest).toBeCalledWith(expect.any(Object), {
      type: 'selectFixture',
      payload: {
        rendererId: 'foo-renderer',
        fixturePath: 'fixtures/zwei.js',
        fixtureState: null
      }
    })
  );
});

it('posts "selectFixture" renderer request with fixture state of primary renderer', async () => {
  const handleRendererRequest = jest.fn();
  registerTestPlugins({ handleRendererRequest });
  loadTestPlugins({
    rendererState: {
      primaryRendererId: 'foo-renderer',
      renderers: {
        'foo-renderer': getRendererState({
          fixtureState: mockFixtureState
        })
      }
    }
  });

  mockCall('renderer.receiveResponse', getReadyRes('bar-renderer'));

  await wait(() =>
    expect(handleRendererRequest).toBeCalledWith(expect.any(Object), {
      type: 'selectFixture',
      payload: {
        rendererId: 'bar-renderer',
        fixturePath: 'fixtures/zwei.js',
        fixtureState: mockFixtureState
      }
    })
  );
});
