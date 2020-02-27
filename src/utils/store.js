import { createStore, combineReducers } from 'redux'
// eslint-disable-next-line import/no-extraneous-dependencies
import { devToolsEnhancer } from 'redux-devtools-extension/logOnlyInProduction'
import initReducer from './reducer'

const staticReducers = { Init: initReducer }

const createReducer = asyncReducers => {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers
  })
}

const store = createStore(createReducer(), devToolsEnhancer())

store.asyncReducers = {}

export const injectReducer = (key, asyncReducer) => {
  store.asyncReducers[key] = asyncReducer
  store.replaceReducer(createReducer(store.asyncReducers))
}

export default store
