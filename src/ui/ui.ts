import { MessageWrapper, UIState, SvgMapMessage, UIMessage, PluginWrapper, Settings, HostCommands } from "../types"

var state:    UIState  = { url: "", name: "" }
var settings: Settings = { removeFill: "#ff00ff", suiteName: "Suite" }

const $: typeof document.querySelector = (sel: string) => document.querySelector(sel)
const $$: typeof document.querySelectorAll = (sel: string) => document.querySelectorAll(sel)

const send = (msg: PluginWrapper) => window.parent.postMessage(msg, "*")

const genSprite = () => {
	send({pluginMessage: { type: HostCommands.Sprite }})
	$("textarea").value = "Generating Sprite"
}

const genComponents = () => {
	send({ pluginMessage: { type: HostCommands.Component } })
	$("textarea").value = "Generating Components"
}

const updateSettings = () => { for (const key in settings) $<HTMLInputElement>(`input#${key}`).value = settings[key] }

const decoder = new TextDecoder(),
	  parser  = new DOMParser()

function doDownload() {
	const link = document.createElement('a');
	const file = state.name.replace(/[\\\/]/g, "-")
	link.href = state.url
	link.download = `${file}.sprite.svg`
	link.click()
}

$("button[sprite]").addEventListener("click", genSprite)
$("button[component]").addEventListener("click", genComponents)
$("button[download]").addEventListener("click", doDownload)

$$("dialog button[close]").forEach(elem => elem.addEventListener("click", (e: Event) => (<Element>e.target).closest("dialog").close()))

$("dialog[settings]").addEventListener("close", (e: Event) => { (<HTMLDialogElement>e.target).returnValue })
$("button[settings]").addEventListener("click", () => $("dialog").showModal())

$<HTMLFormElement>("dialog[settings] form").addEventListener("submit", (e) => {
	(<Element>e.target).querySelectorAll("input").forEach(({id, value}) => settings[id] = value)
	send({pluginMessage: { type: HostCommands.Settings, payload: settings }});
	e.preventDefault()
})

window.addEventListener("message", (msg: MessageWrapper<SvgMapMessage | UIMessage>) => {
	let data = msg.data.pluginMessage
	if (data.type == "decode") {
		let icons = data.payload
		let groups: Array<string> = []
		let colorRE = new RegExp($<HTMLInputElement>("input#removeFill").value.toUpperCase(), "g")

		for (const icon in icons) {
			let txt = decoder.decode(icons[icon]).replace(/[\n\t]/g, "").replace(colorRE, "currentColor")
			let svg = parser.parseFromString(txt, "image/svg+xml").documentElement
			svg.setAttribute("id", icon)
			groups.push(svg.outerHTML)
		}

		let sprite = `<svg fill="none"><defs>${groups.join()}</defs></svg>`

		$("textarea").value = sprite
		state = { name: data.parent, url: `data:image/svg+xml;utf8,${encodeURIComponent(sprite)}` }

		$("button[download]").toggleAttribute("disabled")
	} else if (data.type = "useUI") {
		if (!!data.settings) {
			Object.keys(data.settings).forEach(k => settings[k] = data.settings[k])
			updateSettings()
		}

		if (data.payload == "export")
			genSprite()
		else if (data.payload == "generate")
			genComponents()
	}
})