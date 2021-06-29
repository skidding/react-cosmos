import {
  ReactDecorators,
  ReactFixtureWrappers,
} from 'react-cosmos-shared2/react';
import { DomRendererConfig } from '../../../shared/rendererConfig';

// NOTE: Renderer data is statically injected at compile time
export const rendererConfig: DomRendererConfig = {
  containerQuerySelector: null,
};
export const fixtures: ReactFixtureWrappers = {};
export const decorators: ReactDecorators = {};
