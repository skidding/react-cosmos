import React from 'react';
import { Slot, ArraySlot } from 'react-plugin';
import styled from 'styled-components';
import { useDrag } from '../../shared/ui';

type Props = {
  storageCacheReady: boolean;
  fullScreen: boolean;
  navWidth: number;
  panelWidth: number;
  setNavWidth: (width: number) => unknown;
  setPanelWidth: (width: number) => unknown;
};

// TODO: Only show "right" side if valid fixture is selected
export function Layout({
  storageCacheReady,
  fullScreen,
  navWidth,
  panelWidth,
  setNavWidth,
  setPanelWidth
}: Props) {
  const navDrag = useDrag({
    value: navWidth,
    reverse: false,
    onChange: setNavWidth
  });
  const panelDrag = useDrag({
    value: panelWidth,
    reverse: true,
    onChange: setPanelWidth
  });

  if (!storageCacheReady) {
    return <Container />;
  }

  const previewContainer = (
    <PreviewContainer key="previewContainer">
      <Slot name="rendererPreview" />
      <Slot name="contentOverlay" />
      <ArraySlot name="previewGlobal" />
    </PreviewContainer>
  );

  if (fullScreen) {
    return (
      <Container>
        <Center key="center" zIndex={1}>
          {previewContainer}
        </Center>
        <Layer zIndex={2}>
          <ArraySlot name="global" />
        </Layer>
      </Container>
    );
  }

  const dragging = navDrag.dragging || panelDrag.dragging;
  // z indexes are set here on purpose to show the layer hierarchy at a glance
  return (
    <Container dragging={dragging}>
      <Left width={navWidth} zIndex={2}>
        <Slot name="left" />
        {navDrag.dragging && <DragOverlay />}
        <NavDragHandle ref={navDrag.dragElRef} />
      </Left>
      <Center key="center" zIndex={1}>
        <Slot name="rendererHeader" />
        {previewContainer}
        {dragging && <DragOverlay />}
      </Center>
      <Right width={panelWidth} zIndex={3}>
        <Slot name="right" />
        {panelDrag.dragging && <DragOverlay />}
        <PanelDragHandle ref={panelDrag.dragElRef} />
      </Right>
      <Layer zIndex={4}>
        <ArraySlot name="global" />
      </Layer>
    </Container>
  );
}

const Container = styled.div<{ dragging?: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  cursor: ${props => (props.dragging ? 'col-resize' : 'default')};
`;

const Layer = styled.div<{ zIndex: number }>`
  z-index: ${props => props.zIndex};
`;

const Draggable = styled(Layer)<{ width: number }>`
  flex-shrink: 0;
  position: relative;
  width: ${props => props.width}px;
`;

const Left = styled(Draggable)`
  background: var(--grey1);
`;

const Right = styled(Draggable)`
  background: var(--grey2);
`;

const Center = styled(Layer)`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--grey6);
  color: var(--grey2);
  overflow: hidden;
`;

const PreviewContainer = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const DragHandle = styled.div`
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-clip: content-box;
  cursor: col-resize;
  user-select: none;
`;

const NavDragHandle = styled(DragHandle)`
  right: -2px;
  padding: 0 2px 0 1px;
  background-color: rgba(0, 0, 0, 0.5);
`;

const PanelDragHandle = styled(DragHandle)`
  left: -2px;
  padding: 0 1px 0 2px;
  background-color: rgba(0, 0, 0, 0.3);
`;

// The purpose of DragOverlay is to cover other elements while dragging, such
// as the renderer preview iframe, which sucks up `mousemove` events, or the
// links in the fixture tree view which change the mouse cursor.
const DragOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;