import retry from '@skidding/async-retry';
import { uniq } from 'lodash';
import React from 'react';
import {
  createValues,
  resetFixtureStateProps,
  updateFixtureStateProps,
} from '../../fixtureState';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { HelloMessageCls } from '../testHelpers/components';
import { getProps } from '../testHelpers/fixtureState';
import { wrapFixtures } from '../testHelpers/wrapFixture';

const rendererId = uuid();
const fixtureId = { path: 'first' };

let refs: React.Component[] = [];
beforeEach(() => {
  refs = [];
});

// Intentionally create new ref function on every update to get the ref
// to be called more than once even if the component instance is reused
const getFixtures = () =>
  wrapFixtures({
    first: (
      <HelloMessageCls
        ref={elRef => {
          if (elRef) {
            refs.push(elRef);
          }
        }}
        name="Bianca"
      />
    ),
  });

testFixtureLoader(
  'transitions props (reuses component instance)',
  { rendererId, fixtures: getFixtures() },
  async ({
    renderer,
    update,
    selectFixture,
    setFixtureState,
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
    await retry(() => expect(renderer.toJSON()).toEqual('Hello B'));
    update({ rendererId, fixtures: getFixtures() });
    await retry(() => {
      expect(renderer.toJSON()).toEqual('Hello Bianca');
      expect(uniq(refs).length).toBe(1);
    });
  }
);

testFixtureLoader(
  'resets props (creates new component instance)',
  { rendererId, fixtures: getFixtures() },
  async ({
    renderer,
    update,
    selectFixture,
    setFixtureState,
    getLastFixtureState,
  }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    const fixtureState = await getLastFixtureState();
    const [{ elementId }] = getProps(fixtureState);
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        props: resetFixtureStateProps({
          fixtureState,
          elementId,
          values: createValues({ name: 'B' }),
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toEqual('Hello B'));
    update({ rendererId, fixtures: getFixtures() });
    await retry(() => {
      expect(renderer.toJSON()).toEqual('Hello Bianca');
      expect(uniq(refs).length).toBe(2);
    });
  }
);
