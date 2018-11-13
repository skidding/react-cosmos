// @flow

import React, { Component } from 'react';
import { RENDERER_ID } from 'react-cosmos-shared2/renderer';
import { PlaygroundContext } from '../../PlaygroundContext';
import { PropsState } from './PropsState';

import type { ComponentFixtureState } from 'react-cosmos-shared2/fixtureState';
import type { PlaygroundContextValue } from '../../index.js.flow';
import type { RendererState } from '../RendererResponseHandler';
import type { RouterState } from '../Router';

type Props = {};

export class ControlPanel extends Component<Props> {
  static contextType = PlaygroundContext;

  // FIXME: React team, why is this needed with static contextType?
  context: PlaygroundContextValue;

  render() {
    const { getState } = this.context;
    const { fixtureState }: RendererState = getState('renderer');
    const { fixture: fixturePath }: RouterState = getState('router');

    if (!fixturePath || !fixtureState) {
      return null;
    }

    return (
      <>
        <PropsState
          fixturePath={fixturePath}
          fixtureState={fixtureState}
          setFixtureState={this.setFixtureState}
        />
      </>
    );
  }

  setFixtureState = ({
    fixturePath,
    components
  }: {
    fixturePath: string,
    components: ComponentFixtureState[]
  }) => {
    this.context.emitEvent('renderer.request', {
      type: 'setFixtureState',
      payload: {
        rendererId: RENDERER_ID,
        fixturePath,
        fixtureStateChange: {
          components
        }
      }
    });
  };
}
