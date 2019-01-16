// @flow

import React from 'react';
import { render, waitForElement } from 'react-testing-library';
import { Slot, loadPlugins } from 'react-plugin';
import { cleanup, mockState, mockMethod } from '../../../testHelpers/plugin';
import { register } from '..';

afterEach(cleanup);

function registerTestPlugins() {
  register();
  mockState('router', { urlParams: {} });
  mockMethod('renderer.isRendererConnected', () => false);
  mockMethod('renderer.isValidFixtureSelected', () => false);
}

function loadTestPlugins() {
  loadPlugins();

  return render(<Slot name="rendererHeader" />);
}

it('renders waiting state message', async () => {
  registerTestPlugins();
  const { getByText } = loadTestPlugins();

  await waitForElement(() => getByText(/waiting for renderer/i));
});
