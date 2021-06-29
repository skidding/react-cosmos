import retry from '@skidding/async-retry';
import React from 'react';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { wrapFixtures } from '../testHelpers/wrapFixture';
import { Viewport } from '../Viewport';

const rendererId = uuid();
const fixtures = wrapFixtures({
  first: (
    <Viewport width={320} height={240}>
      yo
    </Viewport>
  ),
});
const fixtureId = { path: 'first' };

testFixtureLoader(
  'renders children',
  { rendererId, fixtures },
  async ({ renderer, selectFixture }) => {
    await selectFixture({
      rendererId,
      fixtureId,
      fixtureState: {},
    });
    await retry(() => expect(renderer.toJSON()).toBe('yo'));
  }
);

testFixtureLoader(
  'creates viewport fixture state',
  { rendererId, fixtures },
  async ({ selectFixture, fixtureStateChange }) => {
    await selectFixture({
      rendererId,
      fixtureId,
      fixtureState: {},
    });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [],
        viewport: { width: 320, height: 240 },
      },
    });
  }
);

testFixtureLoader(
  'updates viewport fixture state',
  { rendererId, fixtures },
  async ({ update, selectFixture, fixtureStateChange }) => {
    await selectFixture({
      rendererId,
      fixtureId,
      fixtureState: {},
    });
    update({
      rendererId,
      fixtures: wrapFixtures({
        first: (
          <Viewport width={640} height={480}>
            yo
          </Viewport>
        ),
      }),
    });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [],
        viewport: { width: 640, height: 480 },
      },
    });
  }
);
