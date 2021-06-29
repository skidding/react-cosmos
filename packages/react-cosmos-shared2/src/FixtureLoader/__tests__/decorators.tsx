import retry from '@skidding/async-retry';
import React from 'react';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { wrapFixtures } from '../testHelpers/wrapFixture';

type Props = {
  children: React.ReactNode;
};

const rendererId = uuid();
const fixtures = wrapFixtures({
  'src/foo/__fixtures__/default.js': 'Hello!',
});
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18051
const decorators = {
  'src/decorator.js': ({ children }: Props) => <>Decorated at src{children}</>,
  'src/foo/decorator.js': ({ children }: Props) => (
    <>Decorated at src/foo{children}</>
  ),
  'src/bar/decorator.js': ({ children }: Props) => (
    <>Decorated at src/bar{children}</>
  ),
};

testFixtureLoader(
  'renders selected fixture inside decorator',
  { rendererId, fixtures, decorators },
  async ({ renderer, selectFixture }) => {
    const [path] = Object.keys(fixtures);
    await selectFixture({
      rendererId,
      fixtureId: { path },
      fixtureState: {},
    });
    // "src/bar/decorator" should be omitted because it's not a placed in
    // a parent directory of the selected fixture
    await retry(() =>
      expect(renderer.toJSON()).toEqual([
        'Decorated at src',
        'Decorated at src/foo',
        'Hello!',
      ])
    );
  }
);
