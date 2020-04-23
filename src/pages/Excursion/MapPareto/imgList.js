import React from 'react'
import _ from 'lodash'
import { Modal, Pagination} from 'antd'
import { post  } from '@/utils/api'
import { delay } from '@/utils/web'

import { StyleImgList } from '../style'

class ImgList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      visible: false,
      largeImgList: [],
      currentItem: {},
      page: 1
    }
  }

  showAllImg = async(index) => {
    const largeImgList = this.props.imgInfo[index]
    const currentItem = largeImgList[0]
    this.setState({ largeImgList, visible: true, currentItem })
  }

  handleCancel = e => {
    this.setState({ visible: false })
  }

  changePage = (pageNo, pageSize) => {
    const page = pageNo
    const currentItem = this.state.largeImgList[pageNo-1]
    this.setState({page, currentItem})
  }

  render() {
    const {imgInfo} = this.props
    const { largeImgList, page, currentItem } = this.state
    return (
      <div>
        <StyleImgList>
          {imgInfo.map((item, index) => (
            <li key={index}>
              {item === null ? <span>No Photo</span> : <img src={'http://161.189.50.41'+item[0].imgUrl} onClick={() => this.showAllImg(index)}/>}
            </li>
          ))}
        </StyleImgList>
        <Modal
          title="More Photo"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <div>{page}/{largeImgList.length}</div>
          <img src={'http://161.189.50.41'+currentItem.imgUrl} width="100%" height="200px" style={{ background: '#000'}}/>
          <Pagination size="small" total={largeImgList.length} pageSize={1} showTotal={t => `Total: ${t}`} onChange={this.changePage} />
        </Modal>
      </div>
    )
  }
}

export default ImgList
