/**
 * Author can be either a formatted string or a structured object.
 */
export type ManifestAuthor =
  | string
  | {
      name: string;
      email?: string;
      url?: string;
    };

/**
 * Plugin type enumeration.
 */
export type PluginType = 'Script' | 'Config' | 'Style';

/**
 * Plugin category enumeration.
 */
export type PluginCategory = 'Article' | 'Feed' | 'Video';

/**
 * A valid MediaPut plugin manifest.
 * This type mirrors the JSON Schema definition.
 */
export interface Manifest {
  /** Plugin name (npm-style, supports @scope/name) */
  name: string;
  /** SemVer version string */
  version: string;
  /** Author information */
  author: ManifestAuthor;
  /** Short description (max 200 chars) */
  description?: string;
  /** Plugin type */
  type: PluginType;
  /** Plugin category */
  category: PluginCategory;
  /** Platform code (see https://mediaput.cn/editor/platform) */
  platform_code: string;
}

/**
 * Partial manifest for build-time or scaffolding tools.
 * All fields optional.
 */
export type PartialManifest = Partial<Manifest>;
