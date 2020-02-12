import _ from 'lodash'
const initState = {
  imageSelected: {},
  imageWafers: {}
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_IMAGE_SELETED': {
      const { name, selected } = action.payload
      const imageSelected = _.cloneDeep(state.imageSelected)
      imageSelected[name] = selected
      return {
        ...state,
        imageSelected
      }
    }
    case 'CHANGE_IMAGE_WAFERS': {
      const { name, wafers } = action.payload
      state.imageWafers[name] = wafers
      return state
    }
    default:
      return state
  }
}
