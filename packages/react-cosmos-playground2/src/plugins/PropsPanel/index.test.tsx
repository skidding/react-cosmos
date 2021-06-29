import { waitFor } from '@testing-library/dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  FixtureState,
  FixtureStateValues,
} from 'react-cosmos-shared2/fixtureState';
import { loadPlugins, resetPlugins } from 'react-plugin';
import { SidePanelRowSlot } from '../../shared/slots/SidePanelRowSlot';
import { mockStorage } from '../../testHelpers/pluginMocks';
import { getParentButton } from '../../testHelpers/selectors';
import { PROPS_TREE_EXPANSION_STORAGE_KEY } from './shared';

beforeEach(() => jest.isolateModules(() => require('.')));

afterEach(resetPlugins);

const fixtureId = { path: 'foo.js' };

function loadTestPlugins(fixtureState: FixtureState) {
  loadPlugins();
  return render(
    <SidePanelRowSlot
      slotProps={{
        fixtureId,
        fixtureState,
        onFixtureStateChange: stateUpdater => {
          fixtureState.props = stateUpdater(fixtureState).props;
        },
      }}
      plugOrder={[]}
    />
  );
}

it('renders blank state', async () => {
  mockStorage();

  const fixtureState = createFsState({});
  const { getByText } = loadTestPlugins(fixtureState);
  getByText(/no visible props/i);
});

it('renders component name', async () => {
  mockStorage();

  const fixtureState = createFsState({
    myValue: { type: 'primitive', data: 'foo' },
  });
  const { getByText } = loadTestPlugins(fixtureState);
  getByText('MyComponent');
});

it('updates string value', async () => {
  mockStorage();

  const fixtureState = createFsState({
    myStrValue: { type: 'primitive', data: 'foo' },
  });
  const { getByLabelText } = loadTestPlugins(fixtureState);
  const input = getByLabelText('myStrValue');

  fireEvent.change(input, { target: { value: 'bar' } });
  await waitFor(() =>
    expect(fixtureState.props[0].values).toEqual({
      myStrValue: { type: 'primitive', data: 'bar' },
    })
  );
});

it('updates boolean value', async () => {
  mockStorage();

  const fixtureState = createFsState({
    myBoolValue: { type: 'primitive', data: false },
  });
  const { getByText } = loadTestPlugins(fixtureState);
  getByText('myBoolValue');
  const button = getByText('false');

  fireEvent.click(button);
  await waitFor(() =>
    expect(fixtureState.props[0].values).toEqual({
      myBoolValue: { type: 'primitive', data: true },
    })
  );
});

it('renders null value', async () => {
  mockStorage();

  const fixtureState = createFsState({
    myNullValue: { type: 'primitive', data: null },
  });
  const { getByText } = loadTestPlugins(fixtureState);
  getByText('myNullValue');
  getByText('null');
});

it('renders unserializable value', async () => {
  mockStorage();

  const fixtureState = createFsState({
    myRegexpValue: {
      type: 'unserializable',
      stringifiedData: '/canttouchthis/i',
    },
  });
  const { getByText } = loadTestPlugins(fixtureState);
  getByText('myRegexpValue');
  getByText('/canttouchthis/i');
});

it('toggles nested object', async () => {
  const { setItem } = mockStorage();

  const fixtureState = createFsState({
    myObjValue: {
      type: 'object',
      values: {
        myNumValue: { type: 'primitive', data: 1234 },
      },
    },
  });
  const { getByText } = loadTestPlugins(fixtureState);
  fireEvent.click(getParentButton(getByText('myObjValue')));

  expect(setItem).toBeCalledWith(
    expect.any(Object),
    PROPS_TREE_EXPANSION_STORAGE_KEY,
    { [fixtureId.path]: { root: { myObjValue: true } } }
  );
});

it('updates number input nested in object', async () => {
  mockStorage({
    getItem: (context, key) =>
      key === PROPS_TREE_EXPANSION_STORAGE_KEY
        ? { [fixtureId.path]: { root: { myObjValue: true } } }
        : null,
  });

  const fixtureState = createFsState({
    myObjValue: {
      type: 'object',
      values: {
        myNumValue: { type: 'primitive', data: 1234 },
      },
    },
  });
  const { getByLabelText } = loadTestPlugins(fixtureState);
  const input = getByLabelText('myNumValue');

  fireEvent.change(input, { target: { value: 6789 } });
  await waitFor(() =>
    expect(fixtureState.props[0].values).toEqual({
      myObjValue: {
        type: 'object',
        values: {
          myNumValue: { type: 'primitive', data: 6789 },
        },
      },
    })
  );
});

function createFsState(propsValues: FixtureStateValues) {
  return {
    props: [
      {
        elementId: { decoratorId: 'root', elPath: '' },
        renderKey: 0,
        componentName: 'MyComponent',
        values: propsValues,
      },
    ],
  };
}
