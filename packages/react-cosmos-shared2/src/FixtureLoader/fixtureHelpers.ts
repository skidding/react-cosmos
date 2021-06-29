import React from 'react';
import { isMultiFixture, ReactFixtureExport, ReactFixtureMap } from '../react';

export function getFixture(
  fixtureExport: ReactFixtureExport,
  fixtureName?: string
): void | React.ReactNode {
  if (!isMultiFixture(fixtureExport)) {
    return fixtureExport;
  }

  // FIXME: Why does fixtureExport need to be cast as ReactFixtureMap when
  // the type predicate returned by isMultiFixture already ensures it?
  const multiFixtureExport: ReactFixtureMap = fixtureExport;

  if (fixtureName) {
    return multiFixtureExport[fixtureName];
  }

  const fixtureNames = Object.keys(multiFixtureExport);
  return multiFixtureExport[fixtureNames[0]];
}
