import React from 'react'
import { Provider } from 'react-redux'
import store from '@/utils/store'
import AppRouter from './router'

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppRouter />
      </Provider>
    )
  }
}

export default App
