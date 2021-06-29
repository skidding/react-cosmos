import React from 'react';
import { getDecoratedFixtureElement } from 'react-cosmos-shared2/FixtureLoader';
import {
  getSortedDecoratorsForFixturePath,
  isMultiFixture,
  ReactDecorator,
  ReactDecorators,
  ReactFixture,
  ReactFixtureMap,
} from 'react-cosmos-shared2/react';
import { FixtureId } from 'react-cosmos-shared2/renderer';
import { CosmosConfig } from './config';
import { getUserModules } from './shared/userDeps';

type Args = {
  cosmosConfig: CosmosConfig;
};

type RenderableFixture = {
  fixtureId: FixtureId;
  getElement: () => React.ReactElement<any>;
};

export const getFixtures = async (args: Args) => getFixturesSync(args);

export function getFixturesSync({ cosmosConfig }: Args) {
  const { fixtures, decorators } = getUserModules(cosmosConfig);

  const result: RenderableFixture[] = [];
  Object.keys(fixtures).forEach(fixturePath => {
    const fixtureExport = fixtures[fixturePath];
    if (isMultiFixture(fixtureExport)) {
      // FIXME: Why does fixtureExport need to be cast as ReactFixtureMap when
      // the type predicate returned by isMultiFixture already ensures it?
      const multiFixtureExport: ReactFixtureMap = fixtureExport;
      Object.keys(fixtureExport).forEach(fixtureName => {
        const fixtureId = { path: fixturePath, name: fixtureName };
        result.push({
          fixtureId,
          getElement: createFixtureElementGetter(
            multiFixtureExport[fixtureName],
            fixturePath,
            decorators
          ),
        });
      });
    } else {
      const fixtureId = { path: fixturePath };
      result.push({
        fixtureId,
        getElement: createFixtureElementGetter(
          fixtureExport,
          fixturePath,
          decorators
        ),
      });
    }
  });

  return result;
}

function createFixtureElementGetter(
  fixture: ReactFixture,
  fixturePath: string,
  decoratorsByPath: ReactDecorators
): () => React.ReactElement<any> {
  const decorators: ReactDecorator[] = getSortedDecoratorsForFixturePath(
    fixturePath,
    decoratorsByPath
  );
  return () =>
    getDecoratedFixtureElement(fixture, decorators, {
      fixtureState: {},
      setFixtureState: () => {},
      onErrorReset: () => {},
    });
}
