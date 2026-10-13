// Lecture des réglages de l'extension.

const vscode = require('vscode');
const { DEFAULT_ALIGNMENT, findAlignment } = require('./alignments');

const SECTION = 'politicalPython';

function section() {
  return vscode.workspace.getConfiguration(SECTION);
}

function isEnabled() {
  return section().get('enabled', true);
}

function languages() {
  return section().get('languages', ['python']);
}

/** Valeur d'alignement valide ('center' | 'right' | 'left'). */
function alignment() {
  return findAlignment(section().get('alignment', DEFAULT_ALIGNMENT)).value;
}

function scrollBeyondLastColumn() {
  return vscode.workspace.getConfiguration('editor').get('scrollBeyondLastColumn', 4);
}

function isTarget(editor) {
  return isEnabled() && languages().includes(editor.document.languageId);
}

async function update(key, value) {
  await section().update(key, value, vscode.ConfigurationTarget.Global);
}

/** Vrai si le changement de configuration impose de tout redessiner. */
function affectsRendering(event) {
  return event.affectsConfiguration(SECTION) || event.affectsConfiguration('editor.scrollBeyondLastColumn');
}

module.exports = { isEnabled, languages, alignment, scrollBeyondLastColumn, isTarget, update, affectsRendering };
