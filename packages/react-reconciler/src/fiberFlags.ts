export type Flags = number;

// 每个 flag 占一个位
export const NoFlags = 0b0000001; // 当前没有标记
export const Placement = 0b0000010; // 插入
export const Update = 0b0000100; // 更新属性
export const ChildDeletion = 0b0001000; // 删除子节点
