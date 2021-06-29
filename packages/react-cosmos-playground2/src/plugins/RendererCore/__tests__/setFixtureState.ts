import { waitFor } from '@testing-library/dom';
import { loadPlugins, resetPlugins } from 'react-plugin';
import { FixtureState } from 'react-cosmos-shared2/fixtureState';
import {
  getRendererCoreMethods,
  mockNotifications,
  mockRouter,
  onRendererCore,
} from '../../../testHelpers/pluginMocks';
import { mockRendererReady, mockFixtureStateChange } from '../testHelpers';
import { FixtureList } from 'react-cosmos-shared2/renderer';

beforeEach(() => jest.isolateModules(() => require('..')));

afterEach(resetPlugins);

const fixtures: FixtureList = {
  'ein.js': { type: 'single' },
  'zwei.js': { type: 'single' },
  'drei.js': { type: 'single' },
};
const fixtureId = { path: 'zwei.js' };
const fixtureState = { props: [] };
const expectedFixtureState = {
  props: [],
  viewport: { width: 640, height: 480 },
};

function registerTestPlugins() {
  mockSelectedFixture();
  mockNotifications();
}

function mockSelectedFixture() {
  mockRouter({
    getSelectedFixtureId: () => ({ path: 'zwei.js' }),
  });
}

function loadTestPlugins() {
  loadPlugins();
  mockRendererReady('mockRendererId2', fixtures);
  mockRendererReady('mockRendererId1', fixtures);
  mockFixtureStateChange('mockRendererId2', fixtureId, fixtureState);
}

function mockSetFixtureStateCall() {
  const methods = getRendererCoreMethods();
  methods.setFixtureState((prevState: FixtureState) => ({
    ...prevState,
    viewport: { width: 640, height: 480 },
  }));
}

it('sets fixture state in plugin state', async () => {
  registerTestPlugins();
  loadTestPlugins();
  mockSetFixtureStateCall();

  await waitFor(() =>
    expect(getRendererCoreMethods().getFixtureState()).toEqual(
      expectedFixtureState
    )
  );
});

it('posts "setFixtureState" renderer requests', async () => {
  registerTestPlugins();
  const { request } = onRendererCore();

  loadTestPlugins();
  mockSetFixtureStateCall();

  await waitFor(() =>
    expect(request).toBeCalledWith(expect.any(Object), {
      type: 'setFixtureState',
      payload: {
        rendererId: 'mockRendererId1',
        fixtureId: { path: 'zwei.js' },
        fixtureState: expectedFixtureState,
      },
    })
  );

  await waitFor(() =>
    expect(request).toBeCalledWith(expect.any(Object), {
      type: 'setFixtureState',
      payload: {
        rendererId: 'mockRendererId2',
        fixtureId: { path: 'zwei.js' },
        fixtureState: expectedFixtureState,
      },
    })
  );
});
