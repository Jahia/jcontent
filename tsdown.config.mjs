import {defineConfig} from 'tsdown';

export default defineConfig({
    entry: './types/raw/shared/index.d.ts',
    dts: {emitDtsOnly: true, dtsInput: true},
    outDir: './types/bundled'
});
