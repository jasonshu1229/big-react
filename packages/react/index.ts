import { jsxDEV } from './src/jsx';
import { Dispatcher, resolveDispatcher } from './src/currentDispatcher';
import currentDispatcher from './src/currentDispatcher';

/**
 *
 * @param initialState 初始值
 * @returns 返回 useState 方法
 */
export const useState: Dispatcher['useState'] = (initialState) => {
	// 获取Dispatcher中的useState方法
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

// 内部数据共享层
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
};

// 定义 react 包的相关数据
export default {
	version: '0.0.0',
	createElement: jsxDEV
};
