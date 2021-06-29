import retry from '@skidding/async-retry';
import React from 'react';
import { ReactTestRenderer, ReactTestRendererJSON } from 'react-test-renderer';
import { uuid } from '../../util';
import { testFixtureLoader } from '../testHelpers';
import { wrapFixtures } from '../testHelpers/wrapFixture';
import { useSelect } from '../useSelect';

type Option = 'first' | 'second' | 'third';

const options: Option[] = ['first', 'second', 'third'];

function createFixtures({ defaultValue }: { defaultValue: Option }) {
  const MyComponent = () => {
    const [value, setValue] = useSelect('selectName', {
      defaultValue,
      options,
    });
    return (
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value as Option)}
      />
    );
  };
  return wrapFixtures({
    first: <MyComponent />,
  });
}

const rendererId = uuid();
const fixtures = createFixtures({ defaultValue: 'first' });
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

testFixtureLoader(
  'reflects fixture state change',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, setFixtureState, getLastFixtureState }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await rendered(renderer, 'first');
    const fixtureState = await getLastFixtureState();
    await setFixtureState({
      rendererId,
      fixtureId,
      fixtureState: {
        ...setFixtureState,
        controls: {
          ...fixtureState.controls,
          selectName: {
            type: 'select',
            options: ['first', 'second', 'third'],
            defaultValue: 'first',
            currentValue: 'second',
          },
        },
      },
    });
    await rendered(renderer, 'second');
  }
);

testFixtureLoader(
  'updates fixture state via setter',
  { rendererId, fixtures },
  async ({ renderer, selectFixture, fixtureStateChange }) => {
    await selectFixture({ rendererId, fixtureId, fixtureState: {} });
    await rendered(renderer, 'first');
    changeValue(renderer, 'second');
    await rendered(renderer, 'second');
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
            currentValue: 'second',
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
    await rendered(renderer, 'first');
    update({
      rendererId,
      fixtures: createFixtures({ defaultValue: 'third' }),
    });
    await rendered(renderer, 'third');
    await fixtureStateChange({
      rendererId,
      fixtureId,
      fixtureState: {
        props: expect.any(Array),
        controls: {
          selectName: {
            type: 'select',
            options: ['first', 'second', 'third'],
            defaultValue: 'third',
            currentValue: 'third',
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

function changeValue(renderer: ReactTestRenderer, value: Option) {
  getSingleRendererElement(renderer).props.onChange({ target: { value } });
}

function getSingleRendererElement(renderer: ReactTestRenderer) {
  return renderer.toJSON() as ReactTestRendererJSON;
}
