import { waitFor } from '@testing-library/dom';
import { loadPlugins, resetPlugins } from 'react-plugin';
import { pushUrlParams, resetUrl } from '../../../testHelpers/url';
import { getRouterMethods } from '../../../testHelpers/pluginMocks';

beforeEach(() => jest.isolateModules(() => require('..')));

afterEach(() => {
  resetPlugins();
  resetUrl();
});

const fixtureId = { path: 'zwei.js' };

it('returns fixtureId', async () => {
  pushUrlParams({ fixtureId: JSON.stringify(fixtureId) });
  loadPlugins();

  await waitFor(() =>
    expect(getRouterMethods().getSelectedFixtureId()).toEqual(fixtureId)
  );
});

it('returns null', async () => {
  loadPlugins();

  await waitFor(() =>
    expect(getRouterMethods().getSelectedFixtureId()).toBe(null)
  );
});
