import React, { RefObject } from 'react';
import { FixtureId } from 'react-cosmos-shared2/renderer';
import styled from 'styled-components';
import { grey8 } from '../../../shared/colors';
import { FixtureLink } from './FixtureLink';
import { FixtureTreeItem } from './FixtureTreeItem';
import { MultiFixtureChildButton } from './MultiFixtureChildButton';

type Props = {
  name: string;
  fixtureIds: Record<string, FixtureId>;
  indentLevel: number;
  selected: boolean;
  selectedFixtureId: null | FixtureId;
  selectedRef: RefObject<HTMLElement>;
  onSelect: (fixtureId: FixtureId) => unknown;
};

export function MultiFixtureButton({
  name,
  fixtureIds,
  indentLevel,
  selected,
  selectedFixtureId,
  selectedRef,
  onSelect,
}: Props) {
  const fixtureNames = Object.keys(fixtureIds);
  const firstFixtureId = fixtureIds[fixtureNames[0]];
  if (!firstFixtureId) return null;

  if (!selected)
    return (
      <FixtureLink fixtureId={firstFixtureId} onSelect={onSelect}>
        <FixtureTreeItem indentLevel={indentLevel} selected={false}>
          <Name>{name}</Name>
          <Count>{fixtureNames.length}</Count>
        </FixtureTreeItem>
      </FixtureLink>
    );

  return (
    <>
      <FixtureTreeItem indentLevel={indentLevel} selected={true}>
        <Name>{name}</Name>
        <Count>{fixtureNames.length}</Count>
      </FixtureTreeItem>
      {fixtureNames.map((fixtureName, index) => {
        const fixtureId = fixtureIds[fixtureName];
        // TODO: Clean up
        const childSelected =
          selectedFixtureId !== null &&
          selectedFixtureId.path === fixtureId.path &&
          (selectedFixtureId.name === fixtureId.name ||
            (selectedFixtureId.name === undefined && index === 0));
        return (
          <MultiFixtureChildButton
            key={fixtureName}
            name={fixtureName}
            fixtureId={fixtureId}
            indentLevel={indentLevel + 1}
            selected={childSelected}
            selectedRef={selectedRef}
            onSelect={onSelect}
          />
        );
      })}
      <FooterPadding />
    </>
  );
}

const Name = styled.span`
  flex-shrink: 0;
  padding: 0 8px 0 16px;
  white-space: nowrap;
`;

const Count = styled.span`
  margin: 0 8px 0 -3px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 18px;
`;

const FooterPadding = styled.div`
  height: 2px;
  background-color: ${grey8};
`;
