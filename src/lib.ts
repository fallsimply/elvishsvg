export interface Message<T = any> {
	type: string,
	payload: T
}
export interface svgMap extends Record<string, Uint8Array> {}

export type IconParent = GroupNode | FrameNode | ComponentSetNode
export type Icon = ComponentNode | FrameNode

export const validParents: Array<NodeType> = ["FRAME", "GROUP", "COMPONENT_SET"]

export async function iter(frame: IconParent): Promise<svgMap> {
	if (validParents.indexOf(frame.type) < 0)
		return

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
		svgs[icon.getPluginData("prefix") + icon.name] = await icon.exportAsync({format: "SVG"})
	}

	return svgs
}
