import { NoFlags } from './fiberFlags';
import {
	Container,
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { HostComponent, HostText, HostRoot } from './workTags';
import { FiberNode } from './fiber';

export const completeWork = (wip: FiberNode) => {
	// 递归中的归

	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update 阶段
			} else {
				// mount 阶段
				// 1.构建DOM
				// 浏览器环境就是DOM节点，原生开发就是原生native组件
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type);
				// 2.将DOM插入到DOM树中，这步其实也就是将刚才递归遍历的DOM树，都挂载在统一的dom上
				// 也就是构建离谱DOM树
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			// 冒泡子树副作用标识
			bubblePropertied(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update 阶段
			} else {
				// mount 阶段
				// 1.构建DOM
				// 浏览器环境就是DOM节点，原生开发就是原生native组件
				const instance = createTextInstance(newProps.content); // newProps.conten： string || number
				// 将文本属性生成的实例挂载在文本节点上
				wip.stateNode = instance;
				// 文本节点不存在 child
			}
			bubblePropertied(wip);
			return null;
		case HostRoot:
			bubblePropertied(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork情况', wip);
			}
			break;
	}
};

/*
	<A>123</A>

	<h1>
		<A />
		<A />
	</h1>
*/
// 往 parent 节点中插入 wip，但有可能 wip 不是单独的元素，还有可能是组件，比如上面的情况
function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;

	while (node !== null) {
		// 首先向下找
		if (node.tag === HostComponent || node.tag === HostText) {
			// 找到了就可以插入
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 如果没有要找的元素类型，也向下找
			// A 组件里还有 child
			node.child.return = node;
			node = node.child;
			continue;
		}

		// 归的阶段，回归到了本节点
		if (node === wip) {
			return;
		}

		// 向下找到头了，就开始向上找
		while (node.sibling == null) {
			// 往上归
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		// 建立联系
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

// completeWork性能优化策略：利用completeWork向上归的过程
// 将子fiberNode的flags冒泡到父fiberNode
function bubblePropertied(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		// 将子节点的副作用标记集成到当前节点的副作用标识中
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		// 把当前节点的子节点和父节点联系起来
		child.return = wip;
		child = child.sibling;
	}
	// 将遍历到的所有 subtreeFlags 附加在当前 wip 的 subtreeFlags 上
	wip.subtreeFlags |= subtreeFlags;
}
