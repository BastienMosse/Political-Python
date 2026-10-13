// Création et cache des types de décoration VS Code.
// Les types dépendent de l'alignement : on vide le cache à chaque changement de réglage.

const vscode = require('vscode');
const config = require('./config');
const { offsetMargin, rightGap, globalCss } = require('./layout');

class DecorationTypes {
  constructor() {
    this.cache = new Map();
    this.globalType = undefined;
  }

  /** Recrée tout pour l'alignement courant. */
  reset() {
    this.dispose();
    if (config.isEnabled()) {
      const css = globalCss(config.alignment(), config.languages(), this.gap());
      this.globalType = vscode.window.createTextEditorDecorationType({ textDecoration: `none; ${css}` });
    }
  }

  gap() {
    return rightGap(config.scrollBeyondLastColumn());
  }

  get(key, create) {
    let type = this.cache.get(key);
    if (!type) {
      type = vscode.window.createTextEditorDecorationType(create());
      this.cache.set(key, type);
    }
    return type;
  }

  /** Centre / droite : élément invisible en tête de ligne qui pousse le texte. */
  offset(width) {
    return this.get(`offset:${width}`, () => ({
      before: { contentText: '​', margin: offsetMargin(config.alignment(), width, this.gap()) },
    }));
  }

  /** Gauche : masque l'indentation en début de ligne. */
  hide() {
    return this.get('hide', () => ({ textDecoration: 'none; display: none;' }));
  }

  /** Gauche : réaffiche l'indentation après le texte, en pointillés discrets. */
  trail(width) {
    return this.get(`trail:${width}`, () => ({
      after: { contentText: '·'.repeat(width), color: new vscode.ThemeColor('editorWhitespace.foreground') },
    }));
  }

  all() {
    return [...this.cache.values()];
  }

  dispose() {
    if (this.globalType) this.globalType.dispose();
    this.globalType = undefined;
    this.cache.forEach((t) => t.dispose());
    this.cache.clear();
  }
}

module.exports = { DecorationTypes };
