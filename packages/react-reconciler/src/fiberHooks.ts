import { FiberNode } from './fiber';
import internals from 'shared/internals';

// 当前正在渲染的函数组件的 FiberNode 用于保存当前函数组件里面 使用的 hooks
let currentlyRenderingFiber: FiberNode | null = null;
// 当前正在使用的 hook
let workInProgressHook: () => Hook | null = null;

const { currentDispatcher } = internals;

// 定义一个通用的 Hooks 类型，满足所有 Hooks 的使用
// 满足 useState useEffect useReducer 等等
interface Hook {
	memoizedSate: any; // 不同的 hook 有不同的状态
	updateQueue: unknown;
	next: Hook | null;
}

/**
 * 生成函数组件的子FiberNode
 * @param wip 当前工作的 FiberNode 节点
 */
export function renderWithHooks(wip: FiberNode) {
	// 赋值操作
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;

	// 判断时机
	const current = wip.alternate;

	if (current !== null) {
		// update
	} else {
		// mount
		// 指向了 mount 时的 hooks 实现
		// currentDispatcher.current = ;
	}

	// 1. 获取当前组件的类型
	const Component = wip.type;
	// 2. 获取当前组件的 props
	const props = wip.pendingProps;
	// 3. 获取当前组件的 hooks
	const children = Component(props);

	// 重置操作
	currentlyRenderingFiber = null;

	return children;
}

/*
function App() {
  return <Img />
}
*/
