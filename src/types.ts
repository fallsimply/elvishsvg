export type Commands = "generate" | "export"
export type MessageType = "useUI" | "decode" | Commands

export type IconParent = GroupNode | FrameNode | ComponentSetNode
export type Icon = ComponentNode | FrameNode

export interface svgMap extends Record<string, Uint8Array> {}

/* MESSAGES */
export interface Message<T = any> extends Record<string, any> {
	type: MessageType,
	payload: T
}
export interface MessageWrapper<T extends Message> {
	data: {
		pluginMessage: T
	}
}

export interface SvgMapMessage extends Message<svgMap> {
	type: "decode"
}

export interface UIMessage extends Message<Commands> {
	type: "useUI"
}