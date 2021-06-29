import { FixtureListUpdateResponse } from 'react-cosmos-shared2/renderer';
import { RouterSpec } from '../../Router/public';
import { RendererCoreContext } from '../shared';

export function receiveFixtureListUpdateResponse(
  context: RendererCoreContext,
  { payload }: FixtureListUpdateResponse
) {
  const { rendererId, fixtures } = payload;
  const { primaryRendererId } = context.getState();

  // Discard updates from secondary renderers
  if (rendererId !== primaryRendererId) return;

  context.setState(
    prevState => ({ ...prevState, fixtures }),
    () => {
      // Auto-select first fixture after lazy fixture is imported
      // TODO: Instead of this, make it so that name: null selects the first
      // fixture by default
      const router = context.getMethodsOf<RouterSpec>('router');
      const selectedFixtureId = router.getSelectedFixtureId();
      if (selectedFixtureId && selectedFixtureId.name === null) {
        const state = context.getState();
        const fixtureItem = state.fixtures[selectedFixtureId.path];
        if (fixtureItem.type === 'multi') {
          router.selectFixture({
            ...selectedFixtureId,
            name: fixtureItem.fixtureNames[0],
          });
        }
      }
    }
  );
}
