import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

// ReactElement 对象的每个节点都会生成与之对应的 FiberNode
// React针对不同的 ReactElement 对象会产生不同tag（种类）的 FiberNode
// fiber.ts 存放 FiberNode 的数据结构
export class FiberNode {
	// 跟自身有关的属性
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	ref: Ref;
	stateNode: any;

	// 跟工作单元其它节点有关的属性
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	memoizedProps: Props | null;
	memoizedState: any;

	alternate: FiberNode | null; // 双缓冲树的切换
	subtreeFlags: Flags; // 子树中包含的flags
	flags: Flags; // fiberNode 双缓冲树对比之后产生的标记，比如插入，移动，删除等

	updateQueue: unknown;

	// pendingProps 有哪些 props 需要改变
	// key：对应的是 ReactElement 的 key
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例自身上的属性
		this.tag = tag;
		this.key = key;
		// HostComponent <div> => Dom
		this.stateNode = null;
		// FunctionComponent () => 这个函数本身
		this.type = null;

		this.ref = null;

		// fiber 除了有自身实例上的属性，还需要有表示和其它节点的关系
		// 作为树状结构
		// 一个子级 fiberNode 指向 父级 FiberNode：表示子 fiberNode 工作结束后要 return 到父fiberNode工作
		this.return = null;
		// 右边的兄弟 fiberNode
		this.sibling = null;
		// 子 fiberNode
		this.child = null;
		// <li>1</li> <li>2</li> 表示它的序号
		this.index = 0;

		// 作为工作单元
		this.pendingProps = pendingProps; // 刚开始工作阶段的 props
		this.memoizedProps = null; // 工作结束时确定下来的 props
		this.memoizedState = null; // 更新完成后的新 state
		this.updateQueue = null; // Fiber产生的更新操作都会放在更新队列中
		this.alternate = null; // 用于 current Fiber树和 workInProgress Fiber树的切换（如果当时fiberNode树是current树，则alternate指向的是workInProgress树）

		// 副作用
		this.flags = NoFlags; // （比如插入 更改 删除dom等）初始状态时表示没有任何标记（因为还没进行fiberNode对比）
		this.subtreeFlags = NoFlags; // 子节点副作用标识
	}
}

export class FiberRootNode {
	container: Container; // 保存宿主环境挂载的节点(DomELement或者原生组件)
	current: FiberNode; // 指向当前渲染的Fiber树的根节点，也就是 hostRootFiber
	finishedWork: FiberNode | null; // 指向完成更新后的新的Fiber树的根节点
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

/**
 * workInProgress Fiber表示渲染阶段正在处理的组件
 * 该函数主要用来创建或复用一个workInProgress Fiber对象
 * @param current 当前的Fiber对象
 * @param pendingProps 新的属性对象
 * @returns
 */
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;

	if (wip === null) {
		// mount阶段
		wip = new FiberNode(current.tag, pendingProps, current.key);
		// 创建一个新的 Fiber对象（HostFiberNode，例如根元素 div），并复制current的属性和标记
		wip.type = current.type;
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update阶段
		// 复用，更新属性标记
		wip.pendingProps = pendingProps;
		// 清除副作用，可能是上一次更新遗留下来的
		wip.flags = NoFlags;
		// 子树的副作用标识
		wip.subtreeFlags = NoFlags;
	}
	// 把 current节点对应的 fiber tree 上的工作单元复制到 wip上
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
};

// 根据element创建 FiberNode
export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// <div>111</div> type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}

	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
