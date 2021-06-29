import until from 'async-until';
import { ReactTestRenderer } from 'react-test-renderer';
import { FixtureState } from '../../fixtureState';
import { ReactDecorators, ReactFixtureWrappers } from '../../react';
import {
  FixtureId,
  FixtureListUpdateResponse,
  FixtureStateChangeResponse,
  RendererId,
  RendererReadyResponse,
  RendererRequest,
  RendererResponse,
  SelectFixtureRequest,
  SetFixtureStateRequest,
  UnselectFixtureRequest,
} from '../../renderer';

export type Message = RendererResponse | RendererRequest;

type GetMessages = () => Message[];

export type FixtureLoaderTestArgs = {
  rendererId: RendererId;
  fixtures: ReactFixtureWrappers;
  selectedFixtureId?: null | FixtureId;
  decorators?: ReactDecorators;
  onErrorReset?: () => unknown;
};

export type RendererConnectMockApi = {
  pingRenderers: () => Promise<unknown>;
  selectFixture: (payload: SelectFixtureRequest['payload']) => Promise<unknown>;
  unselectFixture: (
    payload: UnselectFixtureRequest['payload']
  ) => Promise<unknown>;
  setFixtureState: (
    payload: SetFixtureStateRequest['payload']
  ) => Promise<unknown>;
  rendererReady: (
    payload: RendererReadyResponse['payload']
  ) => Promise<unknown>;
  fixtureListUpdate: (
    payload: FixtureListUpdateResponse['payload']
  ) => Promise<unknown>;
  fixtureStateChange: (
    payload: FixtureStateChangeResponse['payload']
  ) => Promise<unknown>;
  getLastFixtureState: () => Promise<FixtureState>;
};

export type FixtureLoaderTestApi = {
  renderer: ReactTestRenderer;
  update: (args: FixtureLoaderTestArgs) => void;
} & RendererConnectMockApi;

export type FixtureLoaderTestCallback = (
  api: FixtureLoaderTestApi
) => Promise<void>;

type RendererConnectMockArgs = {
  getMessages: GetMessages;
  postMessage: (msg: Message) => unknown;
};

export function createRendererConnectMockApi(
  args: RendererConnectMockArgs
): RendererConnectMockApi {
  return {
    pingRenderers,
    selectFixture,
    unselectFixture,
    setFixtureState,
    rendererReady,
    fixtureListUpdate,
    fixtureStateChange,
    getLastFixtureState,
  };

  async function pingRenderers() {
    return postMessage({
      type: 'pingRenderers',
    });
  }

  async function selectFixture({
    rendererId,
    fixtureId,
    fixtureState,
  }: SelectFixtureRequest['payload']) {
    return postMessage({
      type: 'selectFixture',
      payload: {
        rendererId,
        fixtureId,
        fixtureState,
      },
    });
  }

  async function unselectFixture({
    rendererId,
  }: UnselectFixtureRequest['payload']) {
    return postMessage({
      type: 'unselectFixture',
      payload: {
        rendererId,
      },
    });
  }

  async function setFixtureState({
    rendererId,
    fixtureId,
    fixtureState,
  }: SetFixtureStateRequest['payload']) {
    return postMessage({
      type: 'setFixtureState',
      payload: {
        rendererId,
        fixtureId,
        fixtureState,
      },
    });
  }

  async function rendererReady({
    rendererId,
    fixtures,
  }: RendererReadyResponse['payload']) {
    await untilMessage({
      type: 'rendererReady',
      payload: {
        rendererId,
        fixtures,
      },
    });
  }

  async function fixtureListUpdate({
    rendererId,
    fixtures,
  }: FixtureListUpdateResponse['payload']) {
    await untilMessage({
      type: 'fixtureListUpdate',
      payload: {
        rendererId,
        fixtures,
      },
    });
  }

  async function fixtureStateChange({
    rendererId,
    fixtureId,
    fixtureState,
  }: FixtureStateChangeResponse['payload']) {
    await untilMessage({
      type: 'fixtureStateChange',
      payload: {
        rendererId,
        fixtureId,
        fixtureState,
      },
    });
  }

  async function getLastFixtureState() {
    const msg = await getLastMessageOfType<FixtureStateChangeResponse>(
      'fixtureStateChange'
    );
    return msg.payload.fixtureState;
  }

  async function postMessage(msg: RendererRequest) {
    args.postMessage(msg);
    // This is very convenient because we don't have to await manually for
    // each dispatched event to be fulfilled inside test cases
    await untilMessage(msg);
  }

  async function untilMessage(msg: Message) {
    try {
      await until(
        () => {
          try {
            // Support expect.any(constructor) matches
            // https://jestjs.io/docs/en/expect#expectanyconstructor
            expect(getLastMessage()).toEqual(msg);
            return true;
          } catch (err) {
            return false;
          }
        },
        { timeout: 1000 }
      );
    } catch (err) {
      expect(getLastMessage()).toEqual(msg);
    }
  }

  async function getLastMessageOfType<M extends Message>(
    msgType: string
  ): Promise<M> {
    let lastMsg = null as null | Message;

    try {
      await until(() => {
        lastMsg = getLastMessage();
        return lastMsg && lastMsg.type === msgType;
      });
    } finally {
      if (!lastMsg || lastMsg.type !== msgType) {
        throw new Error(`"${msgType}" message never arrived`);
      }
    }

    return lastMsg as M;
  }

  function getLastMessage(): null | Message {
    const messages = args.getMessages();
    return messages.length === 0 ? null : messages[messages.length - 1];
  }
}
