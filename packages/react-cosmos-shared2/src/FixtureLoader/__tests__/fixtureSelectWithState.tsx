import retry from '@skidding/async-retry';
import React from 'react';
import { createFixtureStateProps, createValues } from '../../fixtureState';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { HelloMessage } from '../testHelpers/components';
import { wrapFixtures } from '../testHelpers/wrapFixture';

const rendererId = uuid();
const fixtures = wrapFixtures({
  first: <HelloMessage name="Bianca" />,
});
const fixtureId = { path: 'first' };

testFixtureLoader(
  'renders selected fixture with fixture state',
  { rendererId, fixtures },
  async ({ renderer, selectFixture }) => {
    await selectFixture({
      rendererId,
      fixtureId,
      fixtureState: {
        props: createFixtureStateProps({
          fixtureState: {},
          elementId: { decoratorId: 'root', elPath: '' },
          values: createValues({ name: 'B' }),
          componentName: 'HelloMessage',
        }),
      },
    });
    await retry(() => expect(renderer.toJSON()).toBe('Hello B'));
  }
);
