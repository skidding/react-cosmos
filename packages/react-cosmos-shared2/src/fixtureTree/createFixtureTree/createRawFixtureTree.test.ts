import { FixtureList } from '../../renderer';
import { FixtureTreeNode } from '../shared/types';
import { createRawFixtureTree } from './createRawFixtureTree';

it('creates tree with fixture', () => {
  const fixtures: FixtureList = {
    'Dashboard.fixture.js': { type: 'single' },
  };
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      'Dashboard.fixture': {
        data: {
          type: 'fixture',
          fixtureId: { path: 'Dashboard.fixture.js' },
        },
      },
    },
  };
  expect(createRawFixtureTree(fixtures)).toEqual(tree);
});

it('creates nested tree with fixture', () => {
  const fixtures: FixtureList = {
    'ui/Dashboard.fixture.js': { type: 'single' },
  };
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      ui: {
        data: { type: 'fileDir' },
        children: {
          'Dashboard.fixture': {
            data: {
              type: 'fixture',
              fixtureId: { path: 'ui/Dashboard.fixture.js' },
            },
          },
        },
      },
    },
  };
  expect(createRawFixtureTree(fixtures)).toEqual(tree);
});

it('creates tree with multi fixture', () => {
  const fixtures: FixtureList = {
    'Button.fixture.js': {
      type: 'multi',
      fixtureNames: ['normal', 'disabled'],
    },
  };
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      'Button.fixture': {
        data: {
          type: 'multiFixture',
          fixtureIds: {
            normal: { path: 'Button.fixture.js', name: 'normal' },
            disabled: { path: 'Button.fixture.js', name: 'disabled' },
          },
        },
      },
    },
  };
  expect(createRawFixtureTree(fixtures)).toEqual(tree);
});

it('creates nested tree with multi fixture', () => {
  const fixtures: FixtureList = {
    'ui/Button.fixture.js': {
      type: 'multi',
      fixtureNames: ['normal', 'disabled'],
    },
  };
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      ui: {
        data: { type: 'fileDir' },
        children: {
          'Button.fixture': {
            data: {
              type: 'multiFixture',
              fixtureIds: {
                normal: { path: 'ui/Button.fixture.js', name: 'normal' },
                disabled: { path: 'ui/Button.fixture.js', name: 'disabled' },
              },
            },
          },
        },
      },
    },
  };
  expect(createRawFixtureTree(fixtures)).toEqual(tree);
});
