// export type HostCommands = "generate" | "export" | "settings" | "reset" | "done"
export enum HostCommands {
	Component = "generate",
	Sprite = "export",
	Settings = "settings",
	Reset = "rest"
}

export type MessageType = "useUI" | "decode" | HostCommands

export type IconParent = GroupNode | FrameNode | ComponentSetNode
export type Icon = ComponentNode | FrameNode

export interface svgMap extends Record<string, Uint8Array> {}

export interface Settings extends Record<string, string> {
	removeFill?: string
	suiteName?: string
}

/*
	MESSAGES
*/
export interface Message<Payload = any, T = MessageType> extends Record<string, any> {
	type: T,
	payload?: Payload
}

export interface PluginWrapper<T extends Message = Message> {
	pluginMessage: T
}

export interface MessageWrapper<T extends Message = Message> {
	data: {
		pluginMessage: T
	}
}

export interface SvgMapMessage extends Message<svgMap> {
	type: "decode"
}

export interface UIMessage extends Message<HostCommands> {
	type: "useUI"
}

/* 
	UI
*/
export type UIState = {
	name: string,
	url?: string
} & Settings