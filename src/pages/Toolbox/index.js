import React from 'react'
import { Icon } from 'antd'
import { StyleToolbox, Tools, Content } from './style'

class Toolbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tools: [
        {
          link: 'excursion',
          title: 'Excursion',
          icon: 'dashboard'
        },
        {
          link: 'baseline',
          icon: 'file-image',
          title: 'Baseline Reporting'
        },
        {
          link: 'toolbox',
          icon: 'tool',
          title: 'Toolbox'
        },
        {
          link: 'setup',
          icon: 'setting',
          title: 'Set Up'
        }
      ]
    }
  }

  render() {
    const { content } = this.props
    const { tools } = this.state
    return (
      <StyleToolbox>
        <Tools>
          {tools.map(t => (
            <Icon type={t.icon} />
          ))}
        </Tools>
        <Content>
          {content}
        </Content>
      </StyleToolbox>
    )
  }
}

export default Toolbox
