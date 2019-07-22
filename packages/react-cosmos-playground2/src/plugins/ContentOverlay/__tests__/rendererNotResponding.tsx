import { render } from '@testing-library/react';
import React from 'react';
import { loadPlugins, Slot } from 'react-plugin';
import { register } from '..';
import { cleanup } from '../../../testHelpers/plugin';
import {
  mockRendererCore,
  mockRendererPreview,
  mockRouter,
  mockStorage
} from '../../../testHelpers/pluginMocks';

afterEach(cleanup);

function registerTestPlugins() {
  register();
  mockStorage();
  mockRouter({
    getSelectedFixtureId: () => null
  });
  mockRendererCore({
    isRendererConnected: () => false,
    isValidFixtureSelected: () => false
  });
  mockRendererPreview({
    getUrlStatus: () => 'error',
    getRuntimeStatus: () => 'pending'
  });
}

function loadTestPlugins() {
  loadPlugins();
  return render(<Slot name="contentOverlay" />);
}

it('renders "error" message', () => {
  registerTestPlugins();
  const { getByText } = loadTestPlugins();

  getByText(/renderer/i);
  getByText(/not responding/i);
});

it('renders "help" link', () => {
  registerTestPlugins();
  const { getByText } = loadTestPlugins();

  const helpLink = getByText(/ask for help/i) as HTMLAnchorElement;
  expect(helpLink.href).toMatch('https://join-react-cosmos.now.sh');
});
