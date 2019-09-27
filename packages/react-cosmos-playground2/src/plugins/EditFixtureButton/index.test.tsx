import { fireEvent, render, RenderResult, wait } from '@testing-library/react';
import React from 'react';
import { loadPlugins, resetPlugins } from 'react-plugin';
import { register } from '.';
import { RendererActionSlot } from '../../shared/slots/RendererActionSlot';
import { mockCore, mockNotifications } from '../../testHelpers/pluginMocks';
import { mockFetch } from './testHelpers';

afterEach(resetPlugins);

async function loadTestPlugins() {
  loadPlugins();
  return render(
    <RendererActionSlot
      slotProps={{
        fixtureId: { path: 'foo.js', name: null }
      }}
      plugOrder={[]}
    />
  );
}

function clickButton({ getByTitle }: RenderResult) {
  const editBtn = getByTitle(/open fixture source/i);
  fireEvent.click(editBtn);
}

it(`doesn't render button when dev server is off`, async () => {
  register();
  mockCore({ isDevServerOn: () => false });
  mockNotifications();

  const { queryByTitle } = await loadTestPlugins();
  expect(queryByTitle(/open fixture source/i)).toBeNull();
});

it('renders button', async () => {
  register();
  mockCore({ isDevServerOn: () => true });
  mockNotifications();

  const { getByTitle } = await loadTestPlugins();
  getByTitle(/open fixture source/i);
});

it('calls server endpoint on button click', async () => {
  await mockFetch(200, async fetchMock => {
    register();
    mockCore({ isDevServerOn: () => true });
    mockNotifications();

    const renderer = await loadTestPlugins();
    clickButton(renderer);

    const openFileUrl = '/_open?filePath=foo.js';
    expect(fetchMock).toBeCalledWith(openFileUrl, expect.any(Object));
  });
});

it('shows 400 error notification', async () => {
  await mockFetch(400, async () => {
    register();
    mockCore({ isDevServerOn: () => true });
    const { pushTimedNotification } = mockNotifications();

    const renderer = await loadTestPlugins();
    clickButton(renderer);

    await wait(() =>
      expect(pushTimedNotification).toBeCalledWith(expect.any(Object), {
        id: expect.any(String),
        type: 'error',
        title: 'Failed to open fixture',
        info: 'This looks like a bug. Let us know please!'
      })
    );
  });
});

it('shows 404 error notification', async () => {
  await mockFetch(404, async () => {
    register();
    mockCore({ isDevServerOn: () => true });
    const { pushTimedNotification } = mockNotifications();

    const renderer = await loadTestPlugins();
    clickButton(renderer);

    await wait(() =>
      expect(pushTimedNotification).toBeCalledWith(expect.any(Object), {
        id: expect.any(String),
        type: 'error',
        title: 'Failed to open fixture',
        info: 'File is missing. Weird!'
      })
    );
  });
});

it('shows 500 error notification', async () => {
  await mockFetch(500, async () => {
    register();
    mockCore({ isDevServerOn: () => true });
    const { pushTimedNotification } = mockNotifications();

    const renderer = await loadTestPlugins();
    clickButton(renderer);

    await wait(() =>
      expect(pushTimedNotification).toBeCalledWith(expect.any(Object), {
        id: expect.any(String),
        type: 'error',
        title: 'Failed to open fixture',
        info: 'Does your OS know to open source files with your code editor?'
      })
    );
  });
});
