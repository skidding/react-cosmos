// @flow

import { wait } from 'react-testing-library';
import { resetPlugins, registerPlugin, loadPlugins } from 'react-plugin';
import { mockFixtures, mockFixtureState } from '../testHelpers';
import { register } from '..';

afterEach(resetPlugins);

const initialRendererState = {
  primaryRendererId: 'foo-renderer',
  renderers: {
    'foo-renderer': {
      fixtures: mockFixtures,
      fixtureState: null
    },
    'bar-renderer': {
      fixtures: mockFixtures,
      fixtureState: null
    }
  }
};

it('sets fixture state for all renderers', async () => {
  let rendererState;

  loadTestPlugins(() => {
    const { init, onState } = registerPlugin({ name: 'test' });
    onState(({ getStateOf }) => {
      rendererState = getStateOf('renderer');
    });
    init(({ callMethod }) => {
      callMethod('renderer.setFixtureState', mockFixtureState);
    });
  });

  await wait(() =>
    expect(rendererState).toEqual({
      primaryRendererId: 'foo-renderer',
      renderers: {
        'foo-renderer': expect.objectContaining({
          fixtureState: mockFixtureState
        }),
        'bar-renderer': expect.objectContaining({
          fixtureState: mockFixtureState
        })
      }
    })
  );
});

it('posts "setFixtureState" renderer requests', async () => {
  const handleRendererRequest = jest.fn();

  loadTestPlugins(() => {
    const { init, on } = registerPlugin({ name: 'test' });
    on('renderer.request', handleRendererRequest);
    init(({ callMethod }) => {
      callMethod('renderer.setFixtureState', mockFixtureState);
    });
  });

  await wait(() =>
    expect(handleRendererRequest).toBeCalledWith(expect.any(Object), {
      type: 'setFixtureState',
      payload: {
        rendererId: 'foo-renderer',
        fixturePath: 'fixtures/zwei.js',
        fixtureState: mockFixtureState
      }
    })
  );

  await wait(() =>
    expect(handleRendererRequest).toBeCalledWith(expect.any(Object), {
      type: 'setFixtureState',
      payload: {
        rendererId: 'bar-renderer',
        fixturePath: 'fixtures/zwei.js',
        fixtureState: mockFixtureState
      }
    })
  );
});

function loadTestPlugins(extraSetup = () => {}) {
  register();
  registerPlugin({ name: 'router', initialState: { urlParams: {} } });
  extraSetup();
  loadPlugins({
    state: {
      router: { urlParams: { fixturePath: 'fixtures/zwei.js' } },
      renderer: initialRendererState
    }
  });
}
