// 描述宿主方法环境的方法
export type Container = Element;
export type Instance = Element;

// createInstance 用于创建宿主环境的实例，比如浏览器环境下的 DOM 元素
// export const createInstance = (type: string, props: any):
export const createInstance = (type: string): Instance => {
	// TODO 处理 props
	const element = document.createElement(type);
	return element;
};

// 创建文本节点
export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

// 插入子节点
export const appendInitialChild = (
	parent: Instance | Container,
	child: Instance
) => {
	parent.appendChild(child);
};

// appendChildToContainer 用于将子节点插入到父节点中
export const appendChildToContainer = appendInitialChild;
