import React from 'react'
import { connect } from 'react-redux'
import { Form, Pagination, Radio, Button, Input } from 'antd'
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
// import _ from 'lodash'
// import { injectReducer } from '@/utils/store'
// import { delay } from '@/utils/web'
// import { changeForm, changeItems } from './action'
// import { DATA_QUERY_QUERY, DATA_QUERY_INIT } from './constant'
// import reducer from './reducer'
import { getTags, getFilters } from './service'
import { StyleMapGallery, StyleWaferMapGroup, StyleWaferMap } from './style'

class MapGallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      galleryType: 'Map', // 当前选中的类型
      galleryTypes: ['Map', 'Die Stack', 'Reticle Stack', 'Heat Map'], // 4种类型列表
      waferListGroup: {},
      // 右侧各种过滤条件
      tags: {
        mbs: [],
        abc: [],
        rbs: [],
        tests: [],
        clusterIds: [],
        repeaterIds: [],
        zoneIds: [],
        subDieIds: []
      },
      // 用户当前勾选的过滤条件
      tagsSeleted: {
        mbs: [],
        adc: [],
        rbs: [],
        tests: [],
        clusterIds: [],
        repeaterIds: [],
        zoneIds: [],
        subDieIds: []
      },
      group: {
        fileId: '',
        by: []
      },
      adderFlag: false,
      defectSize: ['', ''],
      waferSelected: [],
      total: 0,
      pageSize: 10,
      pageNo: 1
    }
  }

  async componentDidMount() {
    const { items, itemSelected, defect } = this.props
    const data = {
      ...defect,
      comboBoxes: items.map((item, index) => ({
        key: item,
        value: itemSelected[index]
      }))
    }
    this.setState({ tags: await getTags(data) })
    // this.loadFilters()
  }

  loadFilters = async isDelete => {
    const { items, itemSelected } = this.props
    const { tagsSeleted, waferSelected, adderFlag, pageNo, pageSize, group, defectSize } = this.state
    const data = {
      ...tagsSeleted,
      adderFlag: adderFlag ? ['Y'] : ['N'],
      deleteIds: isDelete ? waferSelected : [],
      pageNumber: pageNo,
      pageSize,
      groupExcelRedisKey: group.fileId,
      groupList: group.by,
      comboBoxes: items.map((item, index) => ({
        key: item,
        value: itemSelected[index]
      }))
    }
    if (defectSize[0] === '') defectSize[0] = 0
    if (defectSize[1] === '') defectSize[1] = 1
    const num1 = parseFloat(defectSize[0])
    const num2 = parseFloat(defectSize[1])
    data.defectSize = [Math.min(num1, num2), Math.max(num1, num2)]
    const res = await getFilters(data)
  }

  onRadioChange = e => {
    this.setState({ galleryType: e.target.value })
  }

  render() {
    const { name } = this.props
    const { galleryType, galleryTypes, waferListGroup, tags, total, pageSize, pageNo } = this.state

    return (
      <StyleMapGallery>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label={`Map Gallery-${name}:`} onChange={this.onRadioChange}>
            <Radio.Group defaultValue={galleryType}>
              {galleryTypes.map(t => (
                <Radio key={t} value={t}>
                  {t}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label='Action:'>
            <Button type='dashed'>Reset</Button>
            <Button type='primary'>Rotation</Button>
            <Button type='primary'>Export to CSV</Button>
            <Button type='primary'>Remove</Button>
          </Form.Item>
        </Form>
        <StyleWaferMapGroup>
          {Object.keys(waferListGroup).map(group => (
            <div key={group}>
              <h4>{group}</h4>
              <StyleWaferMap>
                {waferListGroup[group].map(wafer => (
                  <li key={wafer.id}>
                    <div
                      id={`tab${name}-${wafer.id}`}
                      className={`wafer ${galleryType === 'Map' || galleryType === 'Heat Map' ? 'radius' : ''}`}
                      style={wafer.degrees > 0 ? { transform: `rotate(${wafer.degrees}deg)` } : ''}
                    />
                    <p>Lot ID: {wafer.lotId}</p>
                    <p>Wafer No: {wafer.waferNo}</p>
                    <p>Step ID: {wafer.stepId}</p>
                    <p>Total: {wafer.total || 0}</p>
                  </li>
                ))}
              </StyleWaferMap>
            </div>
          ))}
        </StyleWaferMapGroup>
        <Pagination total={total} showTotal={t => `Total: ${t}`} pageSize={pageSize} defaultCurrent={pageNo} />
        <div>{tags.mbs.length}</div>
      </StyleMapGallery>
    )
  }
}

// injectReducer('MapGallery', reducer)
const mapStateToProps = state => ({
  ...state.Init,
  ...state.DataQuery
})
const mapDispatchToProps = {}
export default connect(mapStateToProps, mapDispatchToProps)(MapGallery)
