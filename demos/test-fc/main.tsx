import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [num, dispatchNum] = useState(100);

	return <div>{num}</div>;
}

function Child() {
	return <span>big-react</span>;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
