const { build } = require("esbuild")
const { readFile, copyFile, writeFile } = require("fs/promises")
const postcss = require("postcss")
const purgeCSS = require("@fullhuman/postcss-purgecss")
const purgeHtml = require("purgecss-from-html")

let htmlText = ""

/** 
 * @param {string} file File Name
 * @param {object} options Additional Options
 * @returns {Object}
*/
const jsConf = (file, options = {}) => ({
	entryPoints: [`src/${file}`],
	outdir: "dist",
	assetNames: "[name]",
	bundle: true,
	minifyWhitespace: true,
	minifySyntax: true,
	...options,
})

const purgeConf = () => ({
	content: ["src/ui/ui.html"],
	variables: true,
	extractors: [{
		extractor: purgeHtml,
		extensions: ['html']
	}],
	safelist: {
		standard: [/^::-webkit-/, /:focus/, /::backdrop/]
	}
})

const exit = err => {
	console.log(err)
	process.exit(1)
}

build(jsConf(["host/host.ts"])).catch(exit)

const processJS = () => build(jsConf(["ui/ui.ts"], { write: false })).catch(exit)

const processCSS = async () => {
	let file = await readFile("src/ui/ui.css", "utf8")
	return postcss([
		require("postcss-import")(),
		require("postcss-custom-properties")({ preserve: false }),
		new purgeCSS(purgeConf()),
		require("cssnano")({ preset: ["advanced"] }),
	])
		.process(file)
		.catch(exit)
		.then(result => result.css)
}


copyFile("src/ui/ui.html", "dist/ui.html")
	.catch(exit)
	.then(() => {
		readFile("dist/ui.html")
			.catch(exit)
			.then(async (e) => {
				htmlText = e.toString() + "\n"

				let js = await processJS()
				htmlText += `<script>${js.outputFiles[0].text.trim()}</script>\n`

				let css = await processCSS()
				htmlText += `<style>${css.toString()}</style>`

				writeFile("dist/ui.html", htmlText.replace(/[\t\n]/g, ""))
			})
	})