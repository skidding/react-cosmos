import React, { Component } from 'react';
import { string, bool, object } from 'prop-types';
import classNames from 'classnames';
import omitBy from 'lodash.omitby';
import localForage from 'localforage';
import { uri } from 'react-querystring-router';
import { HomeIcon, FullScreenIcon, CodeIcon } from '../SvgIcon';
import StarryBg from '../StarryBg';
import FixtureList from '../FixtureList';
import WelcomeScreen from '../WelcomeScreen';
import MissingScreen from '../MissingScreen';
import DragHandle from '../DragHandle';
import styles from './index.less';

export const LEFT_NAV_SIZE = '__cosmos__left-nav-size';

const fixtureExists = (fixtures, component, fixture) =>
  fixtures[component] && fixtures[component].indexOf(fixture) !== -1;

export default class ComponentPlayground extends Component {
  static defaultProps = {
    editor: false,
    fullScreen: false,
  };

  // Exclude params with default values
  static getCleanUrlParams = params =>
    omitBy(params, (val, key) => ComponentPlayground.defaultProps[key] === val);

  state = {
    waitingForLoader: true,
    leftNavSize: 250,
    leftNavIsDragging: false,
  };

  componentDidMount() {
    window.addEventListener('message', this.onMessage, false);

    localForage.getItem(LEFT_NAV_SIZE).then(leftNavSize => {
      if (leftNavSize) {
        this.setState({
          leftNavSize,
        });
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onMessage);
  }

  componentWillReceiveProps({ component, fixture }) {
    const { waitingForLoader, fixtures } = this.state;

    if (!waitingForLoader) {
      const fixtureChanged =
        component !== this.props.component || fixture !== this.props.fixture;

      if (fixtureChanged && fixtureExists(fixtures, component, fixture)) {
        this.loaderFrame.contentWindow.postMessage(
          {
            type: 'fixtureSelect',
            component,
            fixture,
          },
          '*'
        );
      }
    }
  }

  onMessage = ({ data }) => {
    const { type } = data;

    if (type === 'loaderReady') {
      this.onLoaderReady(data);
    } else if (type === 'fixtureListUpdate') {
      this.onFixtureListUpdate(data);
    }
  };

  onLoaderReady({ fixtures }) {
    const { loaderFrame } = this;

    this.setState({
      waitingForLoader: false,
      fixtures,
    });

    const { component, fixture } = this.props;
    if (component && fixture && fixtureExists(fixtures, component, fixture)) {
      loaderFrame.contentWindow.postMessage(
        {
          type: 'fixtureSelect',
          component,
          fixture,
        },
        '*'
      );
    }
  }

  onFixtureListUpdate({ fixtures }) {
    this.setState({
      fixtures,
    });
  }

  onUrlChange = location => {
    this.props.router.goTo(location);
  };

  onLeftNavDrag = leftNavSize => {
    this.setState({
      leftNavSize,
    });

    localForage.setItem(LEFT_NAV_SIZE, leftNavSize);
  };

  onLeftNavDragStart = () => {
    this.setState({ leftNavIsDragging: true });
  };

  onLeftNavDragEnd = () => {
    this.setState({ leftNavIsDragging: false });
  };

  render() {
    return (
      <div className={styles.root}>
        {this.renderInner()}
      </div>
    );
  }

  renderInner() {
    const { fullScreen } = this.props;
    const { waitingForLoader } = this.state;

    if (waitingForLoader || fullScreen) {
      return this.renderContent();
    }

    return [this.renderLeftNav(), this.renderContent()];
  }

  renderContent() {
    const { loaderUri, component, fixture } = this.props;
    const { waitingForLoader, fixtures, leftNavIsDragging } = this.state;
    const isFixtureSelected = !waitingForLoader && Boolean(fixture);
    const isMissingFixtureSelected =
      isFixtureSelected && !fixtureExists(fixtures, component, fixture);
    const isLoaderVisible = isFixtureSelected && !isMissingFixtureSelected;

    return (
      <div key="loader" className={styles.loader}>
        {!isLoaderVisible &&
          <StarryBg>
            {!waitingForLoader &&
              !isFixtureSelected &&
              <WelcomeScreen fixtures={fixtures} />}
            {isMissingFixtureSelected &&
              <MissingScreen componentName={component} fixtureName={fixture} />}
          </StarryBg>}
        <div
          className={styles.loaderFrame}
          style={{
            display: isLoaderVisible ? 'block' : 'none',
          }}
        >
          <iframe
            ref={node => {
              this.loaderFrame = node;
            }}
            src={loaderUri}
          />
        </div>
        <div
          className={styles.loaderFrameOverlay}
          style={{
            display: leftNavIsDragging ? 'block' : 'none',
          }}
        />
      </div>
    );
  }

  renderLeftNav() {
    const { getCleanUrlParams } = ComponentPlayground;
    const { router, component, fixture, editor, fullScreen } = this.props;
    const { fixtures, leftNavSize } = this.state;
    const urlParams = getCleanUrlParams({
      component,
      fixture,
      editor,
      fullScreen,
    });
    const isFixtureSelected = Boolean(fixture);
    const homeClassNames = classNames(styles.button, {
      [styles.selectedButton]: !isFixtureSelected,
    });
    const fixtureEditorClassNames = classNames(styles.button, {
      [styles.selectedButton]: editor,
    });
    const fixtureEditorUrl = uri.stringifyParams(
      getCleanUrlParams({
        component,
        fixture,
        editor: !editor,
      })
    );
    const fullScreenUrl = uri.stringifyParams({
      component,
      fixture,
      fullScreen: true,
    });

    return (
      <div
        key="leftNav"
        className={styles.leftNav}
        style={{
          width: leftNavSize,
        }}
      >
        <div className={styles.leftNavInner}>
          <div className={styles.header}>
            <div className={styles.buttons}>
              <a
                ref="homeButton"
                className={homeClassNames}
                href="/"
                onClick={router.routeLink}
              >
                <HomeIcon />
              </a>
            </div>
            <div className={styles.buttons}>
              {isFixtureSelected &&
                <a
                  ref="fixtureEditorButton"
                  className={fixtureEditorClassNames}
                  href={`/${fixtureEditorUrl}`}
                  onClick={router.routeLink}
                >
                  <CodeIcon />
                </a>}
              {isFixtureSelected &&
                <a
                  ref="fullScreenButton"
                  className={styles.button}
                  href={`/${fullScreenUrl}`}
                  onClick={router.routeLink}
                >
                  <FullScreenIcon />
                </a>}
            </div>
          </div>
          <FixtureList
            fixtures={fixtures}
            urlParams={urlParams}
            onUrlChange={this.onUrlChange}
          />
        </div>
        <DragHandle
          onDrag={this.onLeftNavDrag}
          onDragStart={this.onLeftNavDragStart}
          onDragEnd={this.onLeftNavDragEnd}
        />
      </div>
    );
  }
}

ComponentPlayground.propTypes = {
  router: object.isRequired,
  loaderUri: string.isRequired,
  component: string,
  fixture: string,
  editor: bool,
  fullScreen: bool,
};
