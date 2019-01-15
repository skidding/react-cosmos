// @flow
/* eslint-env browser */

import React, { Component } from 'react';

type Props = {
  children: React$Node
};

type State = {
  errored: boolean,
  errorMessage: string
};

export class ErrorCatch extends Component<Props, State> {
  state = {
    errored: false,
    errorMessage: ''
  };

  componentDidCatch(error: Error, info: { componentStack: string }) {
    this.setState({
      errored: true,
      errorMessage: `${error.message}\n${info.componentStack}`
    });
  }

  render() {
    return this.state.errored ? this.renderError() : this.props.children;
  }

  renderError() {
    // NOTE: In dev mode this output is overlayed by react-error-overlay,
    // which has greater UI and detail. But the information rendered here is
    // most useful in static exports, where react-error-overlay is missing.
    return (
      <>
        <p>
          <strong>Ouch, something wrong!</strong>
        </p>
        <pre>{this.state.errorMessage}</pre>
        <p>Check console for more info.</p>
      </>
    );
  }
}
