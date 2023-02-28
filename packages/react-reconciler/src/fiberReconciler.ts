import { Container } from 'hostConfig';
import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

// 创建整个应用的根节点 FiberRootNode，并将它与 hostRootFiber 链接起来
// 在执行ReactDOM.createRoot()的时候会执行
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);

	// 与之前的更新流程联系
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

// 创建update，并enqueueUpdateQueue中，并将更新机制和首屏渲染hostRootFiber联系起来
// 在执行ReactDOM.createRoot(rootElement).render(<App />) 时执行，主要是 render
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current; // FiberRootNode实例指向的保存DOM结构的根节点
	// 接下来开始首屏渲染更新
	const update = createUpdate<ReactElementType | null>(element);
	// 将首屏渲染和触发更新机制联系了起来
	// 将update插入到hostRootFiber中的updateQueue中
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);

	// 触发函数更新，并调用scheduleUpdateOnFiber函数里的 renderRoot函数创建一个新的Fiber树
	scheduleUpdateOnFiber(hostRootFiber);

	return element;
}

// TODO：创建了mount时的api，并把api接入了更新流程
// api指 ReactDOM.createRoot(rootElement).render(<App />)
