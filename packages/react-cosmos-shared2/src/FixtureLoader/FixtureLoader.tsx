import { isEqual } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { FixtureState, SetFixtureState } from '../fixtureState';
import {
  getFixtureListFromWrappers,
  isMultiFixture,
  ReactDecorator,
  ReactDecorators,
  ReactFixtureModule,
  ReactFixtureWrapper,
  ReactFixtureWrappers,
} from '../react';
import {
  FixtureId,
  FixtureList,
  FixtureListItem,
  RendererConnect,
  RendererRequest,
  RendererResponse,
  SelectFixtureRequest,
  SetFixtureStateRequest,
} from '../renderer';
import { getFixture } from './fixtureHelpers';
import { FixtureProvider } from './FixtureProvider';

export type Props = {
  rendererId: string;
  rendererConnect: RendererConnect;
  fixtures: ReactFixtureWrappers;
  selectedFixtureId: null | FixtureId;
  systemDecorators: ReactDecorator[];
  userDecorators: ReactDecorators;
  renderMessage?: (args: { msg: string }) => React.ReactNode;
  onErrorReset?: () => unknown;
};

type SelectedFixture = {
  fixtureId: FixtureId;
  fixtureStatus: 'loading' | 'ready';
  fixtureRef: null | ReactNode;
  fixtureState: FixtureState;
  // Why is this copy of the fixtureState needed? Two reasons:
  // - To avoid posting fixtureStateChange messages with no changes from
  //   the last message
  // - To piggy back on React's setState batching and only send a
  //   fixtureStateChange message when FixtureLoader updates (via cDU),
  //   instead of posting messages in rapid succession as fixture state
  //   changes are dispatched by fixture plugins
  syncedFixtureState: FixtureState;
};

type State = {
  fixtureList: FixtureList;
  selectedFixture: null | SelectedFixture;
  // Used to reset FixtureProvider instance on fixturePath change
  renderKey: number;
};

function getSelectedFixture(props: Props): SelectedFixture | null {
  const { fixtures, selectedFixtureId } = props;
  if (!selectedFixtureId) return null;

  const fixtureWrapper = fixtures[selectedFixtureId.path] as
    | ReactFixtureWrapper
    | undefined;

  if (!fixtureWrapper) {
    return {
      fixtureId: selectedFixtureId,
      fixtureStatus: 'ready',
      fixtureRef: null,
      fixtureState: {},
      syncedFixtureState: {},
    };
  }

  return {
    fixtureId: selectedFixtureId,
    fixtureStatus: fixtureWrapper.lazy ? 'loading' : 'ready',
    fixtureRef: fixtureWrapper.lazy ? null : fixtureWrapper.module.default,
    fixtureState: {},
    syncedFixtureState: {},
  };
}

export class FixtureLoader extends Component<Props, State> {
  state: State = {
    fixtureList: getFixtureListFromWrappers(this.props.fixtures),
    selectedFixture: getSelectedFixture(this.props),
    renderKey: 0,
  };

  unsubscribe: null | (() => unknown) = null;

