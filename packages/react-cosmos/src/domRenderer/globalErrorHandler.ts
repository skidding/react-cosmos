import { RendererId } from 'react-cosmos-shared2/renderer';
import { WebpackRendererResponse } from 'react-cosmos-shared2/webpack';
import { isInsideCosmosPreviewIframe } from './shared';

let alreadyAdded = false;

export function addGlobalErrorHandler(rendererId: RendererId) {
  if (alreadyAdded) {
    return;
  }

  alreadyAdded = true;
  window.addEventListener('error', () => {
    postMessageToParentWindow({
      type: 'rendererError',
      payload: { rendererId }
    });
  });

  // TODO: Move to packages/react-cosmos/src/plugins/webpack/client/index.ts
  (window as any).onHotReloadError = () =>
    postMessageToParentWindow({
      type: 'rendererHmrFail',
      payload: { rendererId }
    });
}

function postMessageToParentWindow(msg: WebpackRendererResponse) {
  // NOTE: Error messages are not sent from remote renderers, only from
  // iframe preview renderers
  if (isInsideCosmosPreviewIframe()) {
    parent.postMessage(msg, '*');
  }
}
