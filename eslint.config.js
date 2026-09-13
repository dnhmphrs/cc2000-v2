import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig([
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.js'],
		languageOptions: { parserOptions: {} }
	},
	{
		// eslint-plugin-svelte 3 recommends keyed {#each} blocks. Every each in
		// this site runs over a static list — decades, rows, months — where an
		// unkeyed block is correct and a key would change DOM identity for no
		// gain. Nineteen sites, none of them a bug. Off for now; revisit with
		// the Svelte 5 (runes) pass, which touches every one of those files
		// anyway, rather than in the toolchain change that must not move a pixel.
		rules: { 'svelte/require-each-key': 'off' }
	}
]);
