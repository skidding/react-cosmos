import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { wrapFixtures } from '../testHelpers/wrapFixture';

const rendererId = uuid();
const fixtures = wrapFixtures({
  first: { a: null, b: null, c: null },
  second: null,
});

testFixtureLoader(
  'posts ready response on mount',
  { rendererId, fixtures },
  async ({ rendererReady }) => {
    await rendererReady({
      rendererId,
      fixtures: {
        first: { type: 'multi', fixtureNames: ['a', 'b', 'c'] },
        second: { type: 'single' },
      },
    });
  }
);
