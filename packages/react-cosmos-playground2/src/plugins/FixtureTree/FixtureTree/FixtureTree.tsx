import React, { RefObject } from 'react';
import { FixtureTreeNode } from 'react-cosmos-shared2/fixtureTree';
import { FixtureId } from 'react-cosmos-shared2/renderer';
import styled from 'styled-components';
import { grey32 } from '../../../shared/colors';
import {
  nodeContainsFixtureId,
  recordContainsFixtureId,
} from '../../../shared/fixtureTree';
import { TreeExpansion } from '../../../shared/treeExpansion';
import { TreeView } from '../../../shared/TreeView';
import { FixtureButton } from './FixtureButton';
import { FixtureDir } from './FixtureDir';
import { MultiFixtureButton } from './MultiFixtureButton';

type Props = {
  rootNode: FixtureTreeNode;
  selectedFixtureId: null | FixtureId;
  selectedRef: RefObject<HTMLElement>;
  expansion: TreeExpansion;
  setExpansion: (expansion: TreeExpansion) => unknown;
  onSelect: (fixtureId: FixtureId) => unknown;
};

export const FixtureTree = React.memo(function FixtureTree({
  rootNode,
  selectedFixtureId,
  selectedRef,
  expansion,
  setExpansion,
  onSelect,
}: Props) {
  return (
    <Container>
      <TreeView
        node={rootNode}
        expansion={expansion}
        setExpansion={setExpansion}
        renderNode={({ node, name, parents, expanded, onToggle }) => {
          const { data, children } = node;

          if (data.type === 'unknown') {
            const { fixturePath } = data;
            const selected = selectedFixtureId?.path === fixturePath;
            return (
              <FixtureButton
                name={name}
                fixtureId={{ path: fixturePath }}
                indentLevel={parents.length}
                selected={selected}
                selectedRef={selectedRef}
                lazy
                onSelect={onSelect}
              />
            );
          }

          if (data.type === 'fixture') {
            const selected = selectedFixtureId?.path === data.fixtureId.path;
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

          const selected =
            !expanded &&
            selectedFixtureId !== null &&
            nodeContainsFixtureId(node, selectedFixtureId);
          return (
            <FixtureDir
              name={name}
              indentLevel={parents.length}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
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
