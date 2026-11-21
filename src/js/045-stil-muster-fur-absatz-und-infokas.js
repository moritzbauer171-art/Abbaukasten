/* ---------- Stil-Muster für Absatz und Infokasten ---------- */
const stL = (x, ys, w, last, h = 2.6, col = '#5A6170') => ys.map((y, i) => `<rect x="${x}" y="${y}" width="${i === ys.length - 1 ? last : w}" height="${h}" rx="${h / 2}" fill="${col}"/>`).join('');
const ST_TEXT = {
  '': { label: 'Normal', d: 'Normaler Absatz', pic: stL(9, [10, 16, 22, 28], 46, 30) },
  einzug: { label: 'Eingerückt', d: 'Mit Einzug links, etwa für Beispiele oder Zitate im Text', pic: '<path d="M7 19h7M11 15.6l3.4 3.4-3.4 3.4" fill="none" stroke="#1F4FA0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' + stL(20, [10, 16, 22, 28], 36, 22) },
  merksatz: { label: 'Merksatz', d: 'Gerahmt in der Blattfarbe', pic: '<rect x="6.9" y="5.9" width="50.2" height="28.2" rx="3.5" fill="#FFFFFF" stroke="#1F4FA0" stroke-width="1.8"/>' + stL(13, [13, 19, 25], 38, 24, 2.6, '#2B2F38') },
  klein: { label: 'Klein', d: 'Kleinere, hellere Schrift für Hinweise', pic: stL(9, [11, 15.5, 20, 24.5, 29], 40, 24, 1.8, '#A3A9B6') }
};
const ST_INFO = {
  '': { label: 'Fläche', d: 'Getönte Fläche mit Balken', pic: '<rect x="6" y="6" width="52" height="28" rx="2" fill="#DCE3F5"/><rect x="6" y="6" width="3.2" height="28" fill="#1F4FA0"/>' + stL(14, [12.5, 18.5, 24.5], 38, 24) },
  rahmen: { label: 'Rahmen', d: 'Nur ein Rahmen, spart Toner', pic: '<rect x="6.9" y="6.9" width="50.2" height="26.2" rx="2.5" fill="#FFFFFF" stroke="#1F4FA0" stroke-width="1.8"/>' + stL(13, [12.5, 18.5, 24.5], 38, 24) },
  linie: { label: 'Linie', d: 'Nur der Balken am Rand, spart Toner', pic: '<rect x="6" y="6" width="3.2" height="28" fill="#1F4FA0"/>' + stL(15, [12.5, 18.5, 24.5], 38, 24) },
  klein: { label: 'Klein', d: 'Fläche mit kleinerer Schrift', pic: '<rect x="6" y="6" width="52" height="28" rx="2" fill="#DCE3F5"/><rect x="6" y="6" width="3.2" height="28" fill="#1F4FA0"/>' + stL(14, [12, 16.5, 21, 25.5], 38, 22, 1.8, '#5A6170') }
};
