import Loadable from 'react-loadable'

import Loader from '@/containers/Loader'

export default Loadable({
  loader: () => import('./index'),
  loading: Loader
})
