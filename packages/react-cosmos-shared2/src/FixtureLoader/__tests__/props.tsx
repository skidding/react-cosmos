import retry from '@skidding/async-retry';
import React from 'react';
import {
  createValues,
  removeFixtureStateProps,
  updateFixtureStateProps,
} from '../../fixtureState';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { HelloMessage } from '../testHelpers/components';
import { anyProps, getProps } from '../testHelpers/fixtureState';
import { wrapFixtures } from '../testHelpers/wrapFixture';

const rendererId = uuid();
const fixtures = wrapFixtures({
  first: <HelloMessage name="Bianca" />,
});
const fixtureId = { path: 'first' };

testFixtureLoader(
  'captures props',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await retry(() => expect(renderer.toJSON()).toBe('Hello Bianca'));
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [
          anyProps({
            componentName: 'HelloMessage',
            values: createValues({ name: 'Bianca' }),
          }),
        ],
      },
    });
  }
);

testFixtureLoader(
  'overwrites prop',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, setFixtureState, getLastFixtureState }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getProps(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        props: updateFixtureStateProps({
          fixtureState,
          elementId,
          values: createValues({ name: 'B' }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Hello B'));
  }
);

testFixtureLoader(
  'removes prop',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, setFixtureState, getLastFixtureState }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getProps(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        props: updateFixtureStateProps({
          fixtureState,
          elementId,
          values: {},
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Hello Stranger'));
  }
);

testFixtureLoader(
  'clears props',
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
    const [{ elementId }] = getProps(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        props: updateFixtureStateProps({
          fixtureState,
          elementId,
          values: createValues({ name: 'B' }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Hello B'));
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        props: removeFixtureStateProps(fixtureState, elementId),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Hello Bianca'));
    // After the props are removed from the fixture state, the original
    // props are added back through a fixtureStateChange message
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [
          anyProps({
            componentName: 'HelloMessage',
            values: createValues({ name: 'Bianca' }),
          }),
        ],
      },
    });
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
    const [{ elementId }] = getProps(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        props: updateFixtureStateProps({
          fixtureState,
          elementId,
          values: createValues({ name: 'B' }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Hello B'));
    update({
      rendererId,
      fixtures: wrapFixtures({
        first: <HelloMessage name="Petec" />,
      }),
    });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [
          anyProps({
            componentName: 'HelloMessage',
            values: createValues({ name: 'Petec' }),
          }),
        ],
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Hello Petec'));
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
        props: [
          anyProps({
            componentName: 'HelloMessage',
            values: createValues({ name: 'Bianca' }),
          }),
        ],
      },
    });
    update({
      rendererId,
      fixtures: wrapFixtures({
        // HelloMessage element from fixture is gone, and so should the
        // fixture state related to it.
        first: 'Hello all',
      }),
    });
    expect(renderer.toJSON()).toBe('Hello all');
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [],
      },
    });
  }
);
