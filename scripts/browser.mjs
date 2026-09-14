// ── The test browser ─────────────────────────────────────────────────────────
// three r186's WebGPU backend needs Chrome 143 or later — the string form of the
// texture-view swizzle — and the Chromium that Playwright installs in the build
// sandbox is 141. This fetches the Chrome-for-Testing headless shell that
// Playwright 1.63 itself expects, 153.0.8010.12, from Google's bucket (the
// Playwright CDN is not reachable from the sandbox; storage.googleapis.com is)
// into a cache OUTSIDE the repo, and prints the path. Idempotent: a second run
// finds it and prints the path again.
//
//   node scripts/browser.mjs     fetch if missing, print the path
//   CC2000_BROWSERS=dir          where to keep it (default ~/.cache/cc2000/browsers)
//
// lane.mjs calls ensureChrome() for the WebGPU lane, so verify.mjs and
// shots.mjs never need this run by hand. Linux only — on anything else set
// CHROMIUM to a Chrome of 143 or later.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

export const CFT_VERSION = '153.0.8010.12';
const ZIP = `https://storage.googleapis.com/chrome-for-testing-public/${CFT_VERSION}/linux64/chrome-headless-shell-linux64.zip`;

export function chromeDir() {
	return process.env.CC2000_BROWSERS ?? path.join(os.homedir(), '.cache', 'cc2000', 'browsers');
}

export function chromePath() {
	return path.join(
		chromeDir(),
		`chrome-headless-shell-${CFT_VERSION}`,
		'chrome-headless-shell-linux64',
		'chrome-headless-shell'
	);
}

export function ensureChrome() {
	const bin = chromePath();
	if (fs.existsSync(bin)) return bin;
	if (process.platform !== 'linux') {
		throw new Error(
			`browser.mjs fetches a Linux build; on ${process.platform} set CHROMIUM to a Chrome ≥ 143`
		);
	}
	const dir = path.dirname(path.dirname(bin));
	fs.mkdirSync(dir, { recursive: true });
	const zip = path.join(dir, 'shell.zip');
	// curl honours the sandbox's proxy settings; Node's own fetch does not.
	execFileSync('curl', ['-sSL', '--fail', '-o', zip, ZIP], { stdio: 'inherit' });
	execFileSync('unzip', ['-q', '-o', zip, '-d', dir], { stdio: 'inherit' });
	fs.unlinkSync(zip);
	if (!fs.existsSync(bin))
		throw new Error(`browser.mjs: unpacked the shell but ${bin} is not there`);
	return bin;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
	console.log(ensureChrome());
}
