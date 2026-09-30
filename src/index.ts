/**
 * @mediaput/manifest
 *
 * Validate MediaPut plugin manifest.json files.
 * Works in Node.js (>=16) and modern Browsers.
 *
 * @example Node.js (ESM)
 * ```ts
 * import { validateManifest, validateManifestJson } from '@mediaput/manifest';
 *
 * const result = validateManifestJson(fs.readFileSync('manifest.json', 'utf-8'));
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 *
 * @example Browser (ESM via CDN)
 * ```html
 * <script type="module">
 *   import { validateManifest } from 'https://unpkg.com/@mediaput/manifest/dist/esm/index.js';
 *   const result = validateManifest(window.MY_MANIFEST);
 *   console.log(result.valid);
 * </script>
 * ```
 *
 * @example CommonJS
 * ```js
 * const { validateManifest } = require('@mediaput/manifest');
 * const result = validateManifest(require('./manifest.json'));
 * ```
 */

export {
  validateManifest,
  validateManifestJson,
  assertManifest,
  formatErrors,
  ManifestValidationError,
} from './validator';

export type {
  ValidationError,
  ValidationResult,
  Manifest,
  Author,
  AuthorObject,
  PluginType,
  PluginCategory,
} from './validator';

export { manifestSchema } from './schema';
export type { ManifestSchema } from './schema';
