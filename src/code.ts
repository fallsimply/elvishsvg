import { iter } from "./lib"
import type { IconParent, Message, svgMap } from "./lib"
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

const showSelectToast = () => figma.notify("Please select a Frame, Group, or Component Set")

// This shows the HTML page in "ui.html".
if (figma.currentPage.selection.length <= 0)
	showSelectToast()
else {	
	figma.showUI(__html__, {width: 400, height: 430})
	figma.ui.postMessage({type: "useUI", payload: figma.command})

	// Calls to "parent.postMessage" from within the HTML page will trigger this
	// callback. The callback will be passed the "pluginMessage" property of the
	// posted message.
	figma.ui.onmessage = (msg: Message) => {
		// One way of distinguishing between different types of messages sent from
		// your HTML page is to use an object with a "type" property like this.
		switch (msg.type) {
			case "generate":
				switch (figma.currentPage.selection[0].type) {
					case "FRAME":
					case "GROUP":
					case "COMPONENT_SET":
						let parent = figma.currentPage.selection[0]
						let icons = iter(parent as IconParent)
						icons.then(val => figma.ui.postMessage({ type:"decode", payload: val, parent: parent, test: "hello" } as Message<svgMap>))
						break
					default:
						showSelectToast()
				}
				break;
			case "close":
				figma.closePlugin()
		}
		figma.command
	}

}