import { wait } from 'react-testing-library';
import { loadPlugins, PluginContext } from 'react-plugin';
import { RendererRequest } from 'react-cosmos-shared2/renderer';
import { cleanup, mockMethodsOf, on } from '../../../../testHelpers/plugin';
import { NotificationsSpec } from '../../../Notifications/public';
import { RouterSpec } from '../../../Router/public';
import { connectRenderer, changeFixtureState } from '../../testHelpers';
import { RendererCoreSpec } from '../../public';
import { register } from '../..';

afterEach(cleanup);

const fixtureId = { path: 'ein.js', name: null };
const fixtures = { [fixtureId.path]: null };
const fixtureState = { components: [] };

function registerTestPlugins(
  handleRendererRequest: (
    context: PluginContext<any>,
    msg: RendererRequest
  ) => void
) {
  register();
  mockMethodsOf<RouterSpec>('router', {
    getSelectedFixtureId: () => fixtureId
  });
  mockMethodsOf<NotificationsSpec>('notifications', {
    pushNotification: () => {}
  });
  on<RendererCoreSpec>('rendererCore', {
    request: handleRendererRequest
  });
}

function loadTestPlugins() {
  loadPlugins();
}

it('posts "selectFixture" renderer request', async () => {
  const handleRendererRequest = jest.fn();
  registerTestPlugins(handleRendererRequest);

  loadTestPlugins();
  connectRenderer('mockRendererId', fixtures);

  await wait(() =>
    expect(handleRendererRequest).toBeCalledWith(expect.any(Object), {
      type: 'selectFixture',
      payload: {
        rendererId: 'mockRendererId',
        fixtureId,
        fixtureState: null
      }
    })
  );
});

it('posts "selectFixture" renderer request with fixture state', async () => {
  const handleRendererRequest = jest.fn();
  registerTestPlugins(handleRendererRequest);

  loadTestPlugins();
  connectRenderer('mockRendererId1', fixtures);
  changeFixtureState('mockRendererId1', fixtureId, fixtureState);
  connectRenderer('mockRendererId2', fixtures);

  await wait(() =>
    expect(handleRendererRequest).toBeCalledWith(expect.any(Object), {
      type: 'selectFixture',
      payload: {
        rendererId: 'mockRendererId2',
        fixtureId,
        fixtureState
      }
    })
  );
});
