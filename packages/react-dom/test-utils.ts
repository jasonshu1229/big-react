import { ReactElementType } from 'shared/ReactTypes';
// @ts-ignore
import { createRoot } from 'react-dom';

export function renderInToContainer(element: ReactElementType) {
	const div = document.createElement('div');
	createRoot(div).render(element);
}
