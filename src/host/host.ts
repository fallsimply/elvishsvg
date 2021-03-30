import type { IconParent, Message, UIMessage, SvgMapMessage, Commands } from "../types"
import { getIcons, validParents } from "../lib"

const showSelectToast = () => figma.notify("Please select a Single Frame, Group, or Component Set")

const { showUI, ui: { postMessage } } = figma

if (figma.currentPage.selection.length != 1)
	showSelectToast()
else {
	showUI(__html__, { width: 400, height: 500 })
	postMessage({ type: "useUI", payload: figma.command } as UIMessage)
	figma.ui.onmessage = (msg: Message<Commands>) => {
		if (msg.type == "generate")
			if (validParents.indexOf(figma.currentPage.selection[0].type) != -1) {
				const parent = figma.currentPage.selection[0]
				getIcons(parent as IconParent)
					.then(icons => postMessage({ type: "decode", payload: icons, parent: parent.name } as SvgMapMessage))
			} else
				showSelectToast()
	}
}