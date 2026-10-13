// Indicateur dans la barre d'état et menu de choix du bord politique.

const vscode = require('vscode');
const config = require('./config');
const { ALIGNMENTS, findAlignment } = require('./alignments');

const CHOOSE_COMMAND = 'politicalPython.chooseAlignment';

class StatusBar {
  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.command = CHOOSE_COMMAND;
    this.update();
    this.item.show();
  }

  update() {
    const current = findAlignment(config.alignment());
    this.item.text = `${current.icon} Python ${current.name}`;
    this.item.tooltip = `Political Python : ${current.description}. Cliquer pour changer de bord.`;
  }

  dispose() {
    this.item.dispose();
  }
}

async function chooseAlignment() {
  const current = config.alignment();
  const items = ALIGNMENTS.map((a) => ({ label: a.label, description: a.description, value: a.value, picked: a.value === current }));
  const choice = await vscode.window.showQuickPick(items, { placeHolder: 'Quel bord politique pour votre Python ?' });
  if (choice) await config.update('alignment', choice.value);
}

module.exports = { StatusBar, chooseAlignment, CHOOSE_COMMAND };
