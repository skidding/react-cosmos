import { get, set } from 'lodash';
import { FixtureList, FixtureListItem } from '../../renderer';
import { addTreeNodeChild } from '../../util';
import { FixtureTreeNode } from '../shared/types';

export function createRawFixtureTree(fixtures: FixtureList): FixtureTreeNode {
  const rootNode: FixtureTreeNode = {
    data: { type: 'fileDir' },
  };

  Object.keys(fixtures).forEach(fixturePath =>
    addFixturePathToTree(rootNode, fixturePath, fixtures[fixturePath])
  );

  return rootNode;
}

function addFixturePathToTree(
  rootNode: FixtureTreeNode,
  fixturePath: string,
  fixtureItem: FixtureListItem
) {
  const { parents, fileName } = parseFixturePath(fixturePath);

  if (fixtureItem.type == 'unknown') {
    injectNode(rootNode, parents, fileName, {
      data: {
        type: 'unknown',
        fixturePath,
      },
    });
  } else if (fixtureItem.type == 'single') {
    injectNode(rootNode, parents, fileName, {
      data: {
        type: 'fixture',
        fixtureId: { path: fixturePath },
      },
    });
  } else if (fixtureItem.type == 'multi') {
    injectNode(rootNode, parents, fileName, {
      data: {
        type: 'multiFixture',
        fixtureIds: createFixtureIds(fixturePath, fixtureItem.fixtureNames),
      },
    });
  }
}

function parseFixturePath(fixturePath: string) {
  const parents = fixturePath.split('/');

  const rawFixtureName = parents.pop();
  if (!rawFixtureName) throw new Error('Fixture name is empty');

  return {
    parents,
    fileName: removeFixtureNameExtension(rawFixtureName),
  };
}

function removeFixtureNameExtension(fixtureName: string) {
  return fixtureName.replace(/\.(j|t)sx?$/, '');
}

function createFixtureIds(fixturePath: string, fixtureNames: string[]) {
  return fixtureNames.reduce(
    (fixtureIds, fixtureName) => ({
      ...fixtureIds,
      [fixtureName]: { path: fixturePath, name: fixtureName },
    }),
    {}
  );
}

function injectNode(
  rootNode: FixtureTreeNode,
  parents: string[],
  childName: string,
  childNode: FixtureTreeNode
) {
  if (parents.length === 0)
    return addTreeNodeChild(rootNode, childName, childNode);

  let curParentDepth = 1;
  let curParent: FixtureTreeNode;
  do {
    const curParents = parents.slice(0, curParentDepth);
    const curPath = curParents.map(p => `children["${p}"]`).join('.');

    curParent = get(rootNode, curPath);
    if (!curParent) {
      curParent = {
        data: { type: 'fileDir' },
      };
      set(rootNode, curPath, curParent);
    }

    curParentDepth += 1;
  } while (curParentDepth <= parents.length);

  addTreeNodeChild(curParent, childName, childNode);
}
