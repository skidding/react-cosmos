import { loadPlugins, resetPlugins } from 'react-plugin';
import { waitFor } from '@testing-library/dom';
import {
  SelectFixtureRequest,
  RendererReadyResponse,
} from 'react-cosmos-shared2/renderer';
import {
  mockCore,
  mockRendererCore,
  mockMessageHandler,
  getMessageHandlerContext,
  getRendererCoreContext,
} from '../../../testHelpers/pluginMocks';

beforeEach(() => jest.isolateModules(() => require('..')));

afterEach(resetPlugins);

function registerTestPlugins() {
  mockCore({
    isDevServerOn: () => true,
  });
}

it('sends renderer request to message handler', async () => {
  registerTestPlugins();
  mockRendererCore();
  const { postRendererRequest } = mockMessageHandler();

  loadPlugins();

  const selectFixtureReq: SelectFixtureRequest = {
    type: 'selectFixture',
    payload: {
      rendererId: 'mockRendererId',
      fixtureId: { path: 'mockFixturePath' },
      fixtureState: {},
    },
  };
  getRendererCoreContext().emit('request', selectFixtureReq);

  await waitFor(() =>
    expect(postRendererRequest).toBeCalledWith(
      expect.any(Object),
      selectFixtureReq
    )
  );
});

it('sends renderer response to renderer core', async () => {
  registerTestPlugins();
  mockMessageHandler();
  const { receiveResponse } = mockRendererCore();

  loadPlugins();

  const rendererReadyRes: RendererReadyResponse = {
    type: 'rendererReady',
    payload: {
      rendererId: 'mockRendererId',
      fixtures: {
        'ein.js': { type: 'single' },
        'zwei.js': { type: 'single' },
        'drei.js': { type: 'single' },
      },
    },
  };
  getMessageHandlerContext().emit('rendererResponse', rendererReadyRes);

  await waitFor(() =>
    expect(receiveResponse).toBeCalledWith(expect.any(Object), rendererReadyRes)
  );
});

it('posts "pingRenderers" renderer request on load', async () => {
  registerTestPlugins();
  const { postRendererRequest } = mockMessageHandler();

  loadPlugins();

  await waitFor(() =>
    expect(postRendererRequest).toBeCalledWith(expect.any(Object), {
      type: 'pingRenderers',
    })
  );
});
