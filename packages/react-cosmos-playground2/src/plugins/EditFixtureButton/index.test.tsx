import { waitFor } from '@testing-library/dom';
import { fireEvent, render, RenderResult } from '@testing-library/react';
import React from 'react';
import { loadPlugins, resetPlugins } from 'react-plugin';
import { RendererActionSlot } from '../../shared/slots/RendererActionSlot';
import { mockCore, mockNotifications } from '../../testHelpers/pluginMocks';
import { Commands } from '../Core/public';
import { mockFetch } from './testHelpers';

beforeEach(() => jest.isolateModules(() => require('.')));

afterEach(resetPlugins);

const fixtureId = { path: 'foo.js' };

async function loadTestPlugins() {
  loadPlugins();
  return render(
    <RendererActionSlot slotProps={{ fixtureId }} plugOrder={[]} />
  );
}

function clickButton({ getByTitle }: RenderResult) {
  const editBtn = getByTitle(/open fixture source/i);
  fireEvent.click(editBtn);
}

it(`doesn't render button when dev server is off`, async () => {
  mockCore({ isDevServerOn: () => false });
  mockNotifications();

  const { queryByTitle } = await loadTestPlugins();
  expect(queryByTitle(/open fixture source/i)).toBeNull();
});

it(`shows error notification when dev server is off`, async () => {
  let registeredCommands: Commands = {};
  mockCore({
    isDevServerOn: () => false,
    registerCommands: (context, commands) => {
      registeredCommands = commands;
      return () => {
        registeredCommands = {};
      };
    },
  });
  const { pushTimedNotification } = mockNotifications();

  await loadTestPlugins();
  registeredCommands.editFixture();

  await waitFor(() =>
    expect(pushTimedNotification).toBeCalledWith(expect.any(Object), {
      id: expect.any(String),
      type: 'error',
      title: 'Failed to open fixture',
      info: 'Static exports cannot access source files.',
    })
  );
});

it('renders button', async () => {
  mockCore({ isDevServerOn: () => true });
  mockNotifications();

  const { getByTitle } = await loadTestPlugins();
  getByTitle(/open fixture source/i);
});

it('calls server endpoint on button click', async () => {
  await mockFetch(200, async fetchMock => {
    mockCore({ isDevServerOn: () => true });
    mockNotifications();

    const renderer = await loadTestPlugins();
    clickButton(renderer);

    const openFileUrl = `/_open?filePath=${fixtureId.path}`;
    expect(fetchMock).toBeCalledWith(openFileUrl, expect.any(Object));
  });
});

it('shows 400 error notification', async () => {
  await mockFetch(400, async () => {
    mockCore({ isDevServerOn: () => true });
    const { pushTimedNotification } = mockNotifications();

    const renderer = await loadTestPlugins();
    clickButton(renderer);

    await waitFor(() =>
      expect(pushTimedNotification).toBeCalledWith(expect.any(Object), {
        id: expect.any(String),
        type: 'error',
        title: 'Failed to open fixture',
        info: 'This looks like a bug. Please let us know!',
      })
    );
  });
});

it('shows 404 error notification', async () => {
  await mockFetch(404, async () => {
    mockCore({ isDevServerOn: () => true });
    const { pushTimedNotification } = mockNotifications();

    const renderer = await loadTestPlugins();
    clickButton(renderer);

    await waitFor(() =>
      expect(pushTimedNotification).toBeCalledWith(expect.any(Object), {
        id: expect.any(String),
        type: 'error',
        title: 'Failed to open fixture',
        info: 'File is missing. Weird!',
      })
    );
  });
});

it('shows 500 error notification', async () => {
  await mockFetch(500, async () => {
    mockCore({ isDevServerOn: () => true });
    const { pushTimedNotification } = mockNotifications();

    const renderer = await loadTestPlugins();
    clickButton(renderer);

    await waitFor(() =>
      expect(pushTimedNotification).toBeCalledWith(expect.any(Object), {
        id: expect.any(String),
        type: 'error',
        title: 'Failed to open fixture',
        info: 'Does your OS know to open source files with your code editor?',
      })
    );
  });
});
