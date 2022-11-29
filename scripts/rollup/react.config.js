import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils';
('./utils');

import generatePackageJson from 'rollup-plugin-generate-package-json';

// 读取 react 包下面的 name 字段
const { name, module } = getPackageJSON('react');
// react包的路径
const pkgPath = resolvePkgPath(name);
// react的产物路径
const pkgDisPath = resolvePkgPath(name, true);

// react 包的打包配置
export default [
	// react包
	{
		input: `${pkgPath}/${module}`,
		output: {
			file: `${pkgDisPath}/index.js`,
			name: 'index.js',
			format: 'umd' //兼容esmodule 和 commonjs
		},
		plugins: [
			...getBaseRollupPlugins(),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDisPath,
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					main: 'index.js'
				})
			})
		]
	},
	// jsx-runtime
	{
		input: `${pkgPath}/src/jsx.ts`,
		output: [
			// jsx-runtime
			{
				file: `${pkgDisPath}/jsx-runtime.js`,
				name: 'jsx-runtime.js',
				format: 'umd'
			},
			// jsx
			{
				file: `${pkgDisPath}/jsx-dev-runtime.js`,
				name: 'jsx--dev-runtime.js',
				format: 'umd'
			}
		],
		plugins: getBaseRollupPlugins()
	}
];
