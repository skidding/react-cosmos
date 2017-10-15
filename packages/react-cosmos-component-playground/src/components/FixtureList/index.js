import React, { Component } from 'react';
import { objectOf, arrayOf, shape, string, func, bool } from 'prop-types';
import { uri } from 'react-querystring-router';
import { SearchIcon } from '../SvgIcon';
import styles from './index.less';
import fixturesToTreeData from './dataMapper';
import filterNodeArray from './filter';
import Tree from '../Tree';

const KEY_S = 83;
const KEY_ESC = 27;

export default class FixtureList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      fixtureTree: fixturesToTreeData(props.fixtures)
    };
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKey);

    // Expose change handler for Cypress to call during tests. The problem is
    // Cypress can't trigger React events at the moment
    // https://github.com/cypress-io/cypress/issues/647
    if (window.Cypress) {
      window.__changePlaygroundSearch = this.onChange;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKey);
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(nextProps.fixtures) !== JSON.stringify(this.props.fixtures)
    ) {
      this.setState({ fixtureTree: fixturesToTreeData(nextProps.fixtures) });
    }
  }

  onWindowKey = e => {
    const isFocused = this.searchInput === document.activeElement;

    if (e.keyCode === KEY_S && !isFocused) {
      // Prevent entering `s` in the search field along with focusing
      e.preventDefault();

      this.searchInput.focus();
    } else if (e.keyCode === KEY_ESC && isFocused) {
      this.setState({
        searchText: ''
      });

      this.searchInput.blur();
    }
  };

  onSearchChange = e => {
    this.setState({ searchText: e.target.value });
  };

  onToggle = (node, expanded) => {
    // Mutates state, specifically a node from state.fixtureTree
    node.expanded = expanded;
    this.forceUpdate();
  };

  onSelect = node => {
    const { urlParams } = this.props;
    // urlParams can have 'global' attributes like editor or fullScreen
    // node.urlParams will have 'local' attributes like component and fixture.
    const mergedParams = {
      ...urlParams,
      ...node.urlParams
    };
    const href = uri.stringifyParams(mergedParams);
    this.props.onUrlChange(href);
  };

  render() {
    const { urlParams } = this.props;
    const { fixtureTree, searchText } = this.state;

    const trimmedSearchText = searchText.trim();
    let filteredFixtureTree = fixtureTree;
    if (trimmedSearchText !== '') {
      filteredFixtureTree = filterNodeArray(fixtureTree, trimmedSearchText);
    }

    return (
      <div className={styles.root}>
        <div className={styles.searchInputContainer}>
          <input
            className={styles.searchInput}
            placeholder="Search..."
            value={searchText}
            onChange={this.onSearchChange}
            ref={node => {
              this.searchInput = node;
            }}
          />
          <SearchIcon />
        </div>
        <div className={styles.list}>
          <Tree
            nodeArray={filteredFixtureTree}
            onSelect={this.onSelect}
            onToggle={this.onToggle}
            searchText={searchText}
            selected={{
              component: urlParams.component,
              fixture: urlParams.fixture
            }}
          />
        </div>
      </div>
    );
  }
}

FixtureList.propTypes = {
  fixtures: objectOf(arrayOf(string)).isRequired,
  urlParams: shape({
    component: string,
    fixture: string,
    editor: bool,
    fullScreen: bool
  }).isRequired,
  onUrlChange: func.isRequired
};
