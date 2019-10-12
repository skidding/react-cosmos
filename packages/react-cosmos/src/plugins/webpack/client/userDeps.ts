import {
  ReactDecoratorsByPath,
  ReactFixtureExportsByPath
} from 'react-cosmos-shared2/react';
import { DomRendererConfig } from 'react-cosmos-shared2/renderer';

// NOTE: Renderer data is statically injected at compile time
export const rendererConfig: DomRendererConfig = {
  containerQuerySelector: null
};
export const fixtures: ReactFixtureExportsByPath = {};
export const decorators: ReactDecoratorsByPath = {};
