import path from 'path';
import fs from 'fs';

// 引入打包用的 plugins
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const pkgPath = path.resolve(__dirname, '../../packages'); // 开发环境下的包的路径
const distPath = path.resolve(__dirname, '../../dist/node_modules'); // 打包之后的产物路径

/**
 * 通过包的名字获取对应包里的package.json，再序列化成对象
 * @param {*} pkgName 包的名字
 */
export function getPackageJSON(pkgName) {
	// 通过pkgName找到对应的package.json
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	// 通过path找到对应的package.json用 utf-8读写
	const str = fs.readFileSync(path, { encoding: 'utf-8' });
	// 序列化成对象
	return JSON.parse(str);
}

/**
 * 解析包的路径
 * @param {*} pkgName 包的名字
 * @param {*} isDist 是否是生产环境下
 * @returns 包的路径
 */
export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pkgPath}/${pkgName}`;
}

/**
 * 获得所有基础的打包用的plugins
 */
export function getBaseRollupPlugins({
	alias = {
		__DEV__: true,
		preventAssignment: true
	},
	typescript = {}
} = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
