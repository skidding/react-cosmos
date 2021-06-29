import React from 'react';
import {
  createWebSocketsConnect,
  FixtureLoader,
} from 'react-cosmos-shared2/FixtureLoader';
import {
  ReactDecorators,
  ReactFixtureWrappers,
} from 'react-cosmos-shared2/react';
import * as ReactNative from 'react-native';
import parse from 'url-parse';
import { NativeRendererConfig } from './shared/rendererConfig';

const { View, Text, StyleSheet, NativeModules } = ReactNative;

// https://stackoverflow.com/a/53655887/128816
const wsWarning =
  'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?';
if (ReactNative.LogBox) ReactNative.LogBox.ignoreLogs([wsWarning]);
else if (ReactNative.YellowBox)
  ReactNative.YellowBox.ignoreWarnings([wsWarning]);

// TODO: Generate unique ID per device
const rendererId = 'native-renderer';

type Props = {
  rendererConfig: NativeRendererConfig;
  fixtures: ReactFixtureWrappers;
  decorators: ReactDecorators;
};

export function NativeFixtureLoader({
  rendererConfig: { port },
  fixtures,
  decorators,
}: Props) {
  const socketUrl = getSocketUrl(port);
  return (
    <FixtureLoader
      rendererId={rendererId}
      rendererConnect={createWebSocketsConnect(socketUrl)}
      fixtures={fixtures}
      selectedFixtureId={null}
      systemDecorators={[]}
      userDecorators={decorators}
      renderMessage={renderMessage}
    />
  );
}

function getSocketUrl(port: number) {
  const host = parse(NativeModules.SourceCode.scriptURL).hostname;
  return `ws://${host}:${port}`;
}

function renderMessage({ msg }: { msg: string }) {
  return (
    <View style={styles.container}>
      <Text>{msg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
