import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { loadPlugins, resetPlugins } from 'react-plugin';
import { RendererActionSlot } from '../../shared/slots/RendererActionSlot';
import { mockCore } from '../../testHelpers/pluginMocks';
import { mockWindowOpen } from '../../testHelpers/windowOpenMock';

beforeEach(() => jest.isolateModules(() => require('.')));

afterEach(resetPlugins);

const fixtureId = { path: 'foo.js' };

function loadTestPlugins() {
  loadPlugins();
  return render(
    <RendererActionSlot slotProps={{ fixtureId }} plugOrder={[]} />
  );
}

it('renders fullscreen button', async () => {
  mockCore({ getWebRendererUrl: () => `/_renderer.html` });
  const windowOpenMock = mockWindowOpen();

  const { getByTitle } = loadTestPlugins();
  fireEvent.click(getByTitle(/go fullscreen/i));

  const stringifiedFixtureId = encodeURIComponent(JSON.stringify(fixtureId));
  expect(windowOpenMock.value).toBeCalledWith(
    `/_renderer.html?_fixtureId=${stringifiedFixtureId}`,
    '_blank'
  );

  windowOpenMock.unmock();
});

it('does not render fullscreen button without renderer URL', async () => {
  mockCore({ getWebRendererUrl: () => null });

  const { queryByTitle } = loadTestPlugins();
  expect(queryByTitle(/go fullscreen/i)).toBeNull();
});
