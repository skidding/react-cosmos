import React from 'react';
import { createFixtureTree } from 'react-cosmos-shared2/fixtureTree';
import { FixtureId, FixtureList } from 'react-cosmos-shared2/renderer';
import { useValue } from 'react-cosmos/fixture';
import { TreeExpansion } from '../../../shared/treeExpansion';
import { FixtureTree } from './FixtureTree';

const fixtures: FixtureList = {
  'src/Dashboard.ts': { type: 'single' },
  'src/Settings.ts': { type: 'single' },
  'src/shared/Dropdown.ts': { type: 'single' },
  'src/shared/Button.ts': {
    type: 'multi',
    fixtureNames: ['normal', 'disabled'],
  },
};
const rootNode = createFixtureTree({
  fixtures,
  fixturesDir: '__fixtures__',
  fixtureFileSuffix: 'fixture',
});

const disabledFixtureId = { path: 'src/shared/Button.ts', name: 'disabled' };

export default {
  collapsed: createTreeFixture(),
  expanded: createTreeFixture({ shared: true }),
  'selected collapsed': createTreeFixture({}, disabledFixtureId),
  'selected expanded': createTreeFixture({ shared: true }, disabledFixtureId),
};

function createTreeFixture(
  initialTreeExpansion: TreeExpansion = {},
  fixtureId: null | FixtureId = null
) {
  return () => {
    const [
      selectedFixtureId,
      setSelectedFixtureId,
    ] = useValue('selectedFixtureId', { defaultValue: fixtureId });
    const [expansion, setExpansion] = useValue('treeExpansion', {
      defaultValue: initialTreeExpansion,
    });
    return (
      <FixtureTree
        rootNode={rootNode}
        selectedFixtureId={selectedFixtureId}
        selectedRef={{ current: null }}
        expansion={expansion}
        onSelect={setSelectedFixtureId}
        setExpansion={setExpansion}
      />
    );
  };
}
