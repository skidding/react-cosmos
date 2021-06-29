import { isEqual } from 'lodash';
import React from 'react';
import { FlatFixtureTreeItem } from 'react-cosmos-shared2/fixtureTree';
import { FixtureId } from 'react-cosmos-shared2/renderer';
import styled from 'styled-components';
import { IconButton32 } from '../../shared/buttons';
import { grey176, grey32, white10 } from '../../shared/colors';
import {
  MenuIcon,
  RotateCcwIcon,
  SlidersIcon,
  XCircleIcon,
} from '../../shared/icons';
import { FixtureActionSlot } from '../../shared/slots/FixtureActionSlot';
import { RendererActionSlot } from '../../shared/slots/RendererActionSlot';

type Props = {
  fixtureItems: FlatFixtureTreeItem[];
  fixtureId: FixtureId;
  navOpen: boolean;
  panelOpen: boolean;
  fixtureActionOrder: string[];
  rendererActionOrder: string[];
  onOpenNav: () => unknown;
  onTogglePanel: () => unknown;
  onFixtureSelect: (fixtureId: FixtureId) => unknown;
  onClose: () => unknown;
};

export const RendererHeader = React.memo(function RendererHeader({
  fixtureItems,
  fixtureId,
  navOpen,
  panelOpen,
  fixtureActionOrder,
  rendererActionOrder,
  onOpenNav,
  onTogglePanel,
  onFixtureSelect,
  onClose,
}: Props) {
  const fixtureItem = findFixtureItemById(fixtureItems, fixtureId);
  const slotProps = React.useMemo(() => ({ fixtureId }), [fixtureId]);
  const onReload = React.useCallback(() => onFixtureSelect(fixtureId), [
    fixtureId,
    onFixtureSelect,
  ]);

  return (
    <Container>
      <Left>
        {!navOpen && (
          <>
            <IconButton32
              icon={<MenuIcon />}
              title="Show fixture list"
              selected={false}
              onClick={onOpenNav}
            />
            <ButtonSeparator />
          </>
        )}
        <IconButton32
          icon={<XCircleIcon />}
          title="Close fixture"
          onClick={onClose}
        />
        <IconButton32
          icon={<RotateCcwIcon />}
          title="Reload fixture"
          onClick={onReload}
        />
        <FixtureActionSlot
          slotProps={slotProps}
          plugOrder={fixtureActionOrder}
        />
      </Left>
      {fixtureItem && <FixtureName>{getFixtureName(fixtureItem)}</FixtureName>}
      <Right>
        <RendererActionSlot
          slotProps={slotProps}
          plugOrder={rendererActionOrder}
        />
        <IconButton32
          icon={<SlidersIcon />}
          title="Toggle control panel"
          selected={panelOpen}
          onClick={onTogglePanel}
        />
      </Right>
    </Container>
  );
});

function findFixtureItemById(
  fixtureItems: FlatFixtureTreeItem[],
  fixtureId: FixtureId
) {
  // TODO: Fix this
  return fixtureItems.find(fixtureItem =>
    isEqual(fixtureItem.fixtureId, fixtureId)
  );
}

function getFixtureName({ name, fileName }: FlatFixtureTreeItem) {
  return name ? `${fileName} ${name}` : fileName;
}

const Container = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 4px;
  border-bottom: 1px solid ${white10};
  background: ${grey32};
  white-space: nowrap;
  overflow-x: auto;
`;

const Actions = styled.div`
  > button {
    margin-left: 4px;

    :first-child {
      margin-left: 0;
    }
  }
`;

const Left = styled(Actions)`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Right = styled(Actions)`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ButtonSeparator = styled.div`
  flex-shrink: 0;
  background: ${white10};
  width: 1px;
  height: 40px;
  margin-left: 4px;
`;

const FixtureName = styled.div`
  margin: 0 32px;
  padding: 4px 0;
  color: ${grey176};
  line-height: 24px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;
