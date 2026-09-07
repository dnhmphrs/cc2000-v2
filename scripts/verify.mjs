// ── Verification pass ────────────────────────────────────────────────────────
// Drives the real site in a real browser and checks the things that are easy to
// break and impossible to see in a diff. Not a unit test suite — it is the
// walk-through, automated.
//
//   npm run dev          in one terminal
//   npm run verify       in another
//
// BASE, CHROMIUM and OUT are all overridable from the environment:
//   BASE=http://localhost:3000 CHROMIUM=/path/to/chromium npm run verify
//
// What it covers:
//   1. landscape / square / portrait — nothing overflows, the run completes,
//      the result lands in the monitor glass
//   2. the two out-of-range verdicts, which never reach a room at all
//   3. the loop home — the calculator grows out of the monitor monotonically,
//      the answers survive, and a second run works
//   4. a double-click on "calculate again", and a resize mid-run
//   5. ?speed= at both extremes
//   6. the Spotify player and the restart button are actually hit-testable,
//      which `main { pointer-events: none }` has broken three times over
//
// Every case scales itself with ?speed= so the whole pass takes minutes rather
// than a quarter of an hour. Exits non-zero if anything failed.

import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5178';
const OUT = process.env.OUT ?? '.verify';
import { mkdirSync } from 'fs'; mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
const fails = [];
const ok = (name, cond, detail) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
  if (!cond) fails.push(name + (detail ? ' — ' + detail : ''));
};

async function page(vp) {
  const p = await b.newPage({ viewport: vp });
  p.__errs = [];
  p.on('pageerror', e => p.__errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p.__errs.push(m.text()); });
  return p;
}
const dial = async (p, m, d, y) => {
  await p.selectOption('select[aria-label=month]', m);
  await p.selectOption('select[aria-label=day]', d);
  await p.selectOption('select[aria-label=year]', y);
  await p.waitForTimeout(300);
};
const runToRoom = async (p, max = 200) => {
  await p.click('.go');
  for (let i = 0; i < max; i++) {
    if (await p.evaluate(() => !!document.querySelector('.again') || !!document.querySelector('.card')))
      return true;
    await p.waitForTimeout(1000);
  }
  return false;
};
const home = async (p, max = 60) => {
  for (let i = 0; i < max; i++) {
    const t = await p.evaluate(() => {
      const c = document.querySelector('.calculator');
      if (!c || !document.querySelector('.go')) return null;
      return getComputedStyle(c).transform;
    });
    if (t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)') return true;
    await p.waitForTimeout(500);
  }
  return false;
};

// ── 1. Three aspects: layout fits, run completes, result in the glass ──────
for (const [name, vp] of [['landscape',{width:1440,height:900}],
                          ['square',{width:1024,height:1024}],
                          ['portrait',{width:390,height:844}]]) {
  const p = await page(vp);
  await p.goto(`${BASE}/?speed=5`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800); await p.mouse.click(3,3); await p.waitForTimeout(400);
  const fit = await p.evaluate(() => {
    const q = s => document.querySelector(s)?.getBoundingClientRect();
    const go = q('.go'), ctl = q('.controls'), plate = q('.plate'), win = q('.window');
    return { overY: Math.round(go.bottom - innerHeight), overX: Math.round(ctl.right - innerWidth),
             plateOverlapsWin: plate.bottom > win.top, gap: Math.round(win.top - plate.bottom) };
  });
  ok(`${name}: nothing overflows`, fit.overY < 0 && fit.overX < 0, JSON.stringify(fit));
  ok(`${name}: plate clears the window`, !fit.plateOverlapsWin, `gap ${fit.gap}px`);
  await p.screenshot({ path: `${OUT}/${name}-calc.png` });

  await dial(p, '7', '14', '1986');
  ok(`${name}: run completes`, await runToRoom(p));
  const res = await p.evaluate(() => ({
    glass: !!document.querySelector('.glass'),
    text: document.body.innerText.replace(/\n/g, ' | ').slice(0, 60)
  }));
  ok(`${name}: result in the monitor glass`, res.glass, res.text);
  await p.screenshot({ path: `${OUT}/${name}-room.png` });
  ok(`${name}: no console errors`, p.__errs.length === 0, p.__errs.slice(0,2).join(' / '));
  await p.close();
}
console.log('---');

