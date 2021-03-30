import type { IconParent, Message, UIMessage, SvgMapMessage, Commands } from "../types"
import { getIcons, validParents } from "../lib"

const showSelectToast = () => figma.notify("Please select a Single Frame, Group, or Component Set")

if (figma.currentPage.selection.length != 1)
	showSelectToast()
else {
	figma.showUI(__html__, { width: 400, height: 380 })
	figma.ui.postMessage({ type: "useUI", payload: figma.command, parent: figma.currentPage.selection[0].name } as UIMessage)
	figma.ui.onmessage = (msg: Message<Commands>) => {
		console.log("host: ", msg)
		if (msg.type == "generate")
			if (validParents.indexOf(figma.currentPage.selection[0].type) != -1) {
				const parent = figma.currentPage.selection[0]
				getIcons(parent as IconParent)
					.then(icons => figma.ui.postMessage({ type: "decode", payload: icons, parent: parent.name } as SvgMapMessage))
			} else
				showSelectToast()
	}
}