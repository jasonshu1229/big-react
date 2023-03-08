import { ChildDeletion, Placement } from './fiberFlags';
import { HostText } from './workTags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ReactElementType, Props } from 'shared/ReactTypes';
import {
	FiberNode,
	createFiberFromElement,
	createWorkInProgress
} from './fiber';

/**
 * 生成子节点，并标记副作用
 * @param shouldTrackEffects 代表需不需要标记副作用
 * @returns 生成子节点，并标记副作用
 */
function ChildReconciler(shouldTrackEffects: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffects) {
			// 因为如果不需要标记副作用，那么就不需要删除节点
			return;
		}
		// 父节点的 deletions 数组中标记了需要删除的节点结合
		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	}
	// reconcilerSingleElement 根据元素的类型和属性创建一个新的fiber节点，并将其链接到当前fiber树上
	function reconcilerSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		const key = element.key;
		work: if (currentFiber !== null) {
			if (currentFiber.key === key) {
				// key 相同
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === element.type) {
						// type 相同
						const existing = useFiber(currentFiber, element.props);
						existing.return = returnFiber;
						return existing;
					}
					// key相同，type不同，不可复用，删除旧节点
					deleteChild(returnFiber, currentFiber);
					break work;
				} else {
					if (__DEV__) {
						console.warn('还未实现的reactElement类型', element);
						break work;
					}
				}
			} else {
				// key 不同 要删掉旧的节点
				deleteChild(returnFiber, currentFiber);
			}
		}
		// 根据element创建fiber，再返回
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}
	/**
	 * 创建一个文本节点的fiber节点，并将其链接到当前fiber树上
	 * @param returnFiber 父节点的fiber
	 * @param currentFiber 子节点的currentFiber
	 * @param content 文本节点的内容
	 * @returns 返回一个文本节点的fiber
	 */
	function reconcilerSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		if (currentFiber != null) {
			// update
			if (currentFiber.tag === HostText) {
				// 类型没变，可以复用
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				return existing;
			}
			// div -> text123
			deleteChild(returnFiber, currentFiber);
		}
		// mount
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	// 插入单一节点并判断什么时候追踪副作用
	function placeSingChild(fiber: FiberNode) {
		// 刚创建的fiber 应该是正在工作的 fiber 单元，所以 fiber 是 workInProgress
		// workInProgress.alternate 也就是 current fiber
		if (shouldTrackEffects && fiber.alternate === null) {
			// current fiber 是 null 的话也就是 首屏渲染
			// 按位或运算
			fiber.flags |= Placement;
		}
		return fiber;
	}

	// 用来标记 fiberNode 的插入、删除、移动
	return function reconcilerChildFibers(
		/**
		 * returnFiber 父节点的 fiber
		 */
		returnFiber: FiberNode,
		/**
		 * currentFiber 子节点的 currentFiber
		 */
		currentFiber: FiberNode | null,
		/**
		 * newChild 子节点的 reactElement
		 */
		newChild?: ReactElementType
	) {
		// 判断当前 fiber 的类型
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingChild(
						reconcilerSingleElement(returnFiber, currentFiber, newChild)
					);
				default:
					if (__DEV__) {
						console.warn('未实现的reconciler类型', newChild);
					}
					break;
			}
		}

		// HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingChild(
				reconcilerSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		// 兜底情况
		if (currentFiber !== null) {
			// 为什么要删除呢？
			// 因为如果不删除，那么就会出现一个问题，就是当你的组件的子节点是一个文本节点，
			// 那么当你的组件的子节点变成了一个reactElement的时候，那么就会出现一个问题，
			// 就是文本节点不会被删除，而是会被复用，这样就会出现一个问题，就是文本节点的内容不会被更新，因为文本节点的内容是通过props.content来获取的，
			// 而props.content是在创建fiber的时候就已经确定了，所以这里就需要删除旧的文本节点，然后再创建一个新的文本节点
			deleteChild(returnFiber, currentFiber);
		}

		if (__DEV__) {
			console.warn('未实现的reconciler类型', newChild);
		}

		return null;
	};
}

/**
 * 使用复用传入的 fiber
 * @param fiber 需要复用的fiber
 * @param pendingProps 需要复用的fiber的props
 */
function useFiber(fiber: FiberNode, pendingProps: Props) {
	const clone = createWorkInProgress(fiber, pendingProps);
	clone.index = 0; // 标记为复用的的第一个fiber
	clone.sibling = null;
	return clone;
}

// update阶段 追踪副作用
export const reconcilerChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
