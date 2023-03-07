import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

// 代表更新的数据结构 - Update
export interface Update<State> {
	action: Action<State>;
}

/*
this.setState({ xx: 1 })
this.setState(({ xx: 1 }) => { xx: 2 })
 */

// shared 一般表示多个 Fiber 节点之间共享的属性，
// shared.pending（类似指针） 表示更新队列中下一个待处理的更新操作，如果没有更新操作则为 null
// UpdateQueue 表示一个更新队列，其中包含了一组更新操作（Update类型的对象）
export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null; // 用于保存hook的dispatch
}

// 定义一个创建 Update实例的方法，返回值是一个 Update实例
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

// 定义一个创建 UpdateQueue 队列实例的方法
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
};

// 往 UpdateQueue 里增加 Update 更新操作的任务
// 将 Update 插入到 UpdateQueue
export const enqueueUpdate = <State>(
	UpdateQueue: UpdateQueue<State>,
	Update: Update<State>
) => {
	UpdateQueue.shared.pending = Update;
};

// 定义一个 UpdateQueue 消费 Update实例的方法，遍历链表中的所有Update对象，并返回最新的state
// 一个初始的状态，以及要消费的Update
// 返回值是一个全新的状态
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};

	// 如果有正在消费的状态
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 Update (x) => 4x -> memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 Update 2 ->  memoizedState 2
			result.memoizedState = action;
		}
	}

	return result;
};
