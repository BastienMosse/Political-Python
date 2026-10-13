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
 * Indentation maximale (en colonnes) parmi les lignes qui contiennent du texte.
 * Sert de référence pour inverser l'indentation à gauche.
 */
function maxIndentWidth(texts, tabSize) {
  let max = 0;
  for (const text of texts) {
    const indent = indentLength(text);
    if (indent === text.length) continue; // ligne vide ou blanche
    max = Math.max(max, visualWidth(text.slice(0, indent), tabSize));
  }
  return max;
}

/**
 * Décorations d'une ligne selon l'alignement.
 * - gauche : indentation inversée (max du fichier - indentation de la ligne) :
 *            { kind: 'hide', from: 0, to } — masque l'indentation réelle,
 *            { kind: 'pad', width, at } — affiche l'indentation inversée devant le texte.
 * - centre : { kind: 'offset', width, at: 0 } — pousse la ligne entière, indentation comprise.
 * - droite : l'indentation passe à droite du texte, et l'ensemble est poussé contre le bord :
 *            { kind: 'hide', from: 0, to } — masque l'indentation en début de ligne,
 *            { kind: 'offset', width, at } — pousse le texte (placé après la zone masquée),
 *            { kind: 'trail', width, at } — réaffiche l'indentation après le texte.
 */
function lineDecorations(text, alignment, tabSize, maxIndent = 0) {
  if (alignment === 'left') {
    if (text.length === 0) return [];
    const indent = indentLength(text);
    const pad = Math.max(0, maxIndent - visualWidth(text.slice(0, indent), tabSize));
    const decorations = [];
    if (indent > 0) decorations.push({ kind: 'hide', from: 0, to: indent });
    if (pad > 0) decorations.push({ kind: 'pad', width: pad, at: indent });
    return decorations;
  }
  if (alignment === 'center') {
    return [{ kind: 'offset', width: visualWidth(text, tabSize), at: 0 }];
  }
  const indent = indentLength(text);
  const indentWidth = visualWidth(text.slice(0, indent), tabSize);
  const contentWidth = visualWidth(text.slice(indent), tabSize);
  if (indent === 0) return [{ kind: 'offset', width: contentWidth, at: 0 }];
  return [
    { kind: 'hide', from: 0, to: indent },
    { kind: 'offset', width: contentWidth + indentWidth, at: indent },
    { kind: 'trail', width: indentWidth, at: text.length },
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
  // À gauche, les lignes vides restent vides : le curseur à gauche est au bon endroit.
  if (alignment === 'left') return css;

  // Sur une ligne vide, VS Code ne mesure rien et colle le curseur à gauche : on le replace
  // par ancrage sur la zone de texte (le calque des curseurs passe en `static` pour que la
  // zone de texte soit un ancrage valide).
  const left = alignment === 'right' ? `calc(anchor(--cp-lines right) - ${gap})` : 'anchor(--cp-lines center)';
  css +=
    `${scoped('.cursors-layer')} { position: static !important; } ` +
    `${scoped('.cursors-layer > .cursor[style*="; left: 0px;"]')} { left: ${left} !important; }`;
  return css;
}

module.exports = { visualWidth, indentLength, maxIndentWidth, lineDecorations, offsetMargin, rightGap, globalCss };
