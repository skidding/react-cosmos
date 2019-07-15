import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { loadPlugins, Slot } from 'react-plugin';
import { register } from '.';
import { cleanup } from '../../testHelpers/plugin';
import {
  mockCore,
  mockRendererCore,
  mockRouter
} from '../../testHelpers/pluginMocks';

afterEach(cleanup);

const fixtures = {
  'src/__fixtures__/fixture1.ts': null,
  'src/__fixtures__/fixture2.ts': null,
  'src/foobar/fixture3.fixture.ts': ['fixture3a', 'fixture3b']
};

function registerTestPlugins() {
  register();
  mockCore({
    getFixtureFileVars: () => ({
      fixturesDir: '__fixtures__',
      fixtureFileSuffix: 'fixture'
    })
  });
  mockRendererCore({
    getFixtures: () => fixtures
  });
}

function loadTestPlugins() {
  loadPlugins();
  return render(
    <>
      <Slot name="navRow" />
      <Slot name="global" />
    </>
  );
}

it('open fixture list and selects fixture', async () => {
  const { selectFixture } = mockRouter();
  registerTestPlugins();
  const { getByText, getByTestId, queryByTestId } = loadTestPlugins();

  // Opens fixture search overlay
  fireEvent.click(getByText(/search fixtures/i));

  // Shows (cleaned up) fixture list
  getByTestId('fixtureSearchContent');
  getByText('src/fixture1');
  getByText('src/fixture2');
  getByText('src/foobar/fixture3 fixture3a');
  getByText('src/foobar/fixture3 fixture3b');

  // Selects fixture
  fireEvent.click(getByText('src/foobar/fixture3 fixture3b'));
  const fixtureId = {
    path: 'src/foobar/fixture3.fixture.ts',
    name: 'fixture3b'
  };
  expect(selectFixture).toBeCalledWith(expect.any(Object), fixtureId, false);

  // Also closes fixture search overlay
  expect(queryByTestId('fixtureSearchContent')).toBeNull();
});

it('closes fixture list on outside click', async () => {
  mockRouter();
  registerTestPlugins();
  const { getByText, getByTestId, queryByTestId } = loadTestPlugins();

  // Opens fixture search overlay
  fireEvent.click(getByText(/search fixtures/i));
  getByTestId('fixtureSearchContent');

  // Closes fixture search overlay
  fireEvent.click(getByTestId('fixtureSearchOverlay'));
  expect(queryByTestId('fixtureSearchContent')).toBeNull();
});