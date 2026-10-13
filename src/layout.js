// Calculs purs (sans API VS Code) : ce qu'il faut afficher sur chaque ligne.
// Testés dans test/layout.test.js.

/** Largeur affichée d'un texte, en tenant compte des tabulations. */
function visualWidth(text, tabSize) {
  let width = 0;
  for (const ch of text) {
    width += ch === '\t' ? tabSize - (width % tabSize) : 1;
  }
  return width;
}

/** Index du premier caractère qui n'est pas une indentation (= longueur si la ligne est blanche). */
function indentLength(text) {
  const match = /^[ \t]*/.exec(text);
  return match[0].length;
}

/**
 * Décorations d'une ligne selon l'alignement.
 * - centre / droite : { kind: 'offset', width, at: 0 } — pousse la ligne entière.
 * - gauche : { kind: 'hide', from: 0, to } — masque l'indentation,
 *            { kind: 'trail', width, at } — la réaffiche après le texte.
 */
function lineDecorations(text, alignment, tabSize) {
  if (alignment !== 'left') {
    return [{ kind: 'offset', width: visualWidth(text, tabSize), at: 0 }];
  }
  const indent = indentLength(text);
  if (indent === 0) return [];
  return [
    { kind: 'hide', from: 0, to: indent },
    { kind: 'trail', width: visualWidth(text.slice(0, indent), tabSize), at: text.length },
  ];
}

/** Marge CSS à gauche de la ligne pour la centrer ou l'aligner à droite. */
function offsetMargin(alignment, width, rightGap) {
  return alignment === 'right'
    ? `0 0 0 max(0px, calc(100cqw - ${width}ch - ${rightGap}))`
    : `0 0 0 max(0px, calc(50cqw - ${width / 2}ch))`;
}

/**
 * Espace laissé à droite du texte aligné à droite. VS Code élargit la zone de défilement de
 * `scrollBeyondLastColumn` caractères + la barre de défilement après la ligne la plus longue :
 * si on mord dessus, la zone s'élargit et le texte part sous la minimap.
 */
function rightGap(scrollBeyondLastColumn) {
  return `calc(${scrollBeyondLastColumn + 1}ch + 14px)`;
}

/**
 * Règles CSS globales, injectées via le CSS nesting dans la règle d'une décoration.
 * `:not(&)` empêche que les sélecteurs soient préfixés par la classe de la décoration.
 */
function globalCss(alignment, languages, gap) {
  const scoped = (suffix) =>
    languages.map((id) => `.editor-instance[data-mode-id="${id}"]:not(&) ${suffix}`).join(', ');

  // La zone de texte sert de référence aux unités cqw et d'ancrage pour le curseur.
  let css = `${scoped('.view-lines')} { container-type: inline-size; anchor-name: --cp-lines; } `;
  // Les guides d'indentation restent calés sur les colonnes d'origine : on les masque.
  css += `${scoped('.view-overlays .core-guide')} { display: none !important; } `;

  if (alignment !== 'left') {
    // Sur une ligne vide, VS Code ne mesure rien et colle le curseur à gauche : on le replace
    // par ancrage sur la zone de texte (le calque des curseurs passe en `static` pour que la
    // zone de texte soit un ancrage valide).
    const left = alignment === 'right' ? `calc(anchor(--cp-lines right) - ${gap})` : 'anchor(--cp-lines center)';
    css +=
      `${scoped('.cursors-layer')} { position: static !important; } ` +
      `${scoped('.cursors-layer > .cursor[style*="; left: 0px;"]')} { left: ${left} !important; }`;
  }
  return css;
}

module.exports = { visualWidth, indentLength, lineDecorations, offsetMargin, rightGap, globalCss };