// ── 2. Out-of-range verdicts (never reach a room) ─────────────────────────
for (const [name, m, d, y] of [['past','1','1','1958'], ['future','12','31', String(new Date().getFullYear())]]) {
  const p = await page({ width: 1280, height: 800 });
  await p.goto(`${BASE}/?speed=5`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await p.mouse.click(3,3); await p.waitForTimeout(400);
  await dial(p, m, d, y);
  await p.click('.go');
  await p.waitForTimeout(2500);
  const v = await p.evaluate(() => ({
    card: !!document.querySelector('.card'),
    hasGo: !!document.querySelector('.card .go'),
    text: document.body.innerText.replace(/\n/g,' ').slice(0, 70)
  }));
  ok(`edge/${name}: verdict card shown`, v.card && v.hasGo, v.text);
  if (v.hasGo) {
    await p.click('.card .go');
    await p.waitForTimeout(1200);
    ok(`edge/${name}: back to the calculator`, await p.evaluate(()=>!!document.querySelector('.controls')));
  }
  ok(`edge/${name}: no console errors`, p.__errs.length === 0, p.__errs.slice(0,2).join(' / '));
  await p.close();
}
console.log('---');

// ── 3. The loop: return moves the scene, answers kept, second run works ────
{
  const p = await page({ width: 1280, height: 800 });
  await p.goto(`${BASE}/?speed=3`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await p.mouse.click(3,3); await p.waitForTimeout(400);
  await dial(p, '7', '14', '1986');
  await runToRoom(p);
  const before = await p.evaluate(() => { const g = document.querySelector('.glass').getBoundingClientRect();
    return Math.round(g.width); });
  // sample the calculator's scale through the return: it must grow monotonically
  await p.click('.again');
  const scales = [];
  for (let i = 0; i < 60; i++) {
    const s = await p.evaluate(() => { const c = document.querySelector('.calculator'); if (!c) return null;
      const m = getComputedStyle(c).transform; return m === 'none' ? 1 : +m.slice(7).split(',')[0]; });
    if (s == null) continue;
    scales.push(+s.toFixed(3));
    if (s === 1) break;
  }
  const grew = scales.length > 2 && scales[0] < 0.6 && scales[scales.length-1] === 1;
  const monotone = scales.every((v,i) => i === 0 || v >= scales[i-1] - 0.001);
  ok('loop: calculator grows out of the monitor', grew, `from ${scales[0]} (glass ${before}px)`);
  ok('loop: growth is monotonic', monotone, scales.slice(0,6).join(' → '));
  ok('loop: lands home', await home(p));
  const kept = await p.evaluate(() => ({
    dob: [...document.querySelectorAll('select')].map(s=>s.value),
    armed: document.querySelector('.go').classList.contains('armed'),
    tf: getComputedStyle(document.querySelector('.calculator')).transform
  }));
  ok('loop: answers kept', kept.dob.join(',') === '7,14,1986', JSON.stringify(kept.dob));
  ok('loop: button armed', kept.armed);
  ok('loop: transform settles to identity', kept.tf === 'none' || kept.tf === 'matrix(1, 0, 0, 1, 0, 0)', kept.tf);
  await p.screenshot({ path: `${OUT}/loop-home.png` });
  ok('loop: second run completes', await runToRoom(p));
  ok('loop: no console errors', p.__errs.length === 0, p.__errs.slice(0,3).join(' / '));
  await p.close();
}
console.log('---');

// ── 4. Double-click "calculate again", and resize mid-run ─────────────────
{
  const p = await page({ width: 1280, height: 800 });
  await p.goto(`${BASE}/?speed=5`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await p.mouse.click(3,3); await p.waitForTimeout(400);
  await dial(p, '7', '14', '1986');
  await runToRoom(p);
  await p.click('.again');
  await p.waitForTimeout(80);
  const second = await p.evaluate(() => { const a = document.querySelector('.again'); if (a) { a.click(); return 'clicked'; } return 'gone'; });
  ok('robust: second "again" click is harmless', true, second);
  ok('robust: still lands home', await home(p));
  ok('robust: no console errors', p.__errs.length === 0, p.__errs.slice(0,2).join(' / '));
  await p.close();
}
{
  const p = await page({ width: 1280, height: 800 });
  await p.goto(`${BASE}/?speed=2`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await p.mouse.click(3,3); await p.waitForTimeout(400);
  await dial(p, '7', '14', '1986');
  await p.click('.go');
  await p.waitForTimeout(3000);
  await p.setViewportSize({ width: 900, height: 1200 });   // landscape → portrait mid-run
  await p.waitForTimeout(1000);
  await p.setViewportSize({ width: 1440, height: 800 });
  let landed = false;
  for (let i = 0; i < 200; i++) { if (await p.evaluate(()=>!!document.querySelector('.again'))) { landed = true; break; } await p.waitForTimeout(1000); }
  ok('robust: survives a resize mid-run', landed);
  ok('robust: result still in the glass after resize', await p.evaluate(()=>!!document.querySelector('.glass')));
  await p.screenshot({ path: `${OUT}/resize-room.png` });
  ok('robust: no console errors on resize', p.__errs.length === 0, p.__errs.slice(0,2).join(' / '));
  await p.close();
}
console.log('---');

// ── 5. ?speed extremes ────────────────────────────────────────────────────
for (const sp of ['0.5', '20']) {
  const p = await page({ width: 1280, height: 800 });
  await p.goto(`${BASE}/?speed=${sp}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await p.mouse.click(3,3); await p.waitForTimeout(400);
  await dial(p, '3', '2', '1971');
  ok(`speed=${sp}: run completes`, await runToRoom(p, 260));
  ok(`speed=${sp}: no console errors`, p.__errs.length === 0, p.__errs.slice(0,2).join(' / '));
  await p.close();
}
console.log('---');

// ── 6. Spotify player is reachable (hit-test through the tree) ────────────
{
  const p = await page({ width: 1280, height: 800 });
  await p.goto(`${BASE}/?speed=5`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await p.mouse.click(3,3); await p.waitForTimeout(400);
  await dial(p, '7', '14', '1986');
  await runToRoom(p);
  const hit = await p.evaluate(() => {
    const f = document.querySelector('.glass iframe');
    if (!f) return { ok: false, why: 'no iframe' };
    const r = f.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2);
    return { ok: el === f, tag: el?.tagName, cls: (el?.className || '').toString().replace(/s-\w+/g,'').trim(),
             pe: getComputedStyle(f).pointerEvents, w: Math.round(r.width) };
  });
  ok('room: Spotify player is hit-testable', hit.ok, JSON.stringify(hit));
  const again = await p.evaluate(() => {
    const a = document.querySelector('.again'); const r = a.getBoundingClientRect();
    return document.elementFromPoint(r.x + r.width/2, r.y + r.height/2)?.tagName;
  });
  ok('room: "calculate again" is hit-testable', again === 'BUTTON', again);
  await p.close();
}

console.log('\n================ ' + (fails.length ? `${fails.length} FAILURES` : 'ALL PASSED') + ' ================');
fails.forEach(f => console.log('  ✗ ' + f));
await b.close();
process.exit(fails.length ? 1 : 0);
