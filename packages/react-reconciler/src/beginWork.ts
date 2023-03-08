import { reconcilerChildFibers, mountChildFibers } from './childFibers';
import { ReactElementType } from './../../shared/ReactTypes';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import {
	HostRoot,
	HostComponent,
	HostText,
	FunctionComponent
} from './workTags';
import { FiberNode } from './fiber';
import { renderWithHooks } from './fiberHooks';

// 递归中的递阶段

/**
 * 作用：1.计算状态的最新值 2. 创建子 FiberNode
 * 根据当前工作的 FiberNode 节点，生成子FiberNode
 * @param wip 当前工作的 FiberNode 节点
 * @returns 返回值是子FiberNode
 */
export const beginWork = (wip: FiberNode) => {
	//  将当前 FiberNode 和 ReactElement 比较，生成子FiberNode

	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		case FunctionComponent:
			return updateFunctionComponent(wip);
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
			break;
	}
	return null;
};

// 计算状态的最新值，并生成 子FiberNode（会和processUpdateQueue 消费状态函数联系）
// HostRootFiber
function updateHostRoot(wip: FiberNode) {
	// 基础的状态
	const baseState = wip.memoizedState;
	// 更新的状态
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	// 获取参与计算的 update
	const pending = updateQueue.shared.pending;
	// 获取到之后把之前的 参与计算的 update 赋值 nul
	updateQueue.shared.pending = null;
	// memoizedState 已经是 HostRootFiber 状态的最新值了
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	// 接下来开始创建 子 FiberNode
	const nextChildren = wip.memoizedState;
	reconcilerChildren(wip, nextChildren);
	return wip.child;
}

// children 在 props 属性中
/**
 * 对比新老 props 的差异 生成子FiberNode
 * @param wip 当前工作的 FiberNode 节点
 * @returns 子节点的 FiberNode
 */
function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;

	reconcilerChildren(wip, nextChildren);
	return wip.child;
}

/**
 * 生成子FiberNode
 * @param wip 当前工作的 FiberNode 节点
 * @param children 子节点的 reactElement
 */
function reconcilerChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;

	if (current !== null) {
		// update
		// 将子节点的 current fiberNode 和
		// 子节点的 reactElement 对比生成子节点的wip fiberNode
		wip.child = reconcilerChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}

/**
 *	计算函数组件的最新值 以及 创建子FiberNode
 * @param wip 当前工作的 FiberNode 节点
 */
function updateFunctionComponent(wip: FiberNode) {
	// 生成函数组件的子FiberNode
	const nextChildren = renderWithHooks(wip);
	// 根据子FiberNode 生成子FiberNode
	reconcilerChildren(wip, nextChildren);
	return wip.child;
}
