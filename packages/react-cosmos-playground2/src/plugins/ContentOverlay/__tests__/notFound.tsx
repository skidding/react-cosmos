import { render } from '@testing-library/react';
import React from 'react';
import { loadPlugins, Slot, resetPlugins } from 'react-plugin';
import {
  mockRendererCore,
  mockRendererPreview,
  mockRouter,
  mockStorage,
} from '../../../testHelpers/pluginMocks';

beforeEach(() => jest.isolateModules(() => require('..')));

afterEach(resetPlugins);

function registerTestPlugins() {
  mockStorage();
  mockRouter({
    getSelectedFixtureId: () => ({ path: 'foo.js' }),
  });
  mockRendererCore({
    isRendererConnected: () => true,
    isValidFixtureSelected: () => false,
  });
  mockRendererPreview({
    getUrlStatus: () => 'ok',
    getRuntimeStatus: () => 'connected',
  });
}

function loadTestPlugins() {
  loadPlugins();
  return render(<Slot name="contentOverlay" />);
}

it('renders "notFound" state', () => {
  registerTestPlugins();
  const { queryByTestId } = loadTestPlugins();
  expect(queryByTestId('notFound')).not.toBeNull();
});
