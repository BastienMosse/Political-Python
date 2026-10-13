// Political Python — un Python aligné au centre, à droite ou à gauche, via CSS, sans sudo.
//
// - Bayrou (centre) : code centré, indentation à gauche du texte.
// - Zemmour (droite) : code aligné à droite, indentation à gauche du texte.
// - Poutou (gauche) : code collé à gauche, indentation déplacée à droite du texte.
//
// Voir README.md (section « Fonctionnement ») pour le détail de la technique.

const vscode = require('vscode');
const config = require('./config');
const { Renderer } = require('./renderer');
const { StatusBar, chooseAlignment, CHOOSE_COMMAND } = require('./statusBar');

function activate(context) {
  const renderer = new Renderer();
  const statusBar = new StatusBar();

  const renderDocument = (document) => {
    for (const editor of vscode.window.visibleTextEditors) {
      if (editor.document === document) renderer.render(editor);
    }
  };

  context.subscriptions.push(
    renderer,
    statusBar,

    vscode.commands.registerCommand(CHOOSE_COMMAND, chooseAlignment),
    vscode.commands.registerCommand('politicalPython.toggle', () => config.update('enabled', !config.isEnabled())),

    vscode.window.onDidChangeVisibleTextEditors((editors) => editors.forEach((e) => renderer.render(e))),
    vscode.window.onDidChangeTextEditorOptions((e) => renderer.render(e.textEditor)),
    vscode.workspace.onDidChangeTextDocument((e) => renderDocument(e.document)),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!config.affectsRendering(e)) return;
      statusBar.update();
      renderer.renderAll();
    }),
  );

  renderer.renderAll();
}

function deactivate() {}

module.exports = { activate, deactivate };
