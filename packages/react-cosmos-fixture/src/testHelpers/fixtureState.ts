import {
  FixtureDecoratorId,
  KeyValue,
  FixtureStateValues,
  ComponentFixtureState
} from 'react-cosmos-shared2/fixtureState';

export function createCompFxState(args: {
  decoratorId?: FixtureDecoratorId;
  elPath?: string;
  componentName?: string;
  props?: FixtureStateValues;
  state?: FixtureStateValues;
}): ComponentFixtureState {
  const {
    decoratorId = expect.any(String),
    elPath = expect.any(String),
    componentName = expect.any(String),
    props = null,
    state = null
  } = args;

  return {
    decoratorId,
    elPath,
    componentName,
    renderKey: expect.any(Number),
    props,
    state
  };
}

export function createFxValues(obj: KeyValue): FixtureStateValues {
  return Object.keys(obj).map(key => ({
    serializable: true,
    key,
    stringified: JSON.stringify(obj[key])
  }));
}
