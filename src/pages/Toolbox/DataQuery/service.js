import { post } from '@/utils/api'

const dataQuerySearch = data => post('gallery_map_filter/data_query', data)

export default dataQuerySearch
