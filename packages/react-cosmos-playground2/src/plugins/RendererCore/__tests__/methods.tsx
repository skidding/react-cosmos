import { loadPlugins } from 'react-plugin';
import { cleanup, mockMethodsOf } from '../../../testHelpers/plugin';
import { NotificationsSpec } from '../../Notifications/public';
import {
  connectRenderer,
  getRendererCoreMethods,
  changeFixtureState
} from '../testHelpers';
import { RouterSpec } from '../../Router/public';
import { register } from '..';

afterEach(cleanup);

const fixtures = { 'ein.js': null, 'zwei.js': null, 'drei.js': null };
const fixtureId = { path: 'foo.js', name: null };
const fixtureState = { components: [] };

function registerTestPlugins() {
  register();
  mockMethodsOf<RouterSpec>('router', {
    getSelectedFixtureId: () => fixtureId
  });
  mockMethodsOf<NotificationsSpec>('notifications', {
    pushNotification: () => {}
  });
}

function loadTestPlugins() {
  loadPlugins();
  connectRenderer('mockRendererId1', fixtures);
  connectRenderer('mockRendererId2', fixtures);
  getRendererCoreMethods().selectPrimaryRenderer('mockRendererId2');
  changeFixtureState('mockRendererId2', fixtureId, fixtureState);
}

it('returns connected renderer IDs', () => {
  registerTestPlugins();
  loadTestPlugins();
  expect(getRendererCoreMethods().getConnectedRendererIds()).toEqual([
    'mockRendererId1',
    'mockRendererId2'
  ]);
});

it('returns primary renderer ID', () => {
  registerTestPlugins();
  loadTestPlugins();
  expect(getRendererCoreMethods().getPrimaryRendererId()).toEqual(
    'mockRendererId2'
  );
});

it('returns fixtures', () => {
  registerTestPlugins();
  loadTestPlugins();
  expect(getRendererCoreMethods().getFixtures()).toEqual({
    'ein.js': null,
    'zwei.js': null,
    'drei.js': null
  });
});

it('returns fixture state', () => {
  registerTestPlugins();
  loadTestPlugins();
  expect(getRendererCoreMethods().getFixtureState()).toEqual({
    components: []
  });
});
