import { waitFor } from '@testing-library/dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { createFixtureTree } from 'react-cosmos-shared2/fixtureTree';
import { FixtureList } from 'react-cosmos-shared2/renderer';
import { FixtureTree } from './FixtureTree';

const fixtures: FixtureList = {
  'ein.js': { type: 'single' },
  'zwei.js': { type: 'single' },
  'nested/drei.js': { type: 'single' },
  'deeply/nested/vier.js': { type: 'single' },
};
const rootNode = createFixtureTree({
  fixtures,
  fixturesDir: '__fixtures__',
  fixtureFileSuffix: 'fixture',
});

it('hides fixture under non-expanded dir', async () => {
  const { queryByText } = render(
    <FixtureTree
      rootNode={rootNode}
      selectedFixtureId={null}
      selectedRef={{ current: null }}
      expansion={{}}
      onSelect={jest.fn()}
      setExpansion={jest.fn()}
    />
  );
  await waitFor(() => expect(queryByText('drei')).toBeNull());
});

it('shows fixture under expanded dir', async () => {
  const { findByText } = render(
    <FixtureTree
      rootNode={rootNode}
      selectedFixtureId={null}
      selectedRef={{ current: null }}
      expansion={{ nested: true }}
      onSelect={jest.fn()}
      setExpansion={jest.fn()}
    />
  );
  await findByText('drei');
});

it('expands hidden dir on click', async () => {
  const setExpansion = jest.fn();
  const { getByText } = render(
    <FixtureTree
      rootNode={rootNode}
      selectedFixtureId={null}
      selectedRef={{ current: null }}
      expansion={{}}
      onSelect={jest.fn()}
      setExpansion={setExpansion}
    />
  );
  fireEvent.click(getByText(/nested/i));
  expect(setExpansion).toBeCalledWith({ nested: true });
});

it('collapses expanded dir on click', async () => {
  const setExpansion = jest.fn();
  const { getByText } = render(
    <FixtureTree
      rootNode={rootNode}
      selectedFixtureId={null}
      selectedRef={{ current: null }}
      expansion={{ nested: true }}
      onSelect={jest.fn()}
      setExpansion={setExpansion}
    />
  );
  fireEvent.click(getByText(/nested/i));
  expect(setExpansion).toBeCalledWith({ nested: false });
});
