import { StateUpdater, Message } from 'react-cosmos-shared2/util';
import { FixtureState } from 'react-cosmos-shared2/fixtureState';
import { RendererId, FixtureList } from 'react-cosmos-shared2/renderer';

export type RendererCoreSpec = {
  name: 'rendererCore';
  state: {
    connectedRendererIds: RendererId[];
    primaryRendererId: null | RendererId;
    fixtures: FixtureList;
    fixtureState: FixtureState;
  };
  methods: {
    getConnectedRendererIds(): RendererId[];
    getPrimaryRendererId(): null | RendererId;
    getFixtures(): FixtureList;
    getFixtureState(): FixtureState;
    isRendererConnected(): boolean;
    isValidFixtureSelected(): boolean;
    setFixtureState(stateUpdater: StateUpdater<FixtureState>): void;
    selectPrimaryRenderer(primaryRendererId: RendererId): void;
    receiveResponse(msg: Message): void;
  };
  events: {
    request(msg: Message): void;
    response(msg: Message): void;
  };
};
