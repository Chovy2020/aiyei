import {
  createStore,
  combineReducers
} from 'redux'
import initReducer from './reducer'

const staticReducers = { init: initReducer }

function createReducer(asyncReducers) {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers
  })
}

const store = createStore(createReducer())

store.asyncReducers = {}

export default store

export const injectReducer = (key, asyncReducer) => {
  store.asyncReducers[key] = asyncReducer
  store.replaceReducer(createReducer(store.asyncReducers))
}
