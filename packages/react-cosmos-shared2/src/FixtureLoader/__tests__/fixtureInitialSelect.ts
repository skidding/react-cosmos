import retry from '@skidding/async-retry';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { wrapFixtures } from '../testHelpers/wrapFixture';

const rendererId = uuid();
const fixtures = wrapFixtures({
  first: { one: 'First' },
  second: 'Second',
});

testFixtureLoader(
  'renders initially selected named fixture',
  { rendererId, fixtures, selectedFixtureId: { path: 'first', name: 'one' } },
  async ({ renderer }) => {
    await retry(() => expect(renderer.toJSON()).toBe('First'));
  }
);

testFixtureLoader(
  'renders initially selected unnamed fixture',
  { rendererId, fixtures, selectedFixtureId: { path: 'second' } },
  async ({ renderer }) => {
    await retry(() => expect(renderer.toJSON()).toBe('Second'));
  }
);
