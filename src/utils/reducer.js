const initialState = { number: 0 }

const initReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT': {
      state.number += 1
      return { ...state }
    }
    default:
      return state
  }
}

export default initReducer
