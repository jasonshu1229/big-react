import { Action } from 'shared/ReactTypes';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate
} from './updateQueue';
import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import { FiberNode } from './fiber';
import internals from 'shared/internals';
import { scheduleUpdateOnFiber } from './workLoop';

// 当前正在渲染的函数组件的 FiberNode 用于保存当前函数组件里面 使用的 hooks
let currentlyRenderingFiber: FiberNode | null = null;
// 当前正在使用的 hook
let workInProgressHook: Hook | null = null;

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
	// 重置
	wip.memoizedState = null;

	// 判断时机
	const current = wip.alternate;

	if (current !== null) {
		// update
	} else {
		// mount
		// 指向了 mount 时的 hooks 实现
		currentDispatcher.current = HooksDispatcheronMount;
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

/**
 * 用于保存 mount 时的 hooks 实现
 */
const HooksDispatcheronMount: Dispatcher = {
	useState: mountState
};

function mountState<State>(
	initialState: State | (() => State)
): [State, Dispatch<State>] {
	// 	找到当前useState对应的hook数据
	const hook = mountWorkInProgressHook();

	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}

	// 为dispatch创建一个update更新队列
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	// 为hook添加memoizedState
	hook.memoizedSate = memoizedState;

	// NOTE：dispatch 方法是可以不在 FC 组件内部调用的
	// 这里预置了 fiber 和 queue 信息，用户只需要传递 action
	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	// 为queue添加dispatch方法
	// 向更新队列中添加更新时，会调用dispatch方法
	queue.dispatch = dispatch;

	return [memoizedState, dispatch];
}

/**
 * 让 useState 返回的 dispatch 接入更新队列，从而接入调度更新流程
 * @param fiber
 * @param updateQueue
 * @param action
 */
function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	// 和接入首屏渲染的 update 流程相似
	// 生成 update
	const update = createUpdate(action);
	// 将 update 接入到 updateQueue 中
	enqueueUpdate(updateQueue, update);
	// 接入调度更新流程
	scheduleUpdateOnFiber(fiber);
}

/**
 * 获取 mount 时的 hook 的数据
 * @returns
 */
function mountWorkInProgressHook(): Hook {
	// 不存在首先创建一个
	const hook: Hook = {
		memoizedSate: null,
		updateQueue: null,
		next: null
	};
	// hook 为空，说明是第一次使用
	if (workInProgressHook === null) {
		// mount 时的第一个 hook
		if (currentlyRenderingFiber == null) {
			// 因为 workInProgressHook 表示的是当前正在使用的函数组件的 fiberNode
			// 说明不是在函数组件内调用 hook
			throw new Error('请在函数组件内调用 hook');
		} else {
			// 说明是在函数组件内调用 hook，并保存当前 hook
			workInProgressHook = hook;
			// 记录数据到 fiber 上
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount 时的第二个 hook 以及之后的 hook，串联到链表上
		workInProgressHook.next = hook;
		// 指向了第二个hook
		workInProgressHook = hook;
	}
	return workInProgressHook;
}

/*
function App() {
  return <Img />
}
*/
