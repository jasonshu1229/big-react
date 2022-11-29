import { completeWork } from './completeWork';
import { beginWork } from './beginWork';
import { FiberNode } from './fiber';

// 指向当前工作单元的指针
let workInProgress: FiberNode | null = null;

function prepareFreshStack(fiber: FiberNode) {
	// 初始化将指针指向第一个fiberNode（root）
	workInProgress = fiber;
}

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

function workLoop() {
	while (workInProgress !== null) {
		// 开始执行每个工作单元的工作
		performUmitOfWork(workInProgress);
	}
}

function performUmitOfWork(fiber: FiberNode) {
	// 如果有子节点，就一直遍历子节点
	const next = beginWork(fiber);
	// 递执行完之后，需要更新下工作单元的props
	fiber.memoizedProps = fiber.pendingProps;

	// 没有子节点的 FiberNode 了
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

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
		// 否则往上指到父亲节点
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
