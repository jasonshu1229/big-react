import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils';
('./utils');

import generatePackageJson from 'rollup-plugin-generate-package-json';

import alias from '@rollup/plugin-alias';

// 读取 react-dom 包下面的 name 字段
const { name, module } = getPackageJSON('react-dom');
// react-dom包的路径
const pkgPath = resolvePkgPath(name);
// react-dom的产物路径
const pkgDisPath = resolvePkgPath(name, true);

// react-dom 包的打包配置
export default [
	// react-dom包
	{
		input: `${pkgPath}/${module}`,
		output: [
			{
				file: `${pkgDisPath}/index.js`,
				name: 'index.js',
				format: 'umd' //兼容esmodule 和 commonjs
			},
			{
				file: `${pkgDisPath}/client.js`,
				name: 'client.js',
				format: 'umd' //兼容esmodule 和 commonjs
			}
		],
		plugins: [
			...getBaseRollupPlugins(),
			// webpack resolve alias
			alias({
				entries: {
					// 这么做的作用是啥？ 为什么要这么做？
					// 为了解决react-dom包中的hostConfig.ts文件中的import { HostConfig } from 'react-reconciler/src/ReactFiberHostConfig';这种引用方式
					hostConfig: `${pkgPath}/src/hostConfig.ts`
				}
			}),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDisPath,
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					peerDependencies: {
						react: version
					},
					main: 'index.js'
				})
			})
		]
	}
];
