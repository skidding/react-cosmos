import retry from '@skidding/async-retry';
import React from 'react';
import { createValues, updateFixtureStateProps } from '../../fixtureState';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { getProps } from '../testHelpers/fixtureState';
import { wrapFixtures } from '../testHelpers/wrapFixture';

const rendererId = uuid();
const fixtures = createFixtures();
const fixtureId = { path: 'first' };

function createFixtures() {
  function HelloMessage({ name }: { name: string }) {
    return <>{`Hello ${name}`}</>;
  }
  return wrapFixtures({
    first: <HelloMessage name="Theo" />,
  });
}

testFixtureLoader(
  'persists props after type changes reference but keeps name (hmr simulation)',
  { rendererId, fixtures },
  async ({
    renderer,
    update,
    selectFixture,
    getLastFixtureState,
    setFixtureState,
  }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await retry(() => expect(renderer.toJSON()).toBe('Hello Theo'));
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getProps(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        props: updateFixtureStateProps({
          fixtureState,
          elementId,
          values: createValues({ name: 'Theo Von' }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Hello Theo Von'));
    update({ rendererId, fixtures: createFixtures() });
    await retry(() => expect(renderer.toJSON()).toBe('Hello Theo Von'));
  }
);
