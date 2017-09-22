import React, { Component } from 'react';
import {
  objectOf,
  arrayOf,
  shape,
  number,
  string,
  func,
  bool
} from 'prop-types';
import { FolderIcon } from '../SvgIcon';
import Highlighter from 'react-highlight-words';
import styles from './index.less';
import classNames from 'classnames';

const CONTAINER_LEFT_PADDING = 10;
const INDENT_PADDING = 20;

const TreeFolder = ({ node, onSelect, selected, nestingLevel, searchText }) => {
  return (
    <div
      className={styles.component}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(node, !node.expanded);
      }}
    >
      <div
        className={styles.componentName}
        style={{
          paddingLeft: CONTAINER_LEFT_PADDING + nestingLevel * INDENT_PADDING
        }}
        // ref={`componentName-${node.component}`}
      >
        <div className={node.expanded ? styles.arrowDown : styles.arrowRight} />
        <FolderIcon />
        <Highlighter
          searchWords={[searchText]}
          textToHighlight={node.name}
          highlightClassName={styles.searchHighlight}
        />
      </div>
      {node.expanded && (
        <TreeRenderer
          nodeArray={node.children}
          onSelect={onSelect}
          selected={selected}
          nestingLevel={nestingLevel + 1}
          searchText={searchText}
        />
      )}
    </div>
  );
};

const TreeItem = ({ node, onSelect, selected, nestingLevel, searchText }) => {
  const fixtureClassNames = classNames(styles.fixture, {
    [styles.fixtureSelected]:
      node.component === selected.component && node.name === selected.fixture
  });
  return (
    <a
      className={fixtureClassNames}
      style={{
        paddingLeft:
          CONTAINER_LEFT_PADDING + (1 + nestingLevel) * INDENT_PADDING
      }}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(node, true);
      }}
    >
      <Highlighter
        searchWords={[searchText]}
        textToHighlight={node.name}
        highlightClassName={styles.searchHighlight}
      />
    </a>
  );
};

const TreeRenderer = ({
  nodeArray,
  onSelect,
  selected,
  searchText,
  nestingLevel = 0
}) => {
  return (
    <div>
      {nodeArray.map(node => {
        if (node.children)
          return (
            <TreeFolder
              node={node}
              onSelect={onSelect}
              selected={selected}
              nestingLevel={nestingLevel}
              searchText={searchText}
            />
          );
        else
          return (
            <TreeItem
              node={node}
              onSelect={onSelect}
              selected={selected}
              nestingLevel={nestingLevel}
              searchText={searchText}
            />
          );
      })}
    </div>
  );
};

const nodeShape = shape({
  name: string.isRequired,
  component: string.isRequired,
  expanded: bool
});
nodeShape.children = arrayOf(nodeShape);

TreeRenderer.propTypes = {
  nodeArray: arrayOf(nodeShape).isRequired,
  onSelect: func.isRequired,
  selected: shape({
    component: string,
    fixture: string
  }).isRequired,
  searchText: string,
  nestingLevel: number
};

export default TreeRenderer;
