import { Action } from 'shared/ReactTypes';

export interface Dispatcher {
	useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
}

export type Dispatch<State> = (action: Action<State>) => void;

// 当前使用的 hooks 的集合
// current 表示当前正在使用的 hooks
const currentDispatcher: { current: Dispatcher | null } = {
	current: null
};

/**
 *
 * @returns 返回当前正在使用的 hooks
 */
export const resolveDispatcher = (): Dispatcher => {
	// 获取当前正在使用的 hooks
	const dispatcher = currentDispatcher.current;

	if (dispatcher === null) {
		throw new Error('hook只能在函数组件中进行使用');
	}

	return dispatcher;
};

export default currentDispatcher;
