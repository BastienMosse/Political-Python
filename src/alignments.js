// Les trois bords politiques proposés. `value` est la valeur du réglage `politicalPython.alignment`.

const ALIGNMENTS = [
  {
    value: 'center',
    name: 'Bayrou',
    icon: '$(circle-large-outline)',
    label: '$(circle-large-outline) Bayrou — au centre',
    description: 'code centré, indentation à gauche',
  },
  {
    value: 'right',
    name: 'Zemmour',
    icon: '$(arrow-right)',
    label: '$(arrow-right) Zemmour — à droite',
    description: 'code à droite, indentation à droite',
  },
  {
    value: 'left',
    name: 'Poutou',
    icon: '$(arrow-left)',
    label: '$(arrow-left) Poutou — à gauche',
    description: 'code à gauche, indentation inversée',
  },
];

const DEFAULT_ALIGNMENT = 'center';

function findAlignment(value) {
  return ALIGNMENTS.find((a) => a.value === value) || ALIGNMENTS.find((a) => a.value === DEFAULT_ALIGNMENT);
}

module.exports = { ALIGNMENTS, DEFAULT_ALIGNMENT, findAlignment };