  componentDidMount() {
    if (!this.props.selectedFixtureId) {
      const { rendererConnect } = this.props;
      this.unsubscribe = rendererConnect.onMessage(this.handleRequest);
      this.postReadyState();
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  componentDidUpdate(prevProps: Props) {
    const { fixtures } = this.props;
    if (!isEqual(fixtures, prevProps.fixtures)) {
      this.setState(
        { fixtureList: getFixtureListFromWrappers(fixtures) },
        this.postFixtureListUpdate
      );
    }

    const { selectedFixture } = this.state;
    if (selectedFixture) {
      const { fixtureId, fixtureState, syncedFixtureState } = selectedFixture;

      // Update module ref
      const fixtureWrapper = fixtures[fixtureId.path] as
        | ReactFixtureWrapper
        | undefined;

      if (fixtureWrapper) {
        if (fixtureWrapper.lazy) {
          fixtureWrapper.getModule().then(this.createModuleLoad(fixtureId));
        } else {
          this.setState({
            selectedFixture: {
              ...selectedFixture,
              fixtureRef: fixtureWrapper.module.default,
            },
          });
        }
      }

      if (fixtureId && !isEqual(fixtureState, syncedFixtureState)) {
        this.postFixtureStateChange(fixtureId, fixtureState);
        this.updateSyncedFixtureState(fixtureState);
      }
    }
  }

  shouldComponentUpdate(prevProps: Props, prevState: State) {
    // This check exists mainly to prevent updating the fixture tree when
    // fixture state setters resulted in no fixture state change
    return !isEqual(this.props, prevProps) || !isEqual(this.state, prevState);
  }

  render() {
    const { selectedFixture } = this.state;
    if (!selectedFixture) {
      return this.renderMessage('No fixture selected.');
    }

    const { fixtures } = this.props;
    const {
      fixtureId,
      fixtureStatus,
      fixtureRef,
      fixtureState,
    } = selectedFixture;
    // Falsy check doesn't do because fixtures can be any Node, including
    // null or undefined.
    if (!fixtures.hasOwnProperty(fixtureId.path)) {
      return this.renderMessage(`Fixture path not found: ${fixtureId.path}`);
    }

    if (fixtureStatus === 'loading') {
      return null;
    }

    // const fixtureExport = fixtures[fixtureId.path];
    const fixture = getFixture(fixtureRef, fixtureId.name);

    if (typeof fixture === 'undefined') {
      return this.renderMessage(
        `Invalid fixture ID: ${JSON.stringify(fixtureId)}`
      );
    }

    const { systemDecorators, userDecorators, onErrorReset } = this.props;
    const { renderKey } = this.state;
    return (
      <FixtureProvider
        // renderKey controls whether to reuse previous instances (and
        // transition props) or rebuild render tree from scratch
        key={renderKey}
        fixtureId={fixtureId}
        fixture={fixture}
        systemDecorators={systemDecorators}
        userDecorators={userDecorators}
        fixtureState={fixtureState}
        setFixtureState={this.setFixtureState}
        onErrorReset={onErrorReset || noop}
      />
    );
  }

  handleRequest = (msg: RendererRequest) => {
    if (msg.type === 'pingRenderers') {
      return this.postReadyState();
    }

    if (!msg.payload || msg.payload.rendererId !== this.props.rendererId) {
      return;
    }

    if (doesRequestChangeFixture(msg)) {
      this.fireChangeCallback();
    }

    switch (msg.type) {
      case 'selectFixture':
        return this.handleSelectFixtureRequest(msg);
      case 'unselectFixture':
        return this.handleUnselectFixtureRequest();
      case 'setFixtureState':
        return this.handleSetFixtureStateRequest(msg);
      default:
      // This Is Fine™
      // Actually, we can't be angry about getting unrelated messages here
      // because we don't do any preliminary message filtering to ignore stuff
      // like browser devtools communication, nor do we have any message
      // metadata conventions in place to perform such filtering at the moment
    }
  };

  handleSelectFixtureRequest({ payload }: SelectFixtureRequest) {
    const { fixtureId, fixtureState } = payload;

    const { fixtures } = this.props;
    const fixtureWrapper = fixtures[fixtureId.path] as
      | ReactFixtureWrapper
      | undefined;

    if (!fixtureWrapper) {
      // Go into "fixture not found" state
      this.setState({
        selectedFixture: {
          fixtureId,
          fixtureStatus: 'ready',
          fixtureRef: null,
          fixtureState: {},
          syncedFixtureState: {},
        },
        renderKey: 0,
      });
      return;
    }

    this.setState({
      selectedFixture: {
        fixtureId,
        fixtureStatus: fixtureWrapper.lazy ? 'loading' : 'ready',
        fixtureRef: fixtureWrapper.lazy ? null : fixtureWrapper.module.default,
        fixtureState,
        syncedFixtureState: fixtureState,
      },
      renderKey: this.state.renderKey + 1,
    });

    if (fixtureWrapper.lazy) {
      fixtureWrapper.getModule().then(this.createModuleLoad(fixtureId));
    }
  }

  handleUnselectFixtureRequest() {
    this.setState({
      selectedFixture: null,
      renderKey: 0,
    });
  }

  handleSetFixtureStateRequest({ payload }: SetFixtureStateRequest) {
    const { fixtureId, fixtureState } = payload;
    const { selectedFixture } = this.state;
    // Ensure fixture state applies to currently selected fixture
    if (selectedFixture && isEqual(fixtureId, selectedFixture.fixtureId)) {
      this.setState({
        selectedFixture: {
          ...selectedFixture,
          fixtureState,
          syncedFixtureState: fixtureState,
        },
      });
    }
  }

  postReadyState() {
    const { rendererId } = this.props;
    this.postMessage({
      type: 'rendererReady',
      payload: {
        rendererId,
        fixtures: this.state.fixtureList,
      },
    });
  }

  postFixtureListUpdate() {
    const { rendererId } = this.props;
    this.postMessage({
      type: 'fixtureListUpdate',
      payload: {
        rendererId,
        fixtures: this.state.fixtureList,
      },
    });
  }

  postFixtureStateChange = (
    fixtureId: FixtureId,
    fixtureState: FixtureState
  ) => {
    const { rendererId } = this.props;
    this.postMessage({
      type: 'fixtureStateChange',
      payload: {
        rendererId,
        fixtureId,
        fixtureState,
      },
    });
  };

  setFixtureState: SetFixtureState = stateUpdate => {
    if (!this.state.selectedFixture) {
      console.warn(
        '[FixtureLoader] Trying to set fixture state with no fixture selected'
      );
      return;
    }

    // Multiple state changes can be dispatched by fixture plugins at almost
    // the same time. Since state changes are batched in React, current state
    // (this.state.fixtureState) can be stale at dispatch time, and extending
    // it can result in cancelling previous state changes that are queued.
    // Using an updater function like ({ prevState }) => nextState ensures
    // every state change is honored, regardless of timing.
    this.setState(({ selectedFixture }: State) => {
      if (!selectedFixture) {
        return null;
      }

      return {
        selectedFixture: {
          ...selectedFixture,
          fixtureState: stateUpdate(selectedFixture.fixtureState),
        },
      };
    });
  };

  fireChangeCallback() {
    const { onErrorReset } = this.props;
    if (typeof onErrorReset === 'function') {
      onErrorReset();
    }
  }

  updateSyncedFixtureState(syncedFixtureState: FixtureState) {
    this.setState(({ selectedFixture }) => {
      if (!selectedFixture) {
        return null;
      }

      // Other updates that alter state.selectedFixture can be pending when this
      // update is submitted. Those updates will be applied first. With this in
      // mind, we use a state setter callback to only override syncedFixtureState
      // and keep the latest values of other state parts.
      return {
        selectedFixture: {
          ...selectedFixture,
          syncedFixtureState,
        },
      };
    });
  }

  postMessage(msg: RendererResponse) {
    this.props.rendererConnect.postMessage(msg);
  }

  renderMessage(msg: string) {
    return typeof this.props.renderMessage !== 'undefined'
      ? this.props.renderMessage({ msg })
      : msg;
  }

  createModuleLoad = (fixtureId: FixtureId) => (module: ReactFixtureModule) => {
    const fixtureExport = module.default;
    const { selectedFixture } = this.state;

    // Fixture changed while module was dynamically importing
    if (!selectedFixture || !isEqual(selectedFixture.fixtureId, fixtureId)) {
      return;
    }

    const fixtureItem: FixtureListItem = isMultiFixture(fixtureExport)
      ? { type: 'multi', fixtureNames: Object.keys(fixtureExport) }
      : { type: 'single' };

    this.setState(
      {
        fixtureList: {
          ...this.state.fixtureList,
          [fixtureId.path]: fixtureItem,
        },
        selectedFixture: {
          ...selectedFixture,
          fixtureStatus: 'ready',
          fixtureRef: fixtureExport,
        },
      },
      this.postFixtureListUpdate
    );
  };
}

function doesRequestChangeFixture(r: RendererRequest) {
  return r.type === 'selectFixture' || r.type === 'unselectFixture';
}

function noop() {}
