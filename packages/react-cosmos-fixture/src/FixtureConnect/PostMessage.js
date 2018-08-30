/* eslint-env browser */
// @flow

import { Component } from 'react';

import type {
  RendererMessage,
  RemoteMessage,
  OnRemoteMessage
} from 'react-cosmos-shared2';
import type { PostMessageProps } from '../../types';

export class PostMessage extends Component<PostMessageProps> {
  onMessage: ?OnRemoteMessage = null;

  render() {
    const { children } = this.props;
    const { subscribe, unsubscribe, postMessage } = this;

    return children({
      subscribe,
      unsubscribe,
      postMessage
    });
  }

  handleMessage = (msg: { data: RemoteMessage }) => {
    if (this.onMessage) {
      this.onMessage(msg.data);
    }
  };

  subscribe = (onMessage: OnRemoteMessage) => {
    this.onMessage = onMessage;
    window.addEventListener('message', this.handleMessage, false);
  };

  unsubscribe = () => {
    window.removeEventListener('message', this.handleMessage);
    this.onMessage = null;
  };

  postMessage = (msg: RendererMessage) => {
    parent.postMessage(msg, '*');
  };
}
