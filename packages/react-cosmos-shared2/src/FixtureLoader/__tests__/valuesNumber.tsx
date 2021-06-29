import retry from '@skidding/async-retry';
import React from 'react';
import { ReactTestRenderer, ReactTestRendererJSON } from 'react-test-renderer';
import { createValue } from '../../fixtureState';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { wrapFixtures } from '../testHelpers/wrapFixture';
import { useValue } from '../useValue';

function createFixtures({ defaultValue }: { defaultValue: number }) {
  const MyComponent = () => {
    const [count, setCount] = useValue('count', { defaultValue });
    return (
      <button onClick={() => setCount(prevCount => prevCount + 1)}>
        {count} clicks
      </button>
    );
  };
  return wrapFixtures({
    first: <MyComponent />,
  });
}

const rendererId = uuid();
const fixtures = createFixtures({ defaultValue: 0 });
const fixtureId = { path: 'first' };

testFixtureLoader(
  'renders fixture',
  { rendererId, fixtures },
  async ({ renderer, selectFixture }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await rendered(renderer, '0 clicks');
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
          count: {
            type: 'standard',
            defaultValue: createValue(0),
            currentValue: createValue(0),
          },
        },
      },
    });
  }
);

testFixtureLoader(
  'updates fixture state via setter',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await rendered(renderer, '0 clicks');
    clickButton(renderer);
    clickButton(renderer);
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: expect.any(Array),
        controls: {
          count: {
            type: 'standard',
            defaultValue: createValue(0),
            currentValue: createValue(2),
          },
        },
      },
    });
  }
);

testFixtureLoader(
  'resets fixture state on default value change',
  { rendererId, fixtures },
  async ({ renderer, update, selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await rendered(renderer, '0 clicks');
    update({
      rendererId,
      fixtures: createFixtures({ defaultValue: 5 }),
    });
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: expect.any(Array),
        controls: {
          count: {
            type: 'standard',
            defaultValue: createValue(5),
            currentValue: createValue(5),
          },
        },
      },
    });
  }
);

function getButtonText(renderer: ReactTestRenderer) {
  return getSingleRendererElement(renderer).children!.join('');
}

async function rendered(renderer: ReactTestRenderer, text: string) {
  await retry(() => expect(getButtonText(renderer)).toEqual(text));
}

function clickButton(renderer: ReactTestRenderer) {
  getSingleRendererElement(renderer).props.onClick();
}

function getSingleRendererElement(renderer: ReactTestRenderer) {
  return renderer.toJSON() as ReactTestRendererJSON;
}
