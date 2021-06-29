import { FixtureList, FixtureListItem } from '../renderer';
import { isMultiFixture } from './isMultiFixture';
import {
  ReactFixtureExport,
  ReactFixtureExports,
  ReactFixtureWrapper,
  ReactFixtureWrappers,
} from './shared';

export function getFixtureListFromWrappers(wrappers: ReactFixtureWrappers) {
  return Object.keys(wrappers).reduce((acc: FixtureList, fixturePath) => {
    return { ...acc, [fixturePath]: getItemFromWrapper(wrappers[fixturePath]) };
  }, {});
}

export function getFixtureListFromExports(exports: ReactFixtureExports) {
  return Object.keys(exports).reduce((acc: FixtureList, fixturePath) => {
    return { ...acc, [fixturePath]: getItemFromExport(exports[fixturePath]) };
  }, {});
}

function getItemFromWrapper(wrapper: ReactFixtureWrapper): FixtureListItem {
  return wrapper.lazy
    ? { type: 'unknown' }
    : getItemFromExport(wrapper.module.default);
}

function getItemFromExport(fixtureExport: ReactFixtureExport): FixtureListItem {
  return isMultiFixture(fixtureExport)
    ? { type: 'multi', fixtureNames: Object.keys(fixtureExport) }
    : { type: 'single' };
}
