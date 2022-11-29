import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

// ReactElement 对象的每个节点都会生成与之对应的 FiberNode
// React针对不同的 ReactElement 对象会产生不同tag（种类）的 FiberNode
export class FiberNode {
	// 跟自身有关的属性
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	ref: Ref;
	stateNode: any;

	// 跟工作单元有关的属性
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	memoizedProps: Props | null;
	// 双缓冲树的切换
	alternate: FiberNode | null;
	flags: Flags;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例自身上的属性
		this.tag = tag;
		this.key = key;
		// HostComponent <div> => Dom
		this.stateNode = null;
		// FunctionComponent () => 这个函数本身
		this.type = null;

		this.ref = null;

		// 作为树状结构
		// 一个子级 fiberNode 指向 父级 FiberNode
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		// 作为工作单元
		this.pendingProps = pendingProps; // 刚开始的props
		this.memoizedProps = null;

		// 用于 current Fiber树和 workinProgress Fiber树的切换
		this.alternate = null;
		// 副作用 比如插入 更改 删除dom等
		this.flags = NoFlags;
	}
}
