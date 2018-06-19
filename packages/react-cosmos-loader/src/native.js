// @flow

import React, { Component } from 'react';
// https://github.com/facebook/react-native/issues/19797
// $FlowFixMe
import { View, Text, NativeModules } from 'react-native';
import io from 'socket.io-client';
import parse from 'url-parse';
import { getComponents } from 'react-cosmos-voyager2/client';
import {
  getOldSchoolFixturesFromNewStyleComponents,
  normalizeFixtureModules
} from './utils/fixtures-format';
import { connectLoader } from './connect-loader';

import type { Element } from 'react';
import type { Modules, FixtureFile } from 'react-cosmos-flow/module';
import type { Proxy } from 'react-cosmos-flow/proxy';
import type { LoaderNativeOpts, LoaderMessage } from 'react-cosmos-flow/loader';

type Props = {
  options: LoaderNativeOpts,
  modules: {
    fixtureModules: Modules,
    fixtureFiles: Array<FixtureFile>,
    proxies: Array<Proxy>
  }
};

type State = {
  element: ?Element<any>
};

let socket;

export class CosmosNativeLoader extends Component<Props, State> {
  state = {
    element: null
  };

  componentDidMount() {
    const {
      options: { port },
      modules: { fixtureFiles, fixtureModules, proxies }
    } = this.props;

    const components = getComponents({
      fixtureFiles,
      fixtureModules: normalizeFixtureModules(fixtureModules)
    });

    const fixtures = getOldSchoolFixturesFromNewStyleComponents(components);

    socket = io(getSocketUrl(port));
    connectLoader({
      renderer: this.loaderRenderer,
      proxies,
      fixtures,
      subscribe,
      unsubscribe,
      sendMessage
    });
  }

  render() {
    const { element } = this.state;

    if (!element) {
      return (
        <View>
          <Text>No fixture selected</Text>
        </View>
      );
    }

    return element;
  }

  loaderRenderer = (element: Element<*>) => {
    this.setState({
      element
    });

    return {
      unmount: () => {
        this.setState({
          element: null
        });
      }
    };
  };
}

function subscribe(msgHandler) {
  socket.on('cosmos-cmd', msgHandler);
}

function unsubscribe() {
  socket.off('cosmos-cmd');
}

function sendMessage(msg: LoaderMessage) {
  socket.emit('cosmos-cmd', msg);
}

function getSocketUrl(port: number) {
  const host = parse(NativeModules.SourceCode.scriptURL).hostname;

  return `ws://${host}:${port}`;
}
