// Smoke-test a MAIN build (SITE=main npm run build; vite preview): the site is
// the run alone. BASE=http://localhost:<port> node scripts/verify-main.mjs
//   /            the run: the shell says data-site="main", the board's dark
//                is the ground, the corner is the build label alone (no
//                switch), the sketch boots (window.__next) and plays
//   /v2 /v3 /next /lab /log /v4 /flows /cut /eva   404s
import { launch } from './lane.mjs';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4175';
let fails = 0;
const ok = (name, pass) => {
	console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
	if (!pass) fails++;
};
const { browser: b, lane } = await launch();
console.log(`lane  ${lane}`);
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e.message)));
const r = await p.goto(`${BASE}/`, { waitUntil: 'load' });
ok('/ answers', r?.status() === 200);
const html = await p.content();
ok('the shell is the main site', /data-site="main"/.test(html));
ok(
	'the ground is the board’s dark before any script',
	(await p.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)) ===
		'rgb(21, 21, 21)'
);
ok('no run switch in the corner', (await p.$$('nav.version')).length === 0);
ok('a build label in the corner', (await p.$$('span.build')).length === 1);
ok(
	'the run boots',
	await p
		.waitForFunction(() => !!window.__next?.api, null, { timeout: 90000 })
		.then(
			() => true,
			() => false
		)
);
await p.waitForTimeout(2500);
const t = await p.evaluate(() => window.__next?.t ?? 0);
ok(`the run plays (t = ${t.toFixed(2)})`, t > 0.5);
ok(
	'?v= is ignored: the run alone',
	await p.evaluate(() => window.__next?.sketch === 'flow-strand-sketch')
);
for (const path of ['/v2', '/v3', '/next', '/lab', '/log', '/v4', '/flows', '/cut', '/eva']) {
	const rr = await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
	ok(`${path} is a 404`, rr?.status() === 404);
}
ok('no page errors', errs.length === 0);
if (errs.length) console.log(errs.slice(0, 3));
await b.close();
console.log(fails ? `\n${fails} FAILED` : '\nAll passed.');
process.exit(fails ? 1 : 0);
