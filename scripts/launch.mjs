// The browser the tools drive: headless Chromium on a software GPU. The run
// draws through WebGL 2 (run/lens.js), which SwiftShader gives it; the
// sandbox's own Chromium is used when there is one, Playwright's otherwise.
//
//   CHROMIUM=path   another binary
import fs from 'fs';
import { chromium } from 'playwright';

const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';

export async function launch() {
	const executablePath =
		process.env.CHROMIUM ?? (fs.existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined);
	return chromium.launch({
		executablePath,
		args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
	});
}

// The run is ready when the page has booted the sketch (run/Run.svelte).
export const ready = (page, timeout = 120000) =>
	page.waitForFunction(() => !!window.__run?.api, null, { timeout });
