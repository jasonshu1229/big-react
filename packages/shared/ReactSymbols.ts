const supportSymbol = typeof Symbol === 'function' && Symbol.for;

// 为了不滥用 React.elemen，所以为它创建一个单独的键
// 为React.element元素创建一个 symbol 并放入到 symbol 注册表中
export const REACT_ELEMENT_TYPE = supportSymbol
	? Symbol.for('react.element')
	: 0xeac7;
