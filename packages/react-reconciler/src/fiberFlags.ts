export type Flags = number;

// 每个 flag 占一个位
export const NoFlags = 0b0000000; // 当前没有标记
export const Placement = 0b0000001; // 插入
export const Update = 0b0000010; // 更新属性
export const ChildDeletion = 0b0000100; // 删除子节点

// 如果当前节点 child flags 和 subtreeFlags 包括下面这三个副作用，则表示需要执行 mutation 阶段
export const MutationMask = Placement | Update | ChildDeletion; // 变更标记
