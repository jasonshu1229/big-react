// isValidElement 为啥要起别名？
import { jsxDEV, jsx, isValidElement as isValidElementFn } from './src/jsx';
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
export const version = '0.0.0';
// TODO 根据环境区分使用jsx/jsxDEV
// 开发 jsxDEV 生产 jsx
export const createElement = jsx;
export const isValidElement = isValidElementFn;
