import {
  RendererErrorResponse,
  RendererReadyResponse,
  SelectFixtureRequest,
} from 'react-cosmos-shared2/renderer';

export const selectFixtureMsg: SelectFixtureRequest = {
  type: 'selectFixture',
  payload: {
    rendererId: 'mockRendererId',
    fixtureId: { path: 'mockFixturePath' },
    fixtureState: {},
  },
};

export const rendererReadyMsg: RendererReadyResponse = {
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

export const rendererErrorMsg: RendererErrorResponse = {
  type: 'rendererError',
  payload: { rendererId: 'mockRendererId' },
};
