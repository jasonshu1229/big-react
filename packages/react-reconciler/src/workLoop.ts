import { completeWork } from './completeWork';
import { beginWork } from './beginWork';
import { FiberNode } from './fiber';

// TODO：需要一个全局的指针，指向当时正在工作的 fiberNode 树，一般是 workInProgress
// 指向当前工作单元的指针
let workInProgress: FiberNode | null = null;

// 用于进行初始化的操作
function prepareFreshStack(fiber: FiberNode) {
	// 初始化将指针指向第一个fiberNode（root）
	workInProgress = fiber;
}

// 主要用于进行 更新的过程，那么可以推测出调用 renderRoot 应该是触发更新的 api
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
