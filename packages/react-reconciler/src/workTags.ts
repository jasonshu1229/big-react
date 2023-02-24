// workTags.ts - 对应 fiber 节点的类型
export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionComponent = 0;
export const HostRoot = 3; // Root Fiber 可以理解为根元素 ， 通过reactDom.render()产生的根元素

export const HostComponent = 5; // dom元素 比如 <div></div>
export const HostText = 6; // 文本类型 比如：<div>123</div>
