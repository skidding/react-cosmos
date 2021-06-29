import { FixtureTreeNode } from '../shared/types';
import { collapseNamedIndexes } from './collapseNamedIndexes';

it('collapses named index fixture', () => {
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      Dashboard: {
        data: { type: 'fileDir' },
        children: {
          Dashboard: {
            data: {
              type: 'fixture',
              fixtureId: { path: 'Dashboard/Dashboard.fixture.js' },
            },
          },
        },
      },
    },
  };
  const collapsedTree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      Dashboard: {
        data: {
          type: 'fixture',
          fixtureId: { path: 'Dashboard/Dashboard.fixture.js' },
        },
      },
    },
  };
  expect(collapseNamedIndexes(tree)).toEqual(collapsedTree);
});

it('collapses nested named index fixture', () => {
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      ui: {
        data: { type: 'fileDir' },
        children: {
          Dashboard: {
            data: { type: 'fileDir' },
            children: {
              Dashboard: {
                data: {
                  type: 'fixture',
                  fixtureId: { path: 'ui/Dashboard/Dashboard.fixture.js' },
                },
              },
            },
          },
        },
      },
    },
  };
  const collapsedTree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      ui: {
        data: { type: 'fileDir' },
        children: {
          Dashboard: {
            data: {
              type: 'fixture',
              fixtureId: { path: 'ui/Dashboard/Dashboard.fixture.js' },
            },
          },
        },
      },
    },
  };
  expect(collapseNamedIndexes(tree)).toEqual(collapsedTree);
});

it('collapses named index fixture (case insensitive)', () => {
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      dashboard: {
        data: { type: 'fileDir' },
        children: {
          Dashboard: {
            data: {
              type: 'fixture',
              fixtureId: { path: 'dashboard/Dashboard.fixture.js' },
            },
          },
        },
      },
    },
  };
  const collapsedTree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      Dashboard: {
        data: {
          type: 'fixture',
          fixtureId: { path: 'dashboard/Dashboard.fixture.js' },
        },
      },
    },
  };
  expect(collapseNamedIndexes(tree)).toEqual(collapsedTree);
});
