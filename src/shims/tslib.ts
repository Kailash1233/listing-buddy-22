// pdf-lib's UMD build does `const { __extends } = tslib_default`, and the
// Worker/Rollup CJS interop resolves that default to `undefined`, which crashed
// brochure generation with:
//   TypeError: Cannot destructure property '__extends' of '__toESM(...).default'
// Aliasing `tslib` to this shim gives it both named AND default exports.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as tslib from "tslib/tslib.es6.mjs";

export * from "tslib/tslib.es6.mjs";
export default tslib;
