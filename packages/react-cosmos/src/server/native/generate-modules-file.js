import path from 'path';
import { writeFile } from 'fs';
import promisify from 'util.promisify';
import { moduleExists } from 'react-cosmos-shared/server';
import { findFixtureFiles } from 'react-cosmos-voyager2/server';

import type { Config } from 'react-cosmos-flow/config';

const writeFileAsync = promisify(writeFile);

const TEMPLATE = `// This file is automatically generated by Cosmos. Best ignore it.
export const options = {
  port: PORT
};

export function getUserModules() {
  return {
    fixtureModules: FIXTURE_MODULES,
    fixtureFiles: FIXTURE_FILES,
    proxies: PROXIES
  }
};
`;

export async function generateModulesFile(cosmosConfig: Config) {
  const { modulesPath } = cosmosConfig;

  const modules = await generateModuleImports(cosmosConfig);
  await writeFileAsync(modulesPath, modules, 'utf8');

  const relModulesPath = path.relative(process.cwd(), modulesPath);
  console.log(`[Cosmos] Generated ${relModulesPath}`);
}

async function generateModuleImports(cosmosConfig: Config) {
  const {
    rootPath,
    fileMatch,
    fileMatchIgnore,
    exclude,
    proxiesPath,
    port
  } = cosmosConfig;

  const fixtureFiles = await findFixtureFiles({
    rootPath,
    fileMatch,
    fileMatchIgnore,
    exclude
  });
  const fixturePaths = fixtureFiles.map(file => file.filePath);
  const fixtureModuleCalls = convertPathsToRequireCalls(fixturePaths);

  return TEMPLATE.replace(/PORT/, String(port))
    .replace(/FIXTURE_MODULES/g, fixtureModuleCalls)
    .replace(/FIXTURE_FILES/g, JSON.stringify(fixtureFiles))
    .replace(
      /PROXIES/g,
      moduleExists(proxiesPath) ? convertPathToRequireCall(proxiesPath) : '[]'
    );
}

function convertPathsToRequireCalls(paths: Array<string>): string {
  const entries = paths.map(p => `'${p}':${convertPathToRequireCall(p)}`);

  return `{${entries.join(`,`)}}`;
}

function convertPathToRequireCall(p) {
  return `require('${p}')`;
}
