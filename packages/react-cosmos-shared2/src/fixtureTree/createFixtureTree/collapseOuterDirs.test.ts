import { FixtureTreeNode } from '../shared/types';
import { collapseOuterDirs } from './collapseOuterDirs';

it('collapses one outer dir', () => {
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      src: {
        data: { type: 'fileDir' },
        children: {
          Dashboard: {
            data: {
              type: 'fixture',
              fixtureId: { path: 'src/Dashboard.fixture.js' },
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
          fixtureId: { path: 'src/Dashboard.fixture.js' },
        },
      },
    },
  };
  expect(collapseOuterDirs(tree)).toEqual(collapsedTree);
});

it('collapses one outer dir (multi fixture)', () => {
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      src: {
        data: { type: 'fileDir' },
        children: {
          Button: {
            data: {
              type: 'multiFixture',
              fixtureIds: {
                normal: { path: 'src/Button.fixture.js', name: 'normal' },
                disabled: { path: 'src/Button.fixture.js', name: 'disabled' },
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
      Button: {
        data: {
          type: 'multiFixture',
          fixtureIds: {
            normal: { path: 'src/Button.fixture.js', name: 'normal' },
            disabled: { path: 'src/Button.fixture.js', name: 'disabled' },
          },
        },
      },
    },
  };
  expect(collapseOuterDirs(tree)).toEqual(collapsedTree);
});

it('collapses multiple outer dirs', () => {
  const tree: FixtureTreeNode = {
    data: { type: 'fileDir' },
    children: {
      src: {
        data: { type: 'fileDir' },
        children: {
          ui: {
            data: { type: 'fileDir' },
            children: {
              admin: {
                data: { type: 'fileDir' },
                children: {
                  Dashboard: {
                    data: {
                      type: 'fixture',
                      fixtureId: { path: 'src/ui/admin/Dashboard.fixture.js' },
                    },
                  },
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
      Dashboard: {
        data: {
          type: 'fixture',
          fixtureId: { path: 'src/ui/admin/Dashboard.fixture.js' },
        },
      },
    },
  };
  expect(collapseOuterDirs(tree)).toEqual(collapsedTree);
});
