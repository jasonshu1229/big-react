import { ReactElementType } from 'shared/ReactTypes';
// @ts-ignore
import { createRoot } from 'react-dom';

/**
 * 将元素渲染到document中
 * @param element 要渲染的元素
 * @returns 返回element的根节点
 */
export function renderIntoDocument(element: ReactElementType) {
	const div = document.createElement('div');
	return createRoot(div).render(element);
}
