/* ================= Einfügen aus PDFs ================= */
function cleanPdf(raw, noHy) {
  let t = String(raw).replace(/\r\n?/g, '\n').replace(/­/g, ''); let hy = 0, ln = 0;
  if (!noHy) t = t.replace(/(\p{L})-[ \t]*\n[ \t]*(\p{Ll})/gu, (m, a, b) => { hy++; return a + b; });
  const lines = t.split('\n');
  const strip = (re, fix) => {
    const nums = []; lines.forEach((l, i) => { const m = l.match(re); if (m && +m[1] % 5 === 0) nums.push([i, +m[1]]); });
    if (nums.length >= 2 && nums.every((x, i) => !i || x[1] > nums[i - 1][1])) nums.forEach(([i]) => { lines[i] = fix(lines[i]); ln++; });
  };
  strip(/^\s*(\d{1,3})\s+\S/, l => l.replace(/^\s*\d{1,3}\s+/, ''));
  strip(/\S\s+(\d{1,3})\s*$/, l => l.replace(/\s+\d{1,3}\s*$/, ''));
  return { t: lines.join('\n'), hy, ln };
}

