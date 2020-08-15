import { isEqual } from 'lodash';
import React, { RefObject } from 'react';
import { FixtureTreeNode } from 'react-cosmos-shared2/fixtureTree';
import { FixtureId } from 'react-cosmos-shared2/renderer';
import styled from 'styled-components';
import { grey32 } from '../../../shared/colors';
import {
  nodeContainsFixtureId,
  recordContainsFixtureId,
} from '../../../shared/fixtureTree';
import {
  getTreeNodePath,
  TreeExpansion,
  useTreeExpansionToggle,
} from '../../../shared/treeExpansion';
import { TreeView } from '../../../shared/TreeView';
import { FixtureButton } from './FixtureButton';
import { FixtureDir } from './FixtureDir';
import { MultiFixtureButton } from './MultiFixtureButton';

type Props = {
  rootNode: FixtureTreeNode;
  selectedFixtureId: null | FixtureId;
  selectedRef: RefObject<HTMLElement>;
  treeExpansion: TreeExpansion;
  setTreeExpansion: (treeExpansion: TreeExpansion) => unknown;
  onSelect: (fixtureId: FixtureId) => unknown;
};

export const FixtureTree = React.memo(function FixtureTree({
  rootNode,
  selectedFixtureId,
  selectedRef,
  treeExpansion: expansion,
  setTreeExpansion: setExpansion,
  onSelect,
}: Props) {
  const onExpansionToggle = useTreeExpansionToggle(expansion, setExpansion);
  return (
    <Container>
      <TreeView
        node={rootNode}
        expansion={expansion}
        renderNode={({ node, name, parents }) => {
          const { data, children } = node;

          if (data.type === 'fixture') {
            const selected = isEqual(selectedFixtureId, data.fixtureId);
            return (
              <FixtureButton
                name={name}
                fixtureId={data.fixtureId}
                indentLevel={parents.length}
                selected={selected}
                selectedRef={selectedRef}
                onSelect={onSelect}
              />
            );
          }

          if (data.type === 'multiFixture') {
            const selected =
              selectedFixtureId !== null &&
              recordContainsFixtureId(data.fixtureIds, selectedFixtureId);
            return (
              <MultiFixtureButton
                name={name}
                fixtureIds={data.fixtureIds}
                indentLevel={parents.length}
                selected={selected}
                selectedFixtureId={selectedFixtureId}
                selectedRef={selectedRef}
                onSelect={onSelect}
              />
            );
          }

          if (!children) return null;

          const expanded = expansion[getTreeNodePath(parents, name)];
          const selected =
            !expanded &&
            selectedFixtureId !== null &&
            nodeContainsFixtureId(node, selectedFixtureId);
          return (
            <FixtureDir
              name={name}
              parents={parents}
              expanded={expanded}
              selected={selected}
              selectedRef={selectedRef}
              onToggle={onExpansionToggle}
            />
          );
        }}
      />
    </Container>
  );
});

// Reason for inline-block: https://stackoverflow.com/a/53895622/128816
const Container = styled.div`
  display: inline-block;
  min-width: 100%;
  padding: 0 0 8px 0;
  background: ${grey32};
`;
