import {
  ReactFixtureExport,
  ReactFixtureExports,
  ReactFixtureWrapper,
  ReactFixtureWrappers,
} from '../../react';

export function wrapFixtures(
  fixtureExports: ReactFixtureExports
): ReactFixtureWrappers {
  return Object.keys(fixtureExports).reduce((acc, fixturePath) => {
    return { ...acc, [fixturePath]: wrapFixture(fixtureExports[fixturePath]) };
  }, {});
}

export function wrapFixture(
  fixtureExport: ReactFixtureExport
): ReactFixtureWrapper {
  return { lazy: false, module: { default: fixtureExport } };
}
