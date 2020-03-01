import React from 'react'
import styled from 'styled-components'
// import HotKeys from 'react-hot-keys'
// import _ from 'lodash'
// import Image2B from '@/assets/images/2B.jpg'

const StyleImages = styled.ul`
  margin: 10px;
  border: 1px solid #aaa;
  width: 880px;
  min-height: 500px;
  list-style: none;
  li {
    width: 150px;
    height: 150px;
    margin: 5px;
    float: left;
    border: 2px solid #ccc;
    &.selected {
      border-color: #00f;
    }
    img {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
`

class Hotkeys extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      images: [],
      selected: [],
      shiftOn: false
    }
  }

  componentDidMount() {
    const images = []
    for (let i = 0; i < 15; i++) {
      images.push({
        id: i,
        url: 'http://xiaozhazha.com/public/img/singer-wafer.343edda7.jpg'
      })
    }
    this.setState({ images })
    const body = document.getElementsByTagName('body')[0]
    body.addEventListener('keydown', e => {
      if (e.keyCode === 16) {
          this.setState({ shiftOn: true })
      }
    })
    body.addEventListener('keyup', e => {
      if (e.keyCode === 16) {
          this.setState({ shiftOn: false })
      }
    })
  }

  onImageClick = nextId => {
    const { shiftOn, images } = this.state
    let { selected } = this.state
    const len = selected.length
    if (shiftOn && len > 0 && !selected.includes(nextId)) {
      const prevId = selected[len - 1]
      // 需要考虑分组，仅连选组内item
      let lastIndex = 0
      let nextIndex = 0
      for (const i in images) {
        if (images[i].id === prevId) lastIndex = parseInt(i)
        if (images[i].id === nextId) nextIndex = parseInt(i)
      }
      for (const i in images) {
        if (nextIndex > lastIndex && i > lastIndex && i <= nextIndex) selected.push(images[i].id)
        if (nextIndex < lastIndex && i >= nextIndex && i < lastIndex) selected.push(images[i].id)
      }
    } else {
      if (selected.includes(nextId)) {
        selected = selected.filter(imgId => imgId !== nextId)
      } else {
        selected.push(nextId)
      }
    }
    this.setState({ selected })
  }

  onKeyUp(keyName, e, handle) {
    this.setState({ shiftOn: false })
  }
  onKeyDown(keyName, e, handle) {
    this.setState({ shiftOn: true })
  }

  render() {
    const { images, selected } = this.state

    return (
      <div>
        <h2>Hotkeys</h2>
        {/* <HotKeys keyName='space' onKeyDown={this.onKeyDown.bind(this)} onKeyUp={this.onKeyUp.bind(this)}> */}
        <StyleImages>
          {images.map(img => (
            <li
              key={img.id}
              className={selected.includes(img.id) ? 'selected' : ''}
              onClick={() => this.onImageClick(img.id)}
            >
              <img src={img.url} alt='' />
            </li>
          ))}
        </StyleImages>
        {/* </HotKeys> */}
      </div>
    )
  }
}

export default Hotkeys
