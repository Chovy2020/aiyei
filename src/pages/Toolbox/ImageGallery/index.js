/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Select, Pagination, Radio, Checkbox, Button, Input, Upload, Icon, message } from 'antd'
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
// import _ from 'lodash'
// import { injectReducer } from '@/utils/store'
import { delay } from '@/utils/web'
// import { changeForm, changeItems } from './action'
// import { DATA_QUERY_QUERY, DATA_QUERY_INIT } from './constant'
// import reducer from './reducer'
import { getClassCodes, getViewFilters, getImages, updateDefectGroup } from './service'
import { StyleImageGallery, StyleImages } from './style'
import CommonDrawer from '@/components/CommonDrawer'

const layoutSize = [3, 4, 5]

class ImageGallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      layout: {
        num1: 3,
        num2: 3,
        showLabel: true
      },
      categoryTypes: [
        ['Manual Bin', 'mb'],
        ['Rough Bin', 'rb'],
        ['ADC Bin', 'adc']
      ],
      categoryType: 'mb',
      classCodes: [], // ！通过接口获取
      classCode: '',
      viewGroups: [
        ['Manual Bin', 'mb'],
        ['Rough Bin', 'rb'],
        ['ADC Bin', 'adc'],
        ['Lot ID', 'lotId'],
        ['Wafer ID', 'waferId'],
        ['Step ID', 'stepId'],
        ['Product ID', 'productId'],
        ['scan time', 'scanTm'],
        ['review time', 'reviewTm']
      ],
      viewFilters: ['1', '2'],
      images: [],
      currentImages: [],
      selected: [],
      total: 0,
      pageNo: 1,
    }
  }

  componentDidMount() {
    const { items, itemSelected, defect } = this.props
    const images = []
    for (let i = 1;i < 100; i+= 1) {
      images.push({id: `${i}`})
    }
    this.setState({
      images,
      total: images.length
    })
    this.generateImages()
  }

  onLayoutChange = (key, value) => {
    const { layout } = this.state
    layout[key] = value
    this.setState({ layout })
    this.generateImages()
  }

  onPageSizeChange = pageNo => {
    this.setState({ pageNo })
    this.generateImages()
  }

  generateImages = async () => {
    await delay(1)
    const { layout, pageNo, images  } = this.state
    const pageSize = layout.num1 * layout.num2
    const currentImages = images.filter((img, index) => index >= pageSize * (pageNo - 1) && index < pageSize * pageNo)
    this.setState({ currentImages })
  }

  onFormReset = () => {}

  onFormSubmit = () => {}

  onDefectClassChange = () => {}

  onFilterSubmit = () => {

  }

  render() {
    const { name } = this.props
    const { layout, categoryTypes, classCodes, viewGroups, viewFilters, currentImages, total, pageNo } = this.state
    const { num1, num2, showLabel } = layout

    return (
      <StyleImageGallery>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label='Layout:'>
            <Select defaultValue={num1} style={{ width: 60 }} onChange={v => this.onLayoutChange('num1', v)}>
              {layoutSize.map(s => (
                <Select.Option value={s} key={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <span style={{ marginRight: 10 }}>X</span>
            <Select defaultValue={num2} style={{ width: 60 }} onChange={v => this.onLayoutChange('num2', v)}>
              {layoutSize.map(s => (
                <Select.Option value={s} key={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <Checkbox onChange={e => this.setState({ showLabel: e.target.checked })} defaultChecked={showLabel}>
              Show Label
            </Checkbox>
          </Form.Item>
          <Form.Item label='Classified:'>
            <Select style={{ width: 120 }}>
              {categoryTypes.map(t => (
                <Select.Option value={t[1]} key={t[1]}>
                  {t[0]}
                </Select.Option>
              ))}
            </Select>
            <Select style={{ width: 120 }}>
              {classCodes.map(c => (
                <Select.Option value={c} key={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
            <Button onClick={this.onFormSubmit} type='primary'>
              Ok
            </Button>
            <Button onClick={this.onFormReset} type='dashed'>
              Reset
            </Button>
          </Form.Item>
        </Form>

        <StyleImages className={`col${num1}`}>
          {currentImages.map(img => (
            <li key={img.id}>
            {/* <img :src="`http://161.189.50.41${img.url}`" alt="" /> */}
            <img src='../../../assets/images/logo.png' alt="" />
            {showLabel ? (
              <div className='wafer-info'>
                <p>Lot ID: {img.id}</p>
                <p>Wafer No: {}</p>
                <p>Defect ID: {}</p>
                <p>Equip ID: {}</p>
              </div>
            ) : null}
          </li>
          ))}
        </StyleImages>

        <Pagination total={total} showTotal={t => `Total: ${t}`} pageSize={num1 * num2} defaultCurrent={pageNo} onChange={this.onPageSizeChange} />
        
        <CommonDrawer ref={r => (this.drawer = r)} width={550}>
          <section>
            <h3 style={{ width: 140 }}>Display Settings</h3>
            <Form layout='vertical' labelCol={{ span: 5 }}>
              <Form.Item label='Group View:'>
                <Select style={{ width: 120 }}>
                  {viewGroups.map(g => (
                    <Select.Option value={g[1]} key={g[1]}>
                      {g[0]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label='Filters:'>
                <Checkbox.Group options={viewFilters} onChange={viewFilter => this.setState({ viewFilter })} />
              </Form.Item>
              <Form.Item label=' '>
                <Button onClick={this.onFilterSubmit} type='primary'>
                  Submit
                </Button>
            </Form.Item>
            </Form>
          </section>
        </CommonDrawer>
      </StyleImageGallery>
    )
  }
}

// injectReducer('ImageGallery', reducer)
const mapStateToProps = state => ({
  ...state.Init
})
const mapDispatchToProps = {}
export default connect(mapStateToProps, mapDispatchToProps)(ImageGallery)
