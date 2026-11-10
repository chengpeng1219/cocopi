# CocoPi Knowledge Sources

This directory contains the source material used to build the offline MaixPy knowledge base.

## Sources

- `examples/`: device-verified or provided runnable examples.
- `errors/`: known device errors, causes, and fixes.
- MaixPy API documentation: <https://wiki.sipeed.com/maixpy/api/index.html>

## Rebuild

```powershell
npm run knowledge:build
```

The generated index is written to:

```text
server/knowledge/generated.json
```

## Add An Example

Put a `.py` file in `examples/`. The filename becomes the searchable title. Prefer descriptive Chinese filenames such as:

```text
摄像头实时预览并绘制矩形.py
```

Use complete standalone programs. The build process extracts imports, APIs, categories, and tags automatically.

## Add An Error

Add or extend a JSON file in `errors/` with this shape:

```json
{
  "id": "display-vo-init-failed",
  "patterns": ["VO init failed"],
  "category": "display",
  "cause": "Display resources are still occupied.",
  "fix": "Stop launcher and multimedia services before initializing display.",
  "example": "systemctl stop launcher.service"
}
```

Do not store API keys, passwords, or other secrets in this directory.

