import { post } from '@/utils/api'

// cluster查询
export const getCluster = data => post('cfg_db/cluster/query', data)
