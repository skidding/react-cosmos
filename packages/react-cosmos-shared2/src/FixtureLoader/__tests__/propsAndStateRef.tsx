import retry from '@skidding/async-retry';
import until from 'async-until';
import React from 'react';
import { createValues, updateFixtureStateProps } from '../../fixtureState';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { SuffixCounter } from '../testHelpers/components';
import { anyClassState, anyProps, getProps } from '../testHelpers/fixtureState';
import { wrapFixtures } from '../testHelpers/wrapFixture';

let counterRef: null | SuffixCounter = null;
beforeEach(() => {
  counterRef = null;
});

const rendererId = uuid();
const getFixtures = () =>
  wrapFixtures({
    first: (
      <SuffixCounter
        ref={elRef => {
          if (elRef) {
            counterRef = elRef;
          }
        }}
        suffix="times"
      />
    ),
  });
const fixtureId = { path: 'first' };

testFixtureLoader(
  'keeps props when state changes',
  { rendererId, fixtures: getFixtures() },
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
        ...fixtureState,
        props: updateFixtureStateProps({
          fixtureState,
          elementId,
          values: createValues({ suffix: 'timez' }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('0 timez'));

    await until(() => counterRef, { timeout: 1000 });
    counterRef!.setState({ count: 7 });

    await retry(() => expect(renderer.toJSON()).toBe('7 timez'));
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [
          anyProps({
            values: createValues({ suffix: 'timez' }),
          }),
        ],
        classState: [
          anyClassState({
            values: createValues({ count: 7 }),
          }),
        ],
      },
    });
  }
);
