import { waitFor } from '@testing-library/dom';
import { loadPlugins, resetPlugins } from 'react-plugin';
import {
  getRendererCoreMethods,
  mockRouter,
  mockNotifications,
  getRouterContext,
  onRendererCore,
} from '../../../testHelpers/pluginMocks';
import { mockRendererReady } from '../testHelpers';

beforeEach(() => jest.isolateModules(() => require('..')));

afterEach(resetPlugins);

const fixtures = {};

function registerTestPlugins() {
  mockRouter({
    getSelectedFixtureId: () => null,
  });
  mockNotifications();
}

function loadTestPlugins() {
  loadPlugins();
  mockRendererReady('mockRendererId1', fixtures);
  mockRendererReady('mockRendererId2', fixtures);
  getRendererCoreMethods().selectPrimaryRenderer('mockRendererId2');
}

function emitRouterFixtureChange() {
  getRouterContext().emit('fixtureChange', { path: 'zwei.js' });
}

it('posts "selectFixture" renderer requests', async () => {
  registerTestPlugins();
  const { request } = onRendererCore();

  loadTestPlugins();
  emitRouterFixtureChange();

  await waitFor(() =>
    expect(request).toBeCalledWith(expect.any(Object), {
      type: 'selectFixture',
      payload: {
        rendererId: 'mockRendererId1',
        fixtureId: { path: 'zwei.js' },
        fixtureState: {},
      },
    })
  );

  await waitFor(() =>
    expect(request).toBeCalledWith(expect.any(Object), {
      type: 'selectFixture',
      payload: {
        rendererId: 'mockRendererId2',
        fixtureId: { path: 'zwei.js' },
        fixtureState: {},
      },
    })
  );
});
