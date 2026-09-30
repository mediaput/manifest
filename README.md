# @mediaput/manifest

> Manifest validator for MediaPut plugins. 

[![npm](https://img.shields.io/npm/v/@mediaput/manifest.svg)](https://www.npmjs.com/package/@mediaput/manifest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Features

- ✅ Full JSON Schema Draft-07 validation
- ✅ TypeScript types included
- ✅ Zero native dependencies (pure JS)
- ✅ ESM build
- ✅ Works in all modern browsers

## Install

```bash
npm install @mediaput/manifest
```

## Quick Start

### Browser

```ts
import { parseAndValidate, validateFile } from '@mediaput/manifest';

// From a JSON string
const result = parseAndValidate(jsonText);
console.log(result.valid); // true | false

// From a <input type="file"> element
const file = document.getElementById('manifest-file').files[0];
const result = await validateFile(file);
```

### Type Guard

```ts
import { isManifest } from '@mediaput/manifest';

if (isManifest(json)) {
  // json is now typed as Manifest
  console.log(json.name, json.version);
}
```

## API Reference

### Types

```ts
interface Manifest {
  name: string;          // npm-style: my-plugin or @scope/my-plugin
  version: string;       // SemVer: 1.0.0, 2.3.4-beta.1
  author: string | { name: string; email?: string; url?: string };
  description?: string;  // max 200 chars
  type: 'Script' | 'Config' | 'Style';
  category: 'Article' | 'Feed' | 'Video';
  platform_code: string;
}

interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  params: Record<string, unknown>;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

## Development

```bash
# Clone and install
npm install

# Build (ESM + types)
npm run build

# Run tests
npm test
```

## License

MIT
