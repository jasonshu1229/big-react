import { Placement } from './fiberFlags';
import { HostText } from './workTags';
import { REACT_ELEMENT_TYPE } from './../../shared/ReactSymbols';
import { ReactElementType } from './../../shared/ReactTypes';
import { FiberNode, createFiberFromElement } from './fiber';

/**
 *
 * @param shouldTrackEffects 代表需不需要标记副作用
 * @returns 生成子节点，并标记副作用
 */
function ChildReconciler(shouldTrackEffects: boolean) {
	// reconcilerSingleElement 根据元素的类型和属性创建一个新的fiber节点，并将其链接到当前fiber树上
	function reconcilerSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		// 根据element创建fiber，再返回
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcilerSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
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
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType // 子节点的 reactElement
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

		if (__DEV__) {
			console.warn('未实现的reconciler类型', newChild);
		}

		return null;
	};
}

// update阶段 追踪副作用
export const reconcilerChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
