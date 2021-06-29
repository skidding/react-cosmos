import { FixtureState } from 'react-cosmos-shared2/fixtureState';
import {
  FixtureId,
  FixtureList,
  FixtureListUpdateResponse,
  FixtureStateChangeResponse,
  RendererId,
  RendererReadyResponse,
} from 'react-cosmos-shared2/renderer';
import { getRendererCoreMethods } from '../../../testHelpers/pluginMocks';

export function createRendererReadyResponse(
  rendererId: RendererId,
  fixtures: FixtureList
): RendererReadyResponse {
  return {
    type: 'rendererReady',
    payload: {
      rendererId,
      fixtures,
    },
  };
}

export function createFixtureListUpdateResponse(
  rendererId: RendererId,
  fixtures: FixtureList
): FixtureListUpdateResponse {
  return {
    type: 'fixtureListUpdate',
    payload: {
      rendererId,
      fixtures,
    },
  };
}

export function createFixtureStateChangeResponse(
  rendererId: RendererId,
  fixtureId: FixtureId,
  fixtureState: FixtureState
): FixtureStateChangeResponse {
  return {
    type: 'fixtureStateChange',
    payload: {
      rendererId,
      fixtureId,
      fixtureState,
    },
  };
}

export function mockRendererReady(
  rendererId: RendererId,
  fixtures: FixtureList
) {
  return getRendererCoreMethods().receiveResponse(
    createRendererReadyResponse(rendererId, fixtures)
  );
}

export function mockFixtureStateChange(
  rendererId: RendererId,
  fixtureId: FixtureId,
  fixtureState: FixtureState
) {
  return getRendererCoreMethods().receiveResponse(
    createFixtureStateChangeResponse(rendererId, fixtureId, fixtureState)
  );
}
