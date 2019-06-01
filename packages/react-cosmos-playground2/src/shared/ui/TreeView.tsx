import React from 'react';
import { map } from 'lodash';

export type TreeNode<Item> = {
  items: { [itemName: string]: Item };
  dirs: TreeNodeDirs<Item>;
};

export type TreeNodeDirs<Item> = {
  [dirName: string]: TreeNode<Item>;
};

export type TreeExpansion = {
  [nodePath: string]: boolean;
};

type Props<Item> = {
  node: TreeNode<Item>;
  parents: string[];
  treeExpansion: TreeExpansion;
  renderDir: (args: { parents: string[] }) => React.ReactNode;
  renderItem: (args: {
    parents: string[];
    item: Item;
    itemName: string;
  }) => React.ReactNode;
  onToggleExpansion: (nodePath: string, expanded: boolean) => unknown;
};

export function TreeView<Item>({
  node,
  parents,
  treeExpansion,
  renderDir,
  renderItem,
  onToggleExpansion
}: Props<Item>) {
  const { items, dirs } = node;
  const nodePath = getNodePath(parents);
  const isRootNode = parents.length === 0;
  const isExpanded = isRootNode || treeExpansion[nodePath];

  return (
    <>
      {!isRootNode && renderDir({ parents })}
      {isExpanded && (
        <>
          {getSortedNodeDirNames(node).map(dirName => {
            const nextParents = [...parents, dirName];
            return (
              <TreeView
                key={getNodePath(nextParents)}
                node={dirs[dirName]}
                parents={nextParents}
                treeExpansion={treeExpansion}
                renderDir={renderDir}
                renderItem={renderItem}
                onToggleExpansion={onToggleExpansion}
              />
            );
          })}
          {map(items, (item, itemName) =>
            renderItem({ parents, item, itemName })
          )}
        </>
      )}
    </>
  );
}

function getSortedNodeDirNames(node: TreeNode<any>): string[] {
  return (
    Object.keys(node.dirs)
      .slice()
      // Sort alphabetically first
      .sort()
      .sort((dirName1, dirName2) => {
        return (
          calcNodeDepth(node.dirs[dirName2]) -
          calcNodeDepth(node.dirs[dirName1])
        );
      })
  );
}

// Only differentiate between nodes with and without subdirs and ignore
// depth level in the latter
function calcNodeDepth(node: TreeNode<any>): 0 | 1 {
  const hasDirs = Object.keys(node.dirs).length > 0;
  return hasDirs ? 1 : 0;
}

function getNodePath(nodeParents: string[]) {
  return nodeParents.join('/');
}
