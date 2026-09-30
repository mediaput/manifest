/**
 * MediaPut Plugin Manifest JSON Schema (Draft-07)
 *
 * This schema defines the structure and validation rules for
 * `manifest.json` files used by MediaPut plugins.
 */

import schema from "./schema.json"
export const manifestSchema = schema;
export type ManifestSchema = typeof schema;
