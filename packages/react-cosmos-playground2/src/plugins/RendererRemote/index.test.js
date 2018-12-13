// @flow

import { wait } from 'react-testing-library';
import { loadPlugins } from 'react-plugin';
import { mockWebSockets } from '../../testHelpers/mockWebSockets';
import { cleanup, mockMethod, mockInitEmit } from '../../testHelpers/plugin';
import { register } from '.';

afterEach(cleanup);

function registerTestPlugins({ handlePostRequest = () => {} } = {}) {
  register();
  mockMethod('renderer.postRequest', handlePostRequest);
}

function loadTestPlugins() {
  loadPlugins({ config: { renderer: { enableRemote: true } } });
}

it('posts renderer request message via websockets', async () => {
  registerTestPlugins();

  const selectFixtureMsg = {
    type: 'selectFixture',
    payload: {
      rendererId: 'foo-renderer',
      fixturePath: 'bar-fixturePath'
    }
  };
  mockInitEmit('renderer.request', selectFixtureMsg);

  loadTestPlugins();

  await mockWebSockets(async ({ onMessage }) => {
    await wait(() => expect(onMessage).toBeCalledWith(selectFixtureMsg));
  });
});

it('broadcasts renderer response message from websocket event', async () => {
  registerTestPlugins();

  const handleReceiveResponse = jest.fn();
  mockMethod('renderer.receiveResponse', handleReceiveResponse);

  loadTestPlugins();

  await mockWebSockets(async ({ postMessage }) => {
    const fixtureListMsg = {
      type: 'fixtureList',
      payload: {
        rendererId: 'foo-renderer',
        fixtures: ['fixtures/ein.js', 'fixtures/zwei.js', 'fixtures/drei.js']
      }
    };
    postMessage(fixtureListMsg);

    await wait(() =>
      expect(handleReceiveResponse).toBeCalledWith(
        expect.any(Object),
        fixtureListMsg
      )
    );
  });
});

it('posts "requestFixtureList" renderer request on mount', async () => {
  const handlePostRequest = jest.fn();
  registerTestPlugins({ handlePostRequest });

  loadTestPlugins();

  await wait(() =>
    expect(handlePostRequest).toBeCalledWith(expect.any(Object), {
      type: 'requestFixtureList'
    })
  );
});
