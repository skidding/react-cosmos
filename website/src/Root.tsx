import React from 'react';
import styled from 'styled-components';
import { Header } from './Header';
import { MAX_CONTENT_WIDTH_PX } from './shared';
import { CONTENT_TOP_PADDING_PX, useHeaderScroll } from './useHeaderScroll';
import { useWindowViewport } from './useWindowViewport';
import { useWindowYScroll } from './useWindowYScroll';

export function Root() {
  const windowViewport = useWindowViewport();
  const yScroll = useWindowYScroll();
  const { cropRatio, minimizeRatio } = useHeaderScroll(yScroll);
  const showContent = minimizeRatio === 1;

  return (
    <Container style={{ background: cropRatio > 0.5 ? '#fff' : '#0a2e46' }}>
      <Header
        windowViewport={windowViewport}
        cropRatio={cropRatio}
        minimizeRatio={minimizeRatio}
      />
      <Content style={{ opacity: showContent ? 1 : 0 }}>
        <Section style={{ margin: `50vh 0 0 0` }}>
          <Features>
            <Feature>
              <FeatureTitle>Visual TDD</FeatureTitle>
              <FeatureDescription>
                Develop one component at a time. Isolate the UI you&apos;re
                working on and iterate quickly. Reloading your whole app on
                every change is slowing you down!
              </FeatureDescription>
            </Feature>
            <Feature>
              <FeatureTitle>Component library</FeatureTitle>
              <FeatureDescription>
                From blank states to edge cases, define component states to come
                back to. Your component library keeps you organized and makes a
                great foundation of test cases.
              </FeatureDescription>
            </Feature>
            <Feature>
              <FeatureTitle>Open platform</FeatureTitle>
              <FeatureDescription>
                React Cosmos is simple, but can be used in powerful ways.
                Snapshot and visual regression tests are possible, as well as
                custom integrations tailored to your needs.
              </FeatureDescription>
            </Feature>
          </Features>
        </Section>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => (
          <Section key={i}>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since the 1500s, when an unknown printer took a galley of
            type and scrambled it to make a type specimen book. It has survived
            not only five centuries, but also the leap into electronic
            typesetting, remaining essentially unchanged. It was popularised in
            the 1960s with the release of Letraset sheets containing Lorem Ipsum
            passages, and more recently with desktop publishing software like
            Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is
            simply dummy text of the printing and typesetting industry. Lorem
            Ipsum has been the industry&apos;s standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book. It has survived not only
            five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply
            dummy text of the printing and typesetting industry. Lorem Ipsum has
            been the industry&apos;s standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to
            make a type specimen book. It has survived not only five centuries,
            but also the leap into electronic typesetting, remaining essentially
            unchanged. It was popularised in the 1960s with the release of
            Letraset sheets containing Lorem Ipsum passages, and more recently
            with desktop publishing software like Aldus PageMaker including
            versions of Lorem Ipsum.
          </Section>
        ))}
      </Content>
    </Container>
  );
}

const Container = styled.div`
  padding-top: ${CONTENT_TOP_PADDING_PX}px;
  color: #0a2e46;
`;

const Content = styled.div`
  max-width: ${MAX_CONTENT_WIDTH_PX}px;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 24px;
  line-height: 1.5em;
  transition: 0.4s opacity;
`;

const Section = styled.div`
  margin: 128px 0;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Feature = styled.div`
  max-width: 640px;
  display: flex;
  flex-direction: column;
  text-align: center;

  &:first-child {
    margin-bottom: 128px;
  }
  &:last-child {
    margin-top: 128px;
  }
`;

const FeatureTitle = styled.h2`
  margin: 0;
  padding: 0 0 8px 0;
  font-size: 36px;
  line-height: 36px;
  font-weight: 600;
  letter-spacing: -0.03em;
`;

const FeatureDescription = styled.div`
  font-size: 24px;
  line-height: 30px;
  opacity: 0.8;
`;
