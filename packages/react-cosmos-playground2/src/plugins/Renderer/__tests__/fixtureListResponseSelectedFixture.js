// @flow

import { wait } from 'react-testing-library';
import { resetPlugins, registerPlugin, loadPlugins } from 'react-plugin';
import { callOnInit } from '../../../testHelpers/plugin';
import {
  mockFixtureState,
  getFxListRes,
  getRendererState
} from '../testHelpers';
import { register } from '..';

afterEach(resetPlugins);

it('posts "selectFixture" renderer request', async () => {
  const handleRendererRequest = jest.fn();

  loadTestPlugins(null, () => {
    const { on } = registerPlugin({ name: 'test' });
    on('renderer.request', handleRendererRequest);
    callOnInit('renderer.receiveResponse', getFxListRes('foo-renderer'));
  });

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
  const initialRendererState = {
    primaryRendererId: 'foo-renderer',
    renderers: {
      'foo-renderer': getRendererState({
        fixtureState: mockFixtureState
      })
    }
  };
  const handleRendererRequest = jest.fn();

  loadTestPlugins(initialRendererState, () => {
    const { on } = registerPlugin({ name: 'test' });
    on('renderer.request', handleRendererRequest);
    callOnInit('renderer.receiveResponse', getFxListRes('bar-renderer'));
  });

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

function loadTestPlugins(initialState, extraSetup = () => {}) {
  register();
  registerPlugin({ name: 'router', initialState: { urlParams: {} } });
  extraSetup();
  loadPlugins({
    state: {
      router: { urlParams: { fixturePath: 'fixtures/zwei.js' } },
      renderer: initialState
    }
  });
}
