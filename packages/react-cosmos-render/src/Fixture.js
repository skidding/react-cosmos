// @flow

import { isElement } from 'react-is';
import React, { Component } from 'react';
import { CaptureProps } from './CaptureProps';
import { FixtureContext, EMPTY_FIXTURE_DATA } from './FixtureContext';

import type { Node, Element } from 'react';
import type { FixtureData, FixtureContextValue } from './types';

type Props = {
  children: Node,
  fixtureData: FixtureData,
  onUpdate?: (fixtureData: FixtureData) => mixed
};

// NOTE: Maybe rename to FixtureProvider, and open up Fixture component for
// naming and other customization. Eg.
// <Fixture name="An interesting state" namespace="nested/as/follows">
//   <Button>Click me</button>
// </Fixture>
export class Fixture extends Component<Props, FixtureContextValue> {
  static defaultProps = {
    fixtureData: EMPTY_FIXTURE_DATA
  };

  static getDerivedStateFromProps(props: Props, state: FixtureContextValue) {
    if (props.fixtureData !== state.fixtureData) {
      return {
        fixtureData: props.fixtureData,
        updateFixtureData: state.updateFixtureData
      };
    }

    return null;
  }

  updateFixtureData = (fixtureDataParts: $Shape<FixtureData>) => {
    const { fixtureData, onUpdate } = this.props;

    if (typeof onUpdate === 'function') {
      onUpdate({
        ...fixtureData,
        ...fixtureDataParts
      });
    }
  };

  // Provider value is stored in an object with reference identity to prevent
  // unintentional renders https://reactjs.org/docs/context.html#caveats
  state = {
    fixtureData: this.props.fixtureData,
    updateFixtureData: this.updateFixtureData
  };

  render() {
    const { children } = this.props;

    if (!isElement(children)) {
      return children;
    }

    // $FlowFixMe Flow can't get cues from react-is package
    const element: Element<any> = children;

    return (
      <FixtureContext.Provider value={this.state}>
        <CaptureProps>{element}</CaptureProps>
      </FixtureContext.Provider>
    );
  }
}
