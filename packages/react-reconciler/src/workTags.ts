export type WorkTag =
	| typeof FunctionCompon
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionCompon = 0;
export const HostRoot = 3; // Root Fiber 可以理解为根元素 ， 通过reactDom.render()产生的根元素

export const HostComponent = 5; // dom元素 比如 <div></div>
export const HostText = 6;
