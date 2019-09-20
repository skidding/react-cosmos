import React from 'react';
import { FixtureId } from 'react-cosmos-shared2/renderer';
import { ArraySlot } from 'react-plugin';
import styled from 'styled-components';
import { HomeIcon, RefreshCwIcon, XCircleIcon } from '../../shared/icons';
import { DarkIconButton } from '../../shared/ui/buttons';
import { grey216, grey32, white10 } from '../../shared/ui/colors';

type Props = {
  rendererActionOrder: string[];
  selectedFixtureId: null | FixtureId;
  rendererConnected: boolean;
  validFixtureSelected: boolean;
  selectFixture: (fixtureId: FixtureId, fullScreen: boolean) => void;
  unselectFixture: () => void;
};

export const RendererHeader = React.memo(function RendererHeader({
  rendererActionOrder,
  selectedFixtureId,
  rendererConnected,
  validFixtureSelected,
  selectFixture,
  unselectFixture
}: Props) {
  if (!rendererConnected) {
    return (
      <Container>
        <Left>
          <Message>Waiting for renderer...</Message>
        </Left>
      </Container>
    );
  }

  const rendererActionSlot = (
    <ArraySlot name="rendererAction" plugOrder={rendererActionOrder} />
  );

  if (!selectedFixtureId) {
    return (
      <Container>
        <Left>
          <Message>No fixture selected</Message>
        </Left>
        <Right>{rendererActionSlot}</Right>
      </Container>
    );
  }

  if (!validFixtureSelected) {
    return (
      <Container>
        <Left>
          <Message>Fixture not found</Message>
          <DarkIconButton
            icon={<HomeIcon />}
            title="Go home"
            onClick={() => unselectFixture()}
          />
        </Left>
        <Right>{rendererActionSlot}</Right>
      </Container>
    );
  }

  return (
    <Container>
      <Left>
        <DarkIconButton
          icon={<XCircleIcon />}
          title="Close fixture"
          onClick={() => unselectFixture()}
        />
        <DarkIconButton
          icon={<RefreshCwIcon />}
          title="Reload fixture"
          onClick={() => selectFixture(selectedFixtureId, false)}
        />
        <ArraySlot name="fixtureAction" />
      </Left>
      <Right>{rendererActionSlot}</Right>
    </Container>
  );
});

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
  color: ${grey216};
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

const Message = styled.span`
  margin: 0 8px;

  strong {
    font-weight: 600;
  }
`;
