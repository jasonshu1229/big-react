import { HostRoot, HostComponent, HostText } from './workTags';
import { Container, appendChildToContainer } from 'hostConfig';
import { NoFlags, MutationMask, Placement } from './fiberFlags';
import { FiberNode, FiberRootNode } from './fiber';

// 保存下一个需要执行的effecct 节点
let nextEffect: FiberNode | null = null;

// commitMutationEffects 函数主要用来完成副作用的执行，包括重置文本节点以及真实的dom节点的插入、删除和更新等操作。
export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		// 向下遍历
		const child: FiberNode | null = nextEffect.child;

		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			// 如果有子节点，且子节点有副作用，则将子节点作为下一个需要执行的effect节点
			nextEffect = child;
			continue;
		} else {
			// 如果没有子节点，或者子节点没有副作用(也就是说不是叶子节点，可能遇到第一个没有subtreeFlags的节点)，则当前节点可能存在 Flags，有的话需要执行副作用
			// 向上遍历
			up: while (nextEffect !== null) {
				// 如果当前节点有副作用，则执行副作用
				commitMutationEffectsOnFiber(nextEffect);

				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					// 如果有兄弟节点，且兄弟节点有副作用，则将兄弟节点作为下一个需要执行的effect节点
					break up;
				}
				// 如果没有兄弟节点，且父节点有副作用，则将父节点作为下一个需要执行的effect节点
				nextEffect = nextEffect.return;
			}
		}
	}
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		// 执行插入操作等
		commitPlacement(finishedWork);
		// 将 Placement 标记从 finishedWork当前工作的节点中 清除
		finishedWork.flags &= ~Placement;
		// flags Update
		// flags ChildDeletion
	}
};

// commitPlacement 函数主要用来完成真实的dom节点的插入、删除和更新等操作。
const commitPlacement = (finishedWork: FiberNode) => {
	// 需要获取 parentFiber Dom节点
	// 需要获取 finishedWork Dom节点
	if (__DEV__) {
		console.warn('执行Placement操作', finishedWork);
	}

	// parentFiber Dom节点
	const hostParent = getHostParent(finishedWork);
	// 1. finishedWork Dom节点  2. appendChild
	appendPlacementNodeInToContainer(finishedWork, hostParent);
};

// 该函数用于获取宿主环境里当前节点的父节点
function getHostParent(fiber: FiberNode): Container {
	let parent = fiber.return;

	while (parent) {
		const parentTag = parent.tag;
		// HostComponent HostRoot
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parent.tag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}

	if (__DEV__) {
		console.warn('未找到host parent');
	}
}

// 该函数用于将当前节点(fiber类型的)插入到宿主环境里的父节点中
function appendPlacementNodeInToContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	// fiber 需要找到对应的dom节点，然而这个fiber节点可能是一个组件，所以需要调用createInstance方法来创建一个真实的dom节点
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		// 插入真实的dom节点
		appendChildToContainer(finishedWork.stateNode, hostParent);
		return;
	}
	// 递归向下的过程，直到我们找到一个真实的dom节点（HostComponent 或 HostText）
	// 递归的过程中，会将所有的子节点和兄弟节点都插入到宿主环境里的父节点中
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeInToContainer(child, hostParent);

		let sibling = child.sibling;
		while (sibling !== null) {
			appendPlacementNodeInToContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
