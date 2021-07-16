import { IconParent, svgMap, Icon, Settings } from "./types"

export const validParents: Array<NodeType> = ["FRAME", "GROUP", "COMPONENT_SET"]

export function getIcons(parent: IconParent) {
	if (validParents.indexOf(parent.type) < 0)
		return
	return parent.findAll((node: IconParent | Icon) => {
		if (!("children" in node) || node.children.filter(e => e.type == "FRAME" || e.type == "COMPONENT").length > 0)
			return false

		node.setPluginData("prefix", getPrefix(node, parent))

		return node.type === "FRAME" || node.type === "COMPONENT"
	}) as Icon[]
}

export async function exportSVG(parent: IconParent): Promise<svgMap> {
	let icons = getIcons(parent)
	let svgs: svgMap = {}

	parent.setRelaunchData({export: ""})

	for (const icon of icons)
		svgs[getIconName(icon)] = await icon.exportAsync({format: "SVG"})

	return svgs
}

export async function makeComponents(parentC: IconParent, settings: Settings) {
	let parent: IconParent

	if (parentC.getPluginData("components").length == 0) {
		if (parentC.getPluginData("parent") !== "") {
			parent = parentC
			parentC = figma.getNodeById(parentC.getPluginData("parent")) as IconParent
			if (parentC == null) {
				parentC.setPluginData("parent", "")
				return
			}
			parent.remove()
		} else
			parentC.setRelaunchData({generate: `Update Components in ${settings.suiteName || "Suite"}`})

		parent = parentC.clone()
		parent.y += parent.height + (+settings.gap || 0)

		parent.setPluginData("parent", parentC.id)
		// parentC.setPluginData("components", parent.id)
	} else {
		let comp = figma.getNodeById(parentC.getPluginData("components")) as IconParent
		if (comp == null) {
			parentC.setPluginData("components", "")
			return
		}
		comp.remove()
		parent = parentC.clone()
	}

	let icons = getIcons(parent)
	
	parent.setRelaunchData({generate: `Update Components from ${parentC.name} [Node ID: ${parentC.id}]`})
	
	parent.name = settings.suiteName || "Suite"

	for (const icon of icons) {
		figma.union(icon.children, icon)
		figma.flatten(icon.children, icon)

		let node = icon.children[0] as VectorNode
		node.fills = [{type: 'SOLID', color: {r: 0, g: 0, b: 0}}]
		node.constraints = {horizontal: "SCALE", vertical: "SCALE"}
		
		if (icon.type !== "COMPONENT") {
			let comp = figma.createComponent()
			let name = getIconName(icon)
			let i = icon.parent.children.indexOf(icon)

			comp.resizeWithoutConstraints(icon.width, icon.height)
			comp.name = name

			icon.children.forEach(c => comp.appendChild(c))

			icon.parent.insertChild(i, comp)
			icon.remove()
		}
	}

	return
}

function getPrefix(node: IconParent | Icon, frame: IconParent): string {
	let prefix = ""
	let prnt = node.parent as IconParent

	while (prnt !== frame) {
		prefix = `${prnt.name}/${prefix}`
		prnt = prnt.parent as IconParent
	}

	return prefix
}

function getIconName(icon: Icon) {
	let name = (icon.getPluginData("prefix") + icon.name)
	/* Strips values that are falsey values and strips the equal sign and result for truthy values */
	return name.replace(/\/?[^/ =,]+=(?:off|no|false)|=(?:on|yes|true)/gim, "")
}