import { waitFor } from '@testing-library/dom';
import { FixtureList } from 'react-cosmos-shared2/renderer';
import { loadPlugins, resetPlugins } from 'react-plugin';
import {
  mockNotifications,
  mockRouter,
  onRendererCore,
} from '../../../../testHelpers/pluginMocks';
import { mockFixtureStateChange, mockRendererReady } from '../../testHelpers';

beforeEach(() => jest.isolateModules(() => require('../..')));

afterEach(resetPlugins);

const fixtureId = { path: 'ein.js' };
const fixtures: FixtureList = { [fixtureId.path]: { type: 'single' } };
const fixtureState = { props: [] };

function registerTestPlugins() {
  mockRouter({
    getSelectedFixtureId: () => fixtureId,
  });
  mockNotifications();
  const { request } = onRendererCore();
  return { request };
}

function loadTestPlugins() {
  loadPlugins();
}

it('posts "selectFixture" renderer request', async () => {
  const { request } = registerTestPlugins();

  loadTestPlugins();
  mockRendererReady('mockRendererId', fixtures);

  await waitFor(() =>
    expect(request).toBeCalledWith(expect.any(Object), {
      type: 'selectFixture',
      payload: {
        rendererId: 'mockRendererId',
        fixtureId,
        fixtureState: {},
      },
    })
  );
});

it('posts "selectFixture" renderer request with fixture state', async () => {
  const { request } = registerTestPlugins();

  loadTestPlugins();
  mockRendererReady('mockRendererId1', fixtures);
  mockFixtureStateChange('mockRendererId1', fixtureId, fixtureState);
  mockRendererReady('mockRendererId2', fixtures);

  await waitFor(() =>
    expect(request).toBeCalledWith(expect.any(Object), {
      type: 'selectFixture',
      payload: {
        rendererId: 'mockRendererId2',
        fixtureId,
        fixtureState,
      },
    })
  );
});
