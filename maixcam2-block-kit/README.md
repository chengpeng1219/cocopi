# MaixCAM2 Block Kit

This directory contains the MaixCAM2-only Blockly assets migrated from the
reference CocoBlockly project. It is integrated with the current npm Blockly
runtime instead of replacing the target runtime with legacy compressed files.

## Contents

- `blocks/`: MaixCAM2, screen, camera, audio, vision, IMU, LLM and speech block
  definitions and Python generators.
- `runtime/`: generic legacy dependencies that are not already provided by the
  current Blockly runtime.
- `i18n/messages.json`: messages used by the migrated blocks in Simplified
  Chinese, Hong Kong Traditional Chinese and English.
- `toolbox.json`: filtered MaixCAM2 toolbox XML and the final block type list.
- `samples/pi2/`: all 52 MaixCAM2 XML examples.
- `samples/index.json`: grouped sample index used by the sample dialog.
- `verification.json`: final migration checks.

## Integration

The browser-side loader is `src/lib/maixcam2Kit.js`. It:

- imports the current npm Blockly runtime;
- preserves npm Blockly built-in block definitions;
- adds legacy compatibility for the source project's Python generator,
  fields, messages and mutator-less collection blocks;
- loads only the filtered MaixCAM2 toolbox;
- exposes sample loading and Python generation to `BlocklySection.jsx`.

The sample dialog is `src/components/Maixcam2ExamplesModal.jsx`. Selecting a
sample loads its XML into the workspace, generates Python and closes the dialog.

## Run

```powershell
npm install
npm run dev
```

Open the local URL, then use `样例` in the block toolbox.

## Verification

```powershell
npm test
npm run build
```

The final browser verification found:

- 16 toolbox categories;
- 354 unique toolbox block types;
- no missing block definitions;
- no missing Python generators;
- 52/52 samples loaded and generated Python;
- 52/52 samples contained MaixPy API code;
- 52/52 sample dialogs closed after loading;
- no browser runtime errors.

## Known Limitations

- Legacy source files are loaded in a compatibility scope; they are not copied
  over npm Blockly's compressed runtime.
- The generic source collector blocks retain their data shape, but use simpler
  mutator-less editing controls in the current Blockly version.
- AI examples use MaixPy preset model APIs. Large model files are not embedded
  in this repository and must exist in the device firmware or expected device
  model directory.
- Self-learning examples create runtime model/data files on the device; those
  generated files are not static sample assets.
- The sample XML files reference local runtime output paths such as
  `/root/_rec.wav`, `/root/_m5_test.mp4` and `/root/_media_test.jpg`; these are
  created by the examples when run on the device.
- The migrated legacy sources produce a large lazy-loaded Blockly chunk
  (approximately 3.5 MB minified). The main application shell remains separately
  bundled and the block editor is loaded only when opened.
