import type { IconParent, Message, UIMessage, SvgMapMessage, HostCommands, Settings } from "../types"
import { exportSVG, validParents, makeComponents } from "../lib"

const showSelectToast = () => figma.closePlugin("Please select a Single Frame, Group, or Component Set")

if (figma.currentPage.selection.length != 1)
	showSelectToast()
else if (figma.command == "reset") {
	const parent = figma.currentPage.selection[0]
	parent.setPluginData("parent", "")
	parent.setPluginData("components", "")
	figma.closePlugin()
} else if (figma.command == "generate") {
	const parent = figma.currentPage.selection[0]
	const settings = JSON.parse(parent.getPluginData("settings") || "{}")
	makeComponents(parent as IconParent, settings)
	figma.closePlugin()
} else {
	const parent = figma.currentPage.selection[0]
	const settings = JSON.parse(parent.getPluginData("settings") || "{}")

	console.log(figma.command)

	figma.showUI(__html__, { width: 400, height: 380 })
	figma.ui.postMessage({ type: "useUI", payload: figma.command, parent: figma.currentPage.selection[0].name, settings } as UIMessage)
	figma.ui.onmessage = (msg: Message<Settings, HostCommands>) => {
		if (validParents.indexOf(figma.currentPage.selection[0].type) == -1)
			return showSelectToast()
		
		if (msg.type == "export") {
			exportSVG(parent as IconParent)
				.then(icons => figma.ui.postMessage({ type: "decode", payload: icons, parent: parent.name } as SvgMapMessage))
		} else if (msg.type == "generate") {
			makeComponents(parent as IconParent, settings)
		} else if (msg.type == "settings") {
			parent.setPluginData("settings", JSON.stringify(Object.assign(settings, msg.payload)))
		}
	}
}