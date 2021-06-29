import { waitFor } from '@testing-library/dom';
import { FixtureList } from 'react-cosmos-shared2/renderer';
import { loadPlugins, resetPlugins } from 'react-plugin';
import {
  getRendererCoreMethods,
  mockRouter,
  mockNotifications,
} from '../../../../testHelpers/pluginMocks';
import { mockRendererReady, mockFixtureStateChange } from '../../testHelpers';

beforeEach(() => jest.isolateModules(() => require('../..')));

afterEach(resetPlugins);

const fixtures: FixtureList = { 'ein.js': { type: 'single' } };
const fixtureId = { path: 'zwei.js' };
const fixtureState = { props: [] };

function registerTestPlugins() {
  mockRouter({
    getSelectedFixtureId: () => fixtureId,
  });
  mockNotifications();
}

function loadTestPlugins() {
  loadPlugins();
  mockRendererReady('mockRendererId1', fixtures);
  mockRendererReady('mockRendererId2', fixtures);
  mockFixtureStateChange('mockRendererId1', fixtureId, fixtureState);
}

it('returns connected renderer IDs', async () => {
  registerTestPlugins();
  loadTestPlugins();
  await waitFor(() =>
    expect(getRendererCoreMethods().getConnectedRendererIds()).toEqual([
      'mockRendererId1',
      'mockRendererId2',
    ])
  );
});

it('returns primary renderer ID', async () => {
  registerTestPlugins();
  loadTestPlugins();
  await waitFor(() =>
    expect(getRendererCoreMethods().getPrimaryRendererId()).toEqual(
      'mockRendererId1'
    )
  );
});

it('returns fixtures', async () => {
  registerTestPlugins();
  loadTestPlugins();
  await waitFor(() =>
    expect(getRendererCoreMethods().getFixtures()).toEqual(fixtures)
  );
});

it('returns fixture state', async () => {
  registerTestPlugins();
  loadTestPlugins();
  await waitFor(() =>
    expect(getRendererCoreMethods().getFixtureState()).toEqual(fixtureState)
  );
});

it('resets fixtures state when primary renderer re-connects', async () => {
  registerTestPlugins();
  loadTestPlugins();
  mockRendererReady('mockRendererId1', fixtures);
  await waitFor(() =>
    expect(getRendererCoreMethods().getFixtureState()).toEqual({})
  );
});
