import React, { useMemo } from 'react';
import { createFixtureTree } from 'react-cosmos-shared2/fixtureTree';
import { FixtureId, FixtureList } from 'react-cosmos-shared2/renderer';
import styled from 'styled-components';
import { grey32 } from '../../shared/colors';
import { TreeExpansion } from '../../shared/treeExpansion';
import { BlankState } from './BlankState';
import { FixtureTree } from './FixtureTree/FixtureTree';
import { FixtureTreeHeader } from './FixtureTreeHeader';
import { useScrollToSelected } from './useScrollToSelected';

type Props = {
  fixturesDir: string;
  fixtureFileSuffix: string;
  selectedFixtureId: null | FixtureId;
  rendererConnected: boolean;
  fixtures: FixtureList;
  expansion: TreeExpansion;
  selectFixture: (fixtureId: FixtureId) => void;
  setExpansion: (expansion: TreeExpansion) => unknown;
};

export function FixtureTreeContainer({
  fixturesDir,
  fixtureFileSuffix,
  selectedFixtureId,
  rendererConnected,
  fixtures,
  expansion,
  selectFixture,
  setExpansion,
}: Props) {
  const rootNode = useMemo(
    () => createFixtureTree({ fixtures, fixturesDir, fixtureFileSuffix }),
    [fixtures, fixturesDir, fixtureFileSuffix]
  );
  const { containerRef, selectedRef } = useScrollToSelected(selectedFixtureId);

  if (!rendererConnected) return <TreeContainer />;

  if (Object.keys(fixtures).length === 0) {
    return (
      <TreeContainer>
        <BlankState
          fixturesDir={fixturesDir}
          fixtureFileSuffix={fixtureFileSuffix}
        />
      </TreeContainer>
    );
  }

  return (
    <>
      <FixtureTreeHeader
        fixturesDir={fixturesDir}
        fixtureFileSuffix={fixtureFileSuffix}
        fixtures={fixtures}
        expansion={expansion}
        setExpansion={setExpansion}
      />
      <TreeContainer ref={containerRef}>
        <FixtureTree
          rootNode={rootNode}
          selectedFixtureId={selectedFixtureId}
          expansion={expansion}
          selectedRef={selectedRef}
          setExpansion={setExpansion}
          onSelect={selectFixture}
        />
      </TreeContainer>
    </>
  );
}

// The background color is required for the proper scroll bar color theme
const TreeContainer = styled.div`
  flex: 1;
  background: ${grey32};
  overflow: auto;
`;
