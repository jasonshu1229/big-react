import { completeWork } from './completeWork';
import { beginWork } from './beginWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';

// TODO：需要一个全局的指针，指向当时正在工作的 fiberNode 树，一般是 workInProgress
// 指向当前工作单元的指针
let workInProgress: FiberNode | null = null;

// 用于进行初始化的操作
function prepareFreshStack(root: FiberRootNode) {
	// 初始化将指针指向第一个fiberNode（root）
	workInProgress = createWorkInProgress(root.current, {});
}

/*
markUpdateFromFiberToRoot 函数的作用是将一个Fiber节点的更新标记打上，
然后将这个标记一直向上遍历父节点，直到遍历到根节点，将根节点的更新标记也打上。
这个函数通常在一个组件内部的Fiber树上的更新发生时被调用，用于标记哪些组件需要更新，
然后将这些标记一直向上冒泡，最后标记整个应用需要更新。
*/
// 找到根节点，从根节点开始更新整个组件
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode; // 此时的 HostRootFiber 指向 FiberRootNode
	}
	// 可能是Portal节点，也可能是 Suspense节点
	return null;
}

// 在fiber中更新调度
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 调度功能 xxx
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

// 作用是用来创建fiber树，进而和更新流程联系起来
// 那么可以推测出调用 renderRoot 应该是触发更新的 api
function renderRoot(root: FiberNode) {
	// 初始化
	prepareFreshStack(root);

	// 执行递归
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.log('workLoop发生错误', e);
			workInProgress = null;
		}
	} while (true);
}

// 该函数用于调度和执行 FiberNode 树的更新和渲染过程
// 该函数的作用是处理 React 程序中更新请求，计算 FiberNode 树中的每个节点的变化，并把这些变化同步到浏览器的DOM中
function workLoop() {
	while (workInProgress !== null) {
		// 开始执行每个工作单元的工作
		performUmitOfWork(workInProgress);
	}
}

// 在这个函数中，React 会计算 FiberNode 节点的变化，并更新 workInProgress
function performUmitOfWork(fiber: FiberNode) {
	// 如果有子节点，就一直遍历子节点
	const next = beginWork(fiber);
	// 递执行完之后，需要更新下工作单元的props
	fiber.memoizedProps = fiber.pendingProps;

	// 没有子节点的 FiberNode 了，代表递归到最深层了。
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		// 如果有子节点的 FiberNode，则更新子节点为新的 fiberNode 继续执行
		workInProgress = next;
	}
}

// 主要进行归的过程，向上遍历父节点以及兄弟，更新它们节点的变化，并更新 workInProgress
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		// 归：没有子节点之后开始向上遍历父节点
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			// 有兄弟节点时，将指针指到兄弟节点
			workInProgress = sibling;
			return;
		}
		// 兄弟节点不存在时，递归应该继续往上指到父亲节点
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
