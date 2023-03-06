import { FiberNode } from './fiber';

/**
 * 生成函数组件的子FiberNode
 * @param wip 当前工作的 FiberNode 节点
 */
export function renderWithHooks(wip: FiberNode) {
	// 1. 获取当前组件的类型
	const Component = wip.type;
	// 2. 获取当前组件的 props
	const props = wip.pendingProps;
	// 3. 获取当前组件的 hooks
	const children = Component(props);

	return children;
}

/*
function App() {
  return <Img />
}
*/
