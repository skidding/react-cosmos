import * as React from 'react';
import {
  RendererRequest,
  OnRendererRequest,
  RendererResponse
} from 'react-cosmos-shared2/renderer';
import { PostMessageProps } from '../shared';

export class PostMessage extends React.Component<PostMessageProps> {
  onMessage: null | OnRendererRequest = null;

  render() {
    const { children } = this.props;
    const { subscribe, unsubscribe, postMessage } = this;

    return children({
      subscribe,
      unsubscribe,
      postMessage
    });
  }

  handleMessage = (msg: { data: RendererRequest }) => {
    if (this.onMessage) {
      this.onMessage(msg.data);
    }
  };

  subscribe = (onMessage: OnRendererRequest) => {
    this.onMessage = onMessage;
    window.addEventListener('message', this.handleMessage, false);
  };

  unsubscribe = () => {
    window.removeEventListener('message', this.handleMessage);
    this.onMessage = null;
  };

  postMessage = (msg: RendererResponse) => {
    parent.postMessage(msg, '*');
  };
}
