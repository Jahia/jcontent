import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const require = createRequire(import.meta.url);

// Resolves the actual bin script and runs it via `node <path>` directly, instead of relying on
// the package's shell/cmd bin shims - on Windows, cmd.exe treats a dotted command name like
// `gql.tada` as already having an extension (`.tada`) and tries to open that exact file instead of
// falling back to its `.cmd` shim, which fails or hands the file off to whatever app is associated
// with `.tada` (e.g. Adobe Acrobat) instead of running it.
const runBin = (packageName, binName, args) => {
    const pkgJsonPath = require.resolve(`${packageName}/package.json`);
    const pkg = require(pkgJsonPath);
    const binPath = path.join(path.dirname(pkgJsonPath), pkg.bin[binName]);
    execFileSync(process.execPath, [binPath, ...args], {stdio: 'inherit'});
};

runBin('gql.tada', 'gql.tada', ['generate-output']);
runBin('gql.tada', 'gql.tada', ['turbo']);
execFileSync(process.execPath, [require.resolve('tsdown/run'), '--no-config', '-f', 'esm,cjs', '--dts', 'false'], {stdio: 'inherit'});
