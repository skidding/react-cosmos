import { spawn } from 'child-process-promise';
import path from 'path';
import chalk from 'chalk';
import cpy from 'cpy';
import {
  getNodePackages,
  getBrowserPackages,
  getFormattedPackageList,
  getUnnamedArg,
  getBoolArg,
  done,
  error
} from './shared';

const { stdout, stderr } = process;

// NOTE: The watch flag is used as a global in this script
const watch = getBoolArg('watch');

run();

async function run() {
  const nodePackages = await getNodePackages();
  const browserPackages = await getBrowserPackages();
  const buildablePackages = [...nodePackages, ...browserPackages];
  // TODO: Allow shorthand names (shared => react-cosmos-shared2, etc.)
  const pkgName = getUnnamedArg();

  if (pkgName) {
    if (typeof pkgName !== 'string') {
      stderr.write(
        error(`Invalid package name ${chalk.bold(String(pkgName))}!\n`)
      );
      process.exit(1);
      return;
    }

    if (buildablePackages.indexOf(pkgName) === -1) {
      stderr.write(
        error(
          `${chalk.bold(
            pkgName
          )} doesn't exist!\nPackages: ${getFormattedPackageList(
            buildablePackages
          )}`
        )
      );
      process.exit(1);
      return;
    }

    stdout.write(
      `${watch ? 'Build-watching' : 'Building'} ${chalk.bold(pkgName)}...\n`
    );

    if (nodePackages.indexOf(pkgName) !== -1) {
      await buildTsPackage(pkgName);
    } else {
      await buildBrowserPackage(pkgName);
    }
  } else {
    if (watch) {
      // The limitation here is that we need to build browser packages after
      // packages compiled with Babel. This doesn't work out of the box because
      // `buildNodePackage` hangs forever in watch mode.
      stderr.write(
        error(
          `Can't build-watch all packages! Run ${chalk.italic(
            'build PACKAGE --watch'
          )} for one or more packages (in separate terminals)\n`
        )
      );
      process.exit(1);
      return;
    }

    stdout.write(`Building Node packages with TypeScript...\n`);
    // Node packages are built serially because they depend on each other and
    // this way TypeScript ensures their interfaces are compatible
    for (const pkg of nodePackages) {
      await buildTsPackage(pkg);
    }

    stdout.write(`Building browser packages with webpack...\n`);
    await Promise.all(browserPackages.map(buildBrowserPackage));

    stdout.write(`Built ${buildablePackages.length} packages successfully.\n`);
  }
}

async function buildTsPackage(pkgName: string) {
  await copyStaticAssets(pkgName);

  await runBuildTask({
    pkgName,
    cmd: 'tsc',
    args: getTsCliArgs(pkgName)
  });
}

async function buildBrowserPackage(pkgName: string) {
  return runBuildTask({
    pkgName,
    cmd: 'webpack',
    args: getWebpackCliArgs(pkgName),
    env: { NODE_ENV: watch ? 'development' : 'production' }
  });
}

type BuildTaskArgs = {
  pkgName: string;
  cmd: string;
  args: string[];
  env?: {};
};

async function runBuildTask({ pkgName, cmd, args, env = {} }: BuildTaskArgs) {
  const promise = spawn(cmd, args, {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      ...env
    }
  });
  const { childProcess } = promise;

  childProcess.stdout.on('data', data => {
    stdout.write(data);
  });

  childProcess.stderr.on('data', data => {
    stderr.write(data);
  });

  childProcess.on('close', code => {
    if (code) {
      stderr.write(error(`${chalk.bold(pkgName)}\n`));
    } else {
      stdout.write(done(`${chalk.bold(pkgName)}\n`));
    }
  });

  return promise;
}

function getTsCliArgs(pkgName: string) {
  let args = ['-b', `packages/${pkgName}/tsconfig.build.json`];

  if (watch) {
    args = [...args, '--watch'];
  }

  return args;
}

function getWebpackCliArgs(pkgName: string) {
  let args = ['--config', `packages/${pkgName}/webpack.config.js`];

  // Showing webpack output in watch mode because it's nice to get a confirmation
  // that something happened after saving a file
  if (watch) {
    args = [...args, '--watch'];
  } else {
    args = [...args, '--silent'];
  }

  return args;
}

async function copyStaticAssets(pkgName: string) {
  if (pkgName === 'react-cosmos') {
    return cpy('src/server/shared/static/**', `dist/server/shared/static`, {
      cwd: path.join(__dirname, `../packages/react-cosmos`),
      parents: false
    });
  }
}
