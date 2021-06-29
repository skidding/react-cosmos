import retry from '@skidding/async-retry';
import React from 'react';
import { ReactTestRenderer, ReactTestRendererJSON } from 'react-test-renderer';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { wrapFixtures } from '../testHelpers/wrapFixture';
import { useSelect } from '../useSelect';

function createFixtures() {
  const MyComponent = () => {
    const [value, setValue] = useSelect('selectName', {
      options: ['first', 'second', 'third'],
    });
    return (
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value as typeof value)}
      />
    );
  };
  return wrapFixtures({
    first: <MyComponent />,
  });
}

const rendererId = uuid();
const fixtures = createFixtures();
const fixtureId = { path: 'first' };

testFixtureLoader(
  'renders fixture',
  { rendererId, fixtures },
  async ({ renderer, selectFixture }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await rendered(renderer, 'first');
  }
);

testFixtureLoader(
  'creates fixture state',
  { rendererId, fixtures },
  async ({ selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: expect.any(Array),
        controls: {
          selectName: {
            type: 'select',
            options: ['first', 'second', 'third'],
            defaultValue: 'first',
            currentValue: 'first',
          },
        },
      },
    });
  }
);

async function rendered(renderer: ReactTestRenderer, text: string) {
  await retry(() =>
    expect(getSingleRendererElement(renderer).props.value).toEqual(text)
  );
}

function getSingleRendererElement(renderer: ReactTestRenderer) {
  return renderer.toJSON() as ReactTestRendererJSON;
}
