import retry from '@skidding/async-retry';
import React from 'react';
import { createValues } from '../../fixtureState';
import { uuid } from '../../util';
import { FixtureCapture } from '../FixtureCapture';
import { testFixtureLoader } from '../testHelpers';
import { HelloMessage } from '../testHelpers/components';
import { anyProps } from '../testHelpers/fixtureState';
import { wrapFixtures } from '../testHelpers/wrapFixture';

function Wrap({ children }: { children: () => React.ReactNode }) {
  return <>{children()}</>;
}
Wrap.cosmosCapture = false;

const rendererId = uuid();
const fixtures = wrapFixtures({
  first: (
    <>
      <Wrap>{() => <HelloMessage name="Bianca" />}</Wrap>
      <Wrap>
        {() => (
          <FixtureCapture decoratorId="mockDecoratorId">
            <HelloMessage name="B" />
          </FixtureCapture>
        )}
      </Wrap>
    </>
  ),
});
const fixtureId = { path: 'first' };

testFixtureLoader(
  'captures props from render callback',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await retry(() =>
      expect(renderer.toJSON()).toEqual(['Hello Bianca', 'Hello B'])
    );
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: [
          anyProps({
            decoratorId: 'mockDecoratorId',
            values: createValues({ name: 'B' }),
          }),
        ],
      },
    });
  }
);
