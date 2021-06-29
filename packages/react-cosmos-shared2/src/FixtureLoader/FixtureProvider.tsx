import React from 'react';
import { FixtureState, SetFixtureState } from '../fixtureState';
import {
  getSortedDecoratorsForFixturePath,
  ReactDecorator,
  ReactDecorators,
} from '../react';
import { FixtureId } from '../renderer';
import { FixtureContext } from './FixtureContext';
import { getDecoratedFixtureElement } from './getDecoratedFixtureElement';

type Props = {
  fixtureId: FixtureId;
  fixture: React.ReactNode;
  systemDecorators: ReactDecorator[];
  userDecorators: ReactDecorators;
  fixtureState: FixtureState;
  setFixtureState: SetFixtureState;
  renderMessage?: (args: { msg: string }) => React.ReactNode;
  onErrorReset: () => unknown;
};

export function FixtureProvider({
  fixtureId,
  fixture,
  systemDecorators,
  userDecorators,
  fixtureState,
  setFixtureState,
  onErrorReset,
}: Props) {
  // Prevent unintentional renders https://reactjs.org/docs/context.html#caveats
  const contextValue = React.useMemo(
    () => ({ fixtureState, setFixtureState }),
    [fixtureState, setFixtureState]
  );
  const decoratorProps = React.useMemo(
    () => ({ fixtureState, setFixtureState, onErrorReset }),
    [fixtureState, onErrorReset, setFixtureState]
  );
  const decorators = React.useMemo(
    () => mergeDecorators(fixtureId, systemDecorators, userDecorators),
    [fixtureId, systemDecorators, userDecorators]
  );
  const decoratedFixture = React.useMemo(
    () => getDecoratedFixtureElement(fixture, decorators, decoratorProps),
    [decoratorProps, decorators, fixture]
  );
  return (
    <FixtureContext.Provider value={contextValue}>
      {decoratedFixture}
    </FixtureContext.Provider>
  );
}

function mergeDecorators(
  fixtureId: FixtureId,
  systemDecorators: ReactDecorator[],
  userDecorators: ReactDecorators
) {
  return [
    ...systemDecorators,
    ...getSortedDecoratorsForFixturePath(fixtureId.path, userDecorators),
  ];
}
