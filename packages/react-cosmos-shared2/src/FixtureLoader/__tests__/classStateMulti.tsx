import { StateMock } from '@react-mock/state';
import retry from '@skidding/async-retry';
import React from 'react';
import { createValues, updateFixtureStateClassState } from '../../fixtureState';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { Counter } from '../testHelpers/components';
import {
  anyClassState,
  anyProps,
  getClassState,
} from '../testHelpers/fixtureState';
import { wrapFixtures } from '../testHelpers/wrapFixture';

const rendererId = uuid();
const fixtures = wrapFixtures({
  first: (
    <>
      <StateMock state={{ count: 5 }}>
        <Counter />
      </StateMock>
      <StateMock state={{ count: 10 }}>
        <Counter />
      </StateMock>
    </>
  ),
});
const fixtureId = { path: 'first' };

testFixtureLoader(
  'captures mocked state from multiple instances',
  { rendererId, fixtures },
  async ({ selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [anyProps(), anyProps()],
        classState: [
          anyClassState({
            values: createValues({ count: 5 }),
            componentName: 'Counter',
          }),
          anyClassState({
            values: createValues({ count: 10 }),
            componentName: 'Counter',
          }),
        ],
      },
    });
  }
);

testFixtureLoader(
  'overwrites mocked state in second instances',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, setFixtureState, getLastFixtureState }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [, { elementId }] = getClassState(fixtureState, 2);
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
    await retry(() =>
      expect(renderer.toJSON()).toEqual(['5 times', '100 times'])
    );
  }
);
