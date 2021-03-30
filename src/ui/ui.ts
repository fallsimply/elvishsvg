import type { MessageWrapper, SvgMapMessage, UIMessage, PluginWrapper } from "../types"

const decoder = new TextDecoder()
const svgParser = new DOMParser()
var state = { url: "", name: "" } as { url?: string, name: string }

const $ = <T extends Element = Element>(selector: string): T  => document.querySelector(selector)

const generateHandler = () => {
	parent.postMessage({ pluginMessage: { type: "generate" } } as PluginWrapper, '*')
	$<HTMLTextAreaElement>("textarea#out").value = "Generating Sprite"
}

$("#sprite").addEventListener("click", generateHandler)

$("#dl").addEventListener("click", () => {
	const link = document.createElement('a');
	link.href = state.url
	link.download = `${state.name.replace(/[\\\/]/g, "-")}.sprite.svg`
	link.click()
})

window.addEventListener("message", (msg: MessageWrapper<SvgMapMessage | UIMessage>) => {
	let data = msg.data.pluginMessage
	if (data.type == "decode") {
		let icons = data.payload
		let groups: Array<string> = []
		let colorRE = new RegExp($<HTMLInputElement>("input#removeFill").value.toUpperCase(), "g")

		for (const icon in icons) {
			let svgText = decoder.decode(icons[icon]).replace(/[\n\t]/g, "").replace(colorRE, "currentColor")
			let svg = svgParser.parseFromString(svgText, "image/svg+xml").documentElement
			svg.setAttribute("id", icon)
			groups.push(svg.outerHTML)
		}

		let sprite: string = `<svg fill="none"><defs>${groups.join()}</defs></svg>`

		$<HTMLTextAreaElement>("textarea#out").value = sprite
		state = {
			url: `data:image/svg+xml;utf8,${encodeURIComponent(sprite)}`,
			name: data.parent
		}
		$("#dl").toggleAttribute("disabled")
	} else if (data.type = "useUI")
		if (data.payload = "generate")
			generateHandler()
})