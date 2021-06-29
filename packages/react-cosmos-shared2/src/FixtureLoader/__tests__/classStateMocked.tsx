import { StateMock } from '@react-mock/state';
import retry from '@skidding/async-retry';
import React from 'react';
import {
  createValues,
  removeFixtureStateClassState,
  updateFixtureStateClassState,
} from '../../fixtureState';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { CoolCounter, Counter } from '../testHelpers/components';
import {
  anyClassState,
  anyProps,
  getClassState,
} from '../testHelpers/fixtureState';
import { wrapFixtures } from '../testHelpers/wrapFixture';

const rendererId = uuid();
const fixtures = wrapFixtures({
  first: (
    <StateMock state={{ count: 5 }}>
      <Counter />
    </StateMock>
  ),
});
const fixtureId = { path: 'first' };

testFixtureLoader(
  'captures mocked state',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await retry(() => expect(renderer.toJSON()).toBe('5 times'));
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [anyProps()],
        classState: [
          anyClassState({
            values: createValues({ count: 5 }),
            componentName: 'Counter',
          }),
        ],
      },
    });
  }
);

testFixtureLoader(
  'overwrites mocked state',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, setFixtureState, getLastFixtureState }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getClassState(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        classState: updateFixtureStateClassState({
          fixtureState,
          elementId,
          values: createValues({ count: 100 }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('100 times'));
    // A second update will provide code coverage for a different branch:
    // the transition between fixture state values
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        classState: updateFixtureStateClassState({
          fixtureState,
          elementId,
          values: createValues({ count: 200 }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('200 times'));
  }
);

testFixtureLoader(
  'removes mocked state property',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, setFixtureState, getLastFixtureState }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getClassState(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        classState: updateFixtureStateClassState({
          fixtureState,
          elementId,
          values: {},
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Missing count'));
  }
);

testFixtureLoader(
  'reverts to mocked state',
  { rendererId, fixtures },
  async ({
    renderer,
    selectFixture,
    setFixtureState,
    fixtureStateChange,
    getLastFixtureState,
  }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getClassState(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        classState: updateFixtureStateClassState({
          fixtureState,
          elementId,
          values: createValues({ count: 10 }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('10 times'));
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        classState: removeFixtureStateClassState(fixtureState, elementId),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('5 times'));
    // After the state is removed from the fixture state, the original
    // state is added back through a fixtureStateChange message
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [anyProps()],
        classState: [
          anyClassState({
            values: createValues({ count: 5 }),
            componentName: 'Counter',
          }),
        ],
      },
    });
  }
);

testFixtureLoader(
  'applies fixture state to replaced component type',
  { rendererId, fixtures },
  async ({
    renderer,
    update,
    selectFixture,
    setFixtureState,
    getLastFixtureState,
  }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getClassState(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        classState: updateFixtureStateClassState({
          fixtureState,
          elementId,
          values: createValues({ count: 50 }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('50 times'));
    update({
      rendererId,
      fixtures: wrapFixtures({
        first: (
          <StateMock state={{ count: 5 }}>
            <CoolCounter />
          </StateMock>
        ),
      }),
    });
    expect(renderer.toJSON()).toBe('50 timez');
  }
);

testFixtureLoader(
  'overwrites fixture state on fixture change',
  { rendererId, fixtures },
  async ({
    renderer,
    update,
    selectFixture,
    setFixtureState,
    fixtureStateChange,
    getLastFixtureState,
  }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getClassState(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        classState: updateFixtureStateClassState({
          fixtureState,
          elementId,
          values: createValues({ count: 6 }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('6 times'));
    // When the fixture changes the fixture state follows along
    update({
      rendererId,
      fixtures: wrapFixtures({
        first: (
          <StateMock state={{ count: 50 }}>
            <Counter />
          </StateMock>
        ),
      }),
    });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [anyProps()],
        classState: [
          anyClassState({
            values: createValues({ count: 50 }),
            componentName: 'Counter',
          }),
        ],
      },
    });
    expect(renderer.toJSON()).toBe('50 times');
  }
);

testFixtureLoader(
  'clears fixture state for removed fixture element',
  { rendererId, fixtures },
  async ({ renderer, update, selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [anyProps()],
        classState: [
          anyClassState({
            values: createValues({ count: 5 }),
            componentName: 'Counter',
          }),
        ],
      },
    });
    update({
      rendererId,
      fixtures: wrapFixtures({
        // Counter element from fixture is gone, and so should the
        // fixture state related to it.
        first: 'No counts for you.',
      }),
    });
    expect(renderer.toJSON()).toBe('No counts for you.');
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [],
        classState: [],
      },
    });
  }
);
