# Political Python

A VS Code extension that gives your Python code a political side. Purely visual: the file is
never modified, and no sudo is needed.

| Side | Setting | Rendering |
|---|---|---|
| Bayrou, centre | `center` (default) | centred code, indentation on the left of the code |
| Zemmour, right | `right` | right-aligned code, indentation on the left of the code |
| Poutou, left | `left` | left-aligned code, indentation moved to the right of the code (dotted) |

## Usage

- Change side: click the indicator at the bottom right of the status bar, or run
  `Political Python: Choisir son bord politique`.
- Enable / disable: `Political Python: Activer / désactiver`.
- Settings: `politicalPython.alignment`, `politicalPython.enabled`, `politicalPython.languages`.

## Development

```sh
npm test               # unit tests for the layout logic (src/layout.js)
npm run package        # build the .vsix
npm run install-local  # build and install it into VS Code
```

Or press `F5` in VS Code to open an Extension Development Host (try it on `examples/demo.py`).

```
src/
  extension.js   entry point: commands and events
  config.js      settings access
  alignments.js  the three sides (name, icon, labels)
  layout.js      pure logic: per-line decorations, margins and CSS (unit tested)
  decorations.js creation and caching of VS Code decoration types
  renderer.js    applies decorations to visible editors
  statusBar.js   status bar indicator and side picker
```