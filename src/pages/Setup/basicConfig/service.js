import { post } from '@/utils/api'

// cluster查询
export const getCluster = data => post('cfg_db/cluster/query', data)

// cluster更新
export const updateCluster = data => post('cfg_db/cluster/edit', data)

export const deleteCluster = data => post('cfg_db/cluster/delete', data)

// add 查询
export const getAdder = data => post('cfg_db/adder/query', data)

// add 更新
export const updateAdder = data => post('cfg_db/adder/edit', data)

export const deleteAdder = data => post('cfg_db/adder/delete', data)

// zone 查询
export const getZone = data => post('cfg_db/zone/query', data)

// zone 更新
export const updateZone = data => post('cfg_db/zone/edit', data)

// sub_die查询
export const getSubDie = data => post('cfg_db/sub_die/query', data)

// sub_die更新
export const updateSubDie = data => post('cfg_db/sub_die/edit', data)

export const deleteSubDie = data => post('cfg_db/sub_die/delete', data)

// repeater查询
export const getRepeater = data => post('cfg_db/repeater/query', data)

// repeater更新
export const updateRepeater = data => post('cfg_db/repeater/edit', data)

export const deleteRepeater = data => post('cfg_db/repeater/delete', data)
