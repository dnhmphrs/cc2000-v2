// ── Lanes ────────────────────────────────────────────────────────────────────
// The renderer has two backends and the site is verified on both. A LANE picks
// the flag set that gives headless Chromium the right one on SwiftShader:
//
//   webgl    the WebGL 2 backend — the site's flags as they have always been,
//            on the Chromium that Playwright installs (141). The baseline
//            sheets were shot this way and it stays byte-identical to them.
//   webgpu   a real WebGPU device (Dawn on SwiftShader's Vulkan) on Chrome-
//            for-Testing 153, fetched on first use by browser.mjs. The site's
//            WebGL renders the same under these flags; what changes is what
//            /lab and /v4 get, and what the site gets after the renderer swap.
//
// Flags that look right and are not: --use-gl=swiftshader kills the WebGPU
// instance, and --use-webgpu-adapter=swiftshader loses the device on the first
// render. Pages must be served from localhost or 127.0.0.1: WebGPU is gated to
// secure contexts, and about:blank is not one.
//
//   LANE=webgpu|webgl    which backend (default webgl)
//   CHROMIUM=path        the binary, for either lane
import fs from 'fs';
import { chromium } from 'playwright';
import { ensureChrome } from './browser.mjs';

export const LANE = process.env.LANE === 'webgpu' ? 'webgpu' : 'webgl';

const FLAGS = {
	webgl: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
	webgpu: [
		'--no-sandbox',
		'--enable-unsafe-webgpu',
		'--use-angle=swiftshader',
		'--enable-features=Vulkan',
		'--use-vulkan=swiftshader',
		'--enable-unsafe-swiftshader'
	]
};

// The sandbox's Chromium, when there is one; otherwise Playwright's own.
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';

export async function launch(lane = LANE) {
	const executablePath =
		process.env.CHROMIUM ??
		(lane === 'webgpu'
			? ensureChrome()
			: fs.existsSync(SANDBOX_CHROMIUM)
				? SANDBOX_CHROMIUM
				: undefined);
	const browser = await chromium.launch({ executablePath, args: FLAGS[lane] });
	return { browser, lane, executablePath };
}
