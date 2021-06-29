import React from 'react';
import { FixtureLoader } from 'react-cosmos-shared2/FixtureLoader';
import {
  ReactDecorators,
  ReactFixtureWrappers,
} from 'react-cosmos-shared2/react';
import { ErrorCatch } from './ErrorCatch';
import { rendererConnect } from './rendererConnect';
import { rendererId } from './rendererId';
import { renderMessage } from './renderMessage';
import { selectedFixtureId } from './selectedFixtureId';

type Props = {
  fixtures: ReactFixtureWrappers;
  decorators: ReactDecorators;
  onErrorReset?: () => unknown;
};
export function DomFixtureLoader({
  fixtures,
  decorators,
  onErrorReset,
}: Props) {
  return (
    <FixtureLoader
      rendererId={rendererId}
      rendererConnect={rendererConnect}
      fixtures={fixtures}
      selectedFixtureId={selectedFixtureId}
      systemDecorators={[ErrorCatch]}
      userDecorators={decorators}
      renderMessage={renderMessage}
      onErrorReset={onErrorReset}
    />
  );
}
