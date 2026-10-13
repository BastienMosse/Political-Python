// Applique les décorations aux éditeurs visibles.

const vscode = require('vscode');
const config = require('./config');
const { lineDecorations, maxIndentWidth } = require('./layout');
const { DecorationTypes } = require('./decorations');

class Renderer {
  constructor() {
    this.types = new DecorationTypes();
  }

  /** À appeler quand un réglage change : recrée les décorations et redessine tout. */
  renderAll() {
    this.types.reset();
    vscode.window.visibleTextEditors.forEach((editor) => this.render(editor));
  }

  render(editor) {
    const active = config.isTarget(editor);
    const rangesByType = new Map();
    const add = (type, range) => {
      if (!rangesByType.has(type)) rangesByType.set(type, []);
      rangesByType.get(type).push(range);
    };

    if (active) {
      const doc = editor.document;
      const tabSize = typeof editor.options.tabSize === 'number' ? editor.options.tabSize : 4;
      const alignment = config.alignment();
      const texts = Array.from({ length: doc.lineCount }, (_, i) => doc.lineAt(i).text);
      const maxIndent = alignment === 'left' ? maxIndentWidth(texts, tabSize) : 0;
      for (let i = 0; i < texts.length; i++) {
        for (const deco of lineDecorations(texts[i], alignment, tabSize, maxIndent)) {
          if (deco.kind === 'offset') add(this.types.offset(deco.width), new vscode.Range(i, deco.at, i, deco.at));
          if (deco.kind === 'hide') add(this.types.hide(), new vscode.Range(i, deco.from, i, deco.to));
          if (deco.kind === 'pad') add(this.types.pad(deco.width), new vscode.Range(i, deco.at, i, deco.at));
          if (deco.kind === 'trail') add(this.types.trail(deco.width), new vscode.Range(i, deco.at, i, deco.at));
        }
      }
    }

    // La décoration globale ne sert qu'à charger les règles CSS : une plage vide suffit.
    if (this.types.globalType) {
      editor.setDecorations(this.types.globalType, active ? [new vscode.Range(0, 0, 0, 0)] : []);
    }
    for (const type of this.types.all()) {
      editor.setDecorations(type, rangesByType.get(type) || []);
    }
  }

  dispose() {
    this.types.dispose();
  }
}

module.exports = { Renderer };
