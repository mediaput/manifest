import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { manifestSchema } from './schema';

/**
 * Validation error with field path and human-readable message.
 */
export interface ValidationError {
  /** JSON pointer to the invalid field (e.g. "/name", "/author/email") */
  path: string;
  /** The invalid value (sanitized). May be undefined for file-level errors. */
  value?: unknown;
  /** Human-readable error message */
  message: string;
  /** AJV error keyword (e.g. "pattern", "enum", "required") */
  keyword: string;
  /** Optional extra parameters for custom errors */
  params?: Record<string, unknown>;
}

/**
 * Result of a manifest validation.
 */
export interface ValidationResult {
  /** Whether the manifest is valid */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
  /** The validated manifest (cast to Manifest type) */
  manifest?: Manifest;
}

/**
 * Author can be a formatted string or an object.
 */
export interface AuthorObject {
  name: string;
  email?: string;
  url?: string;
}

export type Author = string | AuthorObject;

/**
 * Plugin type enum.
 */
export type PluginType = 'Script' | 'Config' | 'Style';

/**
 * Plugin category enum.
 */
export type PluginCategory = 'Article' | 'Feed' | 'Video';

/**
 * The MediaPut plugin manifest interface.
 */
export interface Manifest {
  /** 插件名称 */
  name: string;
  /** 版本 */
  version: string;
  /** 作者 */
  author: Author;
  /** 插件描述 */
  description?: string;
  /** 类型 */
  type: PluginType;
  /** 分类 */
  category: PluginCategory;
  /** 平台编码 */
  platform_code: string;
  /** 插件入口 */
  main: string;
}

/** Lazy singleton AJV instance (works in Node + Browser) */
let ajvInstance: Ajv | null = null;

function getAjv(): Ajv {
  if (!ajvInstance) {
    ajvInstance = new Ajv({
      allErrors: true,
      strict: false,
      // Use code generation for best performance in both environments
      code: { source: false },
    });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

/** Compiled validation function (lazy) */
let compiledValidate: ValidateFunction | null = null;

function getValidator(): ValidateFunction {
  if (!compiledValidate) {
    const ajv = getAjv();
    compiledValidate = ajv.compile(manifestSchema) as ValidateFunction;
  }
  return compiledValidate;
}

/**
 * Sanitize a value for safe error reporting (avoid dumping huge objects).
 */
function sanitizeValue(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string') {
    return value.length > 100 ? value.slice(0, 100) + '…' : value;
  }
  if (typeof value === 'object') {
    return '[object]';
  }
  return value;
}

/**
 * Convert an AJV error instance path to a friendly dot-path.
 */
function formatPath(instancePath: string): string {
  if (!instancePath) return '(root)';
  return instancePath.replace(/^\//, '').replace(/\//g, '.');
}

/**
 * Generate a human-friendly error message from an AJV error.
 */
function humanizeAjvError(err: ErrorObject): string {
  const params = err.params as Record<string, unknown>;

  switch (err.keyword) {
    case 'required':
      return `Missing required field: "${(params.missingProperty as string) || 'unknown'}"`;
    case 'pattern':
      return `Value does not match required pattern`;
    case 'enum':
      return `Value must be one of: ${(params.allowedValues as string[]).join(', ')}`;
    case 'format':
      return `Value is not a valid ${params.format as string}`;
    case 'maxLength':
      return `Value exceeds maximum length of ${params.limit as number} characters`;
    case 'minLength':
      return `Value must be at least ${params.limit as number} character(s)`;
    case 'type':
      return `Expected type "${params.type as string}", got "${typeof err.data}"`;
    case 'additionalProperties':
      return `Unexpected property: "${(params.additionalProperty as string) || 'unknown'}"`;
    default:
      return err.message || 'Validation failed';
  }
}

/**
 * Validate a manifest object against the MediaPut schema.
 *
 * @param input - The manifest object to validate (parsed JSON)
 * @returns A ValidationResult with errors and the typed manifest
 *
 * @example
 * ```ts
 * import { validateManifest } from '@mediaput/manifest';
 *
 * const result = validateManifest(jsonObject);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateManifest(input: unknown): ValidationResult {
  const validate = getValidator();
  const valid = validate(input);

  if (valid) {
    return {
      valid: true,
      errors: [],
      manifest: input as Manifest,
    };
  }

  const errors: ValidationError[] = (validate.errors || []).map((err) => ({
    path: formatPath(err.instancePath),
    value: sanitizeValue(err.data),
    message: humanizeAjvError(err),
    keyword: err.keyword,
  }));

  return {
    valid: false,
    errors,
  };
}

/**
 * Validate a raw JSON string.
 *
 * @param jsonString - Raw JSON string
 * @returns ValidationResult
 *
 * @example
 * ```ts
 * import { validateManifestJson } from '@mediaput/manifest';
 *
 * const result = validateManifestJson(fs.readFileSync('manifest.json', 'utf-8'));
 * ```
 */
export function validateManifestJson(jsonString: string): ValidationResult & { parseError?: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown parse error';
    return {
      valid: false,
      errors: [
        {
          path: '(root)',
          value: undefined,
          message: `Invalid JSON: ${msg}`,
          keyword: 'parse',
        },
      ],
      parseError: msg,
    };
  }

  return validateManifest(parsed);
}

/**
 * Assert that a manifest is valid, throwing a ManifestValidationError on failure.
 * Useful for build tools and CI pipelines.
 *
 * @param input - The manifest object
 * @throws {ManifestValidationError}
 */
export function assertManifest(input: unknown): asserts input is Manifest {
  const result = validateManifest(input);
  if (!result.valid) {
    throw new ManifestValidationError(result.errors);
  }
}

/**
 * Custom error class for manifest validation failures.
 */
export class ManifestValidationError extends Error {
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = `Manifest validation failed:\n${errors
      .map((e) => `  ✖ [${e.path}] ${e.message}`)
      .join('\n')}`;
    super(message);
    this.name = 'ManifestValidationError';
    this.errors = errors;
  }
}

/**
 * Format validation errors as a human-readable string (CLI-friendly).
 *
 * @param errors - Array of ValidationError
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatErrors(
  errors: ValidationError[],
  options: { color?: boolean; prefix?: string } = {}
): string {
  const { color = false, prefix = '  ✖' } = options;
  const lines = errors.map((e) => {
    const loc = e.path === '(root)' ? '' : ` [${e.path}]`;
    let line = `${prefix}${loc} ${e.message}`;
    if (color) {
      // ANSI red for CI/CLI output
      line = `\x1b[31m${line}\x1b[0m`;
    }
    return line;
  });
  return lines.join('\n');
}
