import { IconParent, svgMap, Icon } from "./types"

export const validParents: Array<NodeType> = ["FRAME", "GROUP", "COMPONENT_SET"]

const reGroup = (group: string) => `(?:${group})`
const onVals  = ["on", "yes", "true"].map(reGroup).join("|")
const offVals = ["off", "no", "false"].map(reGroup).join("|")

export async function getIcons(frame: IconParent): Promise<svgMap> {
	if (validParents.indexOf(frame.type) < 0) return
	let icons = frame.findAll((node: IconParent | Icon) => {
		if (!("children" in node) || node.children.filter(e => (e.type == "FRAME" || e.type == "COMPONENT")).length > 0)
			return false

		let prefix = "", prnt = node.parent as IconParent

		while (prnt !== frame) {
			prefix = `${prnt.name}/${prefix}`
			prnt = prnt.parent as IconParent
		}

		node.setPluginData("prefix", prefix)

		return node.type === "FRAME" || node.type === "COMPONENT"
	}) as Icon[]

	frame.setRelaunchData({export: ""})

	let svgs: svgMap = {}

	for (const icon of icons) {
		let name = icon.name.replace(RegExp([`[^/ =,]+=${reGroup(onVals)}", "=${reGroup(offVals)}`].map(reGroup).join("|"), "gim"), "")
		svgs[(icon.getPluginData("prefix") + name).replace(/[\\\/]$/, "")] = await icon.exportAsync({format: "SVG"})
	}

	return svgs
}
