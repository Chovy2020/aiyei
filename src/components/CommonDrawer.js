import React from 'react'
import { Drawer, Button, Icon } from 'antd'
import styled from 'styled-components'

const StyleComomDrawer = styled.div`
  position: fixed;
  height: calc(100vh - 50px);
  bottom: 0;
  right: 0;
  button {
    position: fixed;
    border-radius: 0;
    right: 0;
    bottom: 0;
    min-width: 20px;
    width: 20px;
    padding: 0;
    height: calc(100vh - 50px);
  }
`
const StyleDrawer = styled(Drawer)``

class CommonDrawer extends React.Component {
  constructor(props) {
    super(props)
    this.state = { visible: false }
  }

  onClose = () => {
    this.setState({ visible: false })
  }

  render() {
    const { visible } = this.state
    const { children, width = 400 } = this.props
    return (
      <StyleComomDrawer>
        <Button onClick={() => this.setState({ visible: true })} type='primary'>
          <Icon type='caret-left' />
        </Button>
        <StyleDrawer width={width} visible={visible} closable={false} placement='right' onClose={this.onClose}>
          {children}
        </StyleDrawer>
      </StyleComomDrawer>
    )
  }
}

export default CommonDrawer
