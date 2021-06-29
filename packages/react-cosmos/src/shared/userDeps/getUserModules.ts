import path from 'path';
import {
  ReactDecorator,
  ReactDecorators,
  ReactFixtureExport,
  ReactFixtureExports,
} from 'react-cosmos-shared2/react';
import slash from 'slash';
import { findUserModulePaths } from '.';
import { CosmosConfig } from '../../config';

type UserModules = {
  fixtures: ReactFixtureExports;
  decorators: ReactDecorators;
};

export function getUserModules({
  rootDir,
  fixturesDir,
  fixtureFileSuffix,
}: CosmosConfig): UserModules {
  const { fixturePaths, decoratorPaths } = findUserModulePaths({
    rootDir,
    fixturesDir,
    fixtureFileSuffix,
  });
  return {
    fixtures: getDefaultExports<ReactFixtureExport>(fixturePaths, rootDir),
    decorators: getDefaultExports<ReactDecorator>(decoratorPaths, rootDir),
  };
}

function getDefaultExports<T>(paths: string[], rootDir: string) {
  const exportsByPath: Record<string, T> = {};
  paths.forEach(p => {
    // Converting to forward slashes on Windows is important because the
    // slashes are used for generating a sorted list of fixtures and
    // decorators.
    const relPath = slash(path.relative(rootDir, p));
    exportsByPath[relPath] = require(p).default;
  });
  return exportsByPath;
}
