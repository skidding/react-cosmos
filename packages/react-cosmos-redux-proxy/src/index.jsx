import React from 'react';
import omit from 'object.omit';

const defaults = {
  fixtureKey: 'reduxState',
};

export default function createReduxProxy(options) {
  const {
    fixtureKey,
    createStore,
  } = { ...defaults, ...options };

  class ReduxProxy extends React.Component {
    constructor(props) {
      super(props);
      this.onStoreChange = this.onStoreChange.bind(this);

      const fixtureReduxState = props.fixture[fixtureKey];
      if (fixtureReduxState) {
        this.store = createStore(fixtureReduxState);
      }
    }

    getChildContext() {
      return {
        store: this.store,
      };
    }

    componentWillMount() {
      const {
        store,
        onStoreChange,
      } = this;
      if (store) {
        this.storeUnsubscribe = store.subscribe(onStoreChange);
      }
    }

    componentWillUnmount() {
      this.storeUnsubscribe();
    }

    onStoreChange() {
      const {
        fixture,
        onFixtureUpdate,
      } = this.props;
      const updatedState = this.store.getState();

      onFixtureUpdate({
        ...fixture,
        [fixtureKey]: updatedState,
      });
    }

    render() {
      const {
        nextProxy,
        fixture,
        onPreviewRef,
      } = this.props;

      return React.createElement(nextProxy.value, { ...this.props,
        nextProxy: nextProxy.next(),
        // TODO: No longer omit when props will be read from fixture.props
        // https://github.com/skidding/react-cosmos/issues/217
        fixture: omit(fixture, fixtureKey),
        onPreviewRef,
        // Disable StateProxt when Redux state is available, otherwise the entire
        // Redux store would be duplicated from the connect() component's state
        disableLocalState: !!this.store,
      });
    }
  }

  ReduxProxy.propTypes = {
    nextProxy: React.PropTypes.shape({
      value: React.PropTypes.func,
      next: React.PropTypes.func,
    }).isRequired,
    fixture: React.PropTypes.object.isRequired,
    onPreviewRef: React.PropTypes.func.isRequired,
    onFixtureUpdate: React.PropTypes.func.isRequired,
  };

  ReduxProxy.childContextTypes = {
    store: React.PropTypes.object,
  };

  return ReduxProxy;
}
