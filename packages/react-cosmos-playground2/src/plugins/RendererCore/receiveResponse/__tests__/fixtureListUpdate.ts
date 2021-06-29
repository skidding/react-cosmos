import { waitFor } from '@testing-library/dom';
import { FixtureList, RendererId } from 'react-cosmos-shared2/renderer';
import { loadPlugins, resetPlugins } from 'react-plugin';
import {
  getRendererCoreMethods,
  mockNotifications,
  mockRouter,
} from '../../../../testHelpers/pluginMocks';
import {
  createFixtureListUpdateResponse,
  mockRendererReady,
} from '../../testHelpers';

beforeEach(() => jest.isolateModules(() => require('../..')));

afterEach(resetPlugins);

const fixtures: FixtureList = {
  'ein.js': { type: 'single' },
  'zwei.js': { type: 'single' },
  'drei.js': { type: 'single' },
};

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
}

function mockFixtureListUpdateResponse(rendererId: RendererId) {
  const methods = getRendererCoreMethods();
  methods.receiveResponse(
    createFixtureListUpdateResponse(rendererId, {
      ...fixtures,
      'vier.js': { type: 'single' },
    })
  );
}

it('updates fixtures in renderer state', async () => {
  registerTestPlugins();
  loadTestPlugins();
  mockFixtureListUpdateResponse('mockRendererId1');

  await waitFor(() =>
    expect(getRendererCoreMethods().getFixtures()).toEqual({
      ...fixtures,
      'vier.js': { type: 'single' },
    })
  );
});

it('ignores update from secondary renderer', async () => {
  registerTestPlugins();
  loadTestPlugins();
  mockFixtureListUpdateResponse('mockRendererId2');

  await waitFor(() =>
    expect(getRendererCoreMethods().getFixtures()).toEqual(fixtures)
  );
});
