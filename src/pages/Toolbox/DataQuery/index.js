/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { connect } from 'react-redux'
import { Form, DatePicker, Checkbox, Button, Input } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import _ from 'lodash'
import { injectReducer } from '@/utils/store'
import { delay } from '@/utils/web'
import { changeParams, changeItems, changeItemSelected, changeFilterOption } from './action'
import { DATA_QUERY_QUERY, GET_LABEL } from './constant'
import reducer from './reducer'
import { dataQuerySearch, getTags } from './service'
import { StyleDataQuery, Title, LoaderGroup, LoaderDefect, DragContainer, DragItem, DragCard, DragList } from './style'

const generateData = () => {
  const data = []
  // eslint-disable-next-line no-unused-vars
  for (const key in DATA_QUERY_QUERY) {
    data.push({
      label: key,
      value: DATA_QUERY_QUERY[key]
    })
  }
  return data
}

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

class DataQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataLoaderList: ['Defect', 'Metrology', 'MES', 'EAP', 'WAT', 'CP', 'iEMS', 'SPC'], // Data Loader 列表,
      dataLoader: ['Defect'], // Data Loader 已选列表
      itemData: [], // 拖拽框列表数据
      itemKeyword: [] // 拖拽框搜索关键词
    }
    this.onDragEnd = this.onDragEnd.bind(this)
  }

  componentDidMount() {
    this.resetItems()
  }

  onSelect = (index, text) => {
    const { items, itemSelected } = this.props
    let list = itemSelected[index]
    if (list.includes(text)) list = _.remove(list, n => text !== n)
    else list.push(text)
    itemSelected[index] = list
    this.props.changeItemSelected(_.cloneDeep(itemSelected))
    // 更新下一列的数据
    if (index < items.length - 1) this.onSearch(index + 1)
  }

  // 搜索展示
  onSearch = async index => {
    const res = await this.search(index)
    // 第一列 则标记高亮 同时触发更新第二列数据，后续列为更新列表
    const { itemData, itemKeyword } = this.state
    itemData[index] = res
    // 清空后续列表
    const { itemSelected, items } = this.props
    for (const i in items) {
      if (i > index) {
        itemData[i] = []
        itemKeyword[i] = ''
      }
      if (i >= index) itemSelected[i] = []
    }
    this.setState({ itemData, itemKeyword })
    this.props.changeItemSelected(itemSelected)
  }

  // 标记
  onSearchMark = async index => {
    const res = await this.search(index)
    // 如果跳跃列选择，待选择列表为空，补充搜索结果进待选择列表
    const { itemData } = this.state
    if (!itemData[index] || itemData[index].length === 0) {
      itemData[index] = res
      this.setState({ itemData })
    }
    const { itemSelected, items } = this.props
    itemSelected[index] = res
    this.props.changeItemSelected(_.cloneDeep(itemSelected))
    if (index < items.length - 1) this.onSearch(index + 1)
  }

  onCheckboxChange(key, checked) {
    const { params } = this.props
    params[key] = checked
    this.props.changeParams(params)
    this.resetItems()
  }

  onSearchInput(index, value) {
    const { itemKeyword } = this.state
    itemKeyword[index] = value
    this.setState({ itemKeyword })
  }

  onDatePickerChange = (dates, dateStrings) => {
    const { params } = this.props
    const [startTm, endTm] = dateStrings
    params.startTm = startTm
    params.endTm = endTm
    this.props.changeParams(params)
    this.resetItems()
  }

  onQueryChange = value => {
    this.props.changeItems(value)
    this.resetItems()
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) return
    const source = result.source.index
    const destination = result.destination.index
    const min = Math.min(source, destination)
    const { items } = this.props
    this.props.changeItems(reorder(items, result.source.index, result.destination.index))
    if (min === 0) this.resetItems()
    else this.onSearch(min)
  }

  resetItems = async () => {
    await delay(1)
    const { items } = this.props
    this.setState({
      itemData: items.map(() => []),
      itemKeyword: items.map(() => '')
    })
    this.props.changeItemSelected(items.map(() => []))
    this.setState({ itemData: [await this.search(0)] })
  }

  loadItems = async () => {
    const { items, itemSelected, params } = this.props
    const { existsImg, mbHave, scanedFlag, seeLastScan, startTm, endTm } = params
    const data = {
      existsImg: existsImg ? 'Y' : 'N',
      mbHave: mbHave ? 'Y' : 'N',
      scanedFlag: scanedFlag ? 'Y' : 'N',
      seeLastScan: seeLastScan ? 'Y' : 'N',
      startTm: startTm !== '' ? startTm : '1970-01-01',
      endTm: endTm !== '' ? endTm : '2020-12-31',
      comboBoxes: items.map((item, index) => ({
        key: item,
        value: itemSelected[index]
      }))
    }
    const res = await getTags(data)
    if (res && res !== {}) {
      this.props.changeFilterOption({
        mb: res.mbs || [],
        adc: res.adc || [],
        rb: res.rbs || [],
        testId: res.tests || [],
        cluster: ['NO'],
        adder: ['NO'],
        repeater: ['NO'],
        zoneId: res.zoneIds || [],
        subDie: res.subDieIds || []
      })
    }
    this.props.addTab('Map Gallery')
  }

  search = async index => {
    await delay(1)
    const comboBoxes = []
    const { items, itemSelected } = this.props
    const { itemKeyword } = this.state
    for (let i = 0; i < items.length; i += 1) {
      // 按下标顺序来，不是当前列 就统计选中的list作为参数
      if (i < index) {
        comboBoxes.push({
          key: items[i],
          value: (itemSelected[i] && itemSelected[i].length > 0) ? itemSelected[i] : ['']
        })
      }
      // 是当前列，带上关键词  当前列的选中数据会被覆盖
      if (i === index) {
        // 模糊查询 前后加上 *
        comboBoxes.push({
          key: items[i],
          value: itemKeyword[i].split(',').map(k => `*${k}*`)
        })
        break
      }
    }
    // 实时更新，store的params仅点击load 才更新，用于其他非dataQuery页面的查询
    const { existsImg, mbHave, scanedFlag, seeLastScan, startTm, endTm } = this.props.params
    const data = {
      existsImg: existsImg ? 'Y' : 'N',
      mbHave: mbHave ? 'Y' : 'N',
      scanedFlag: scanedFlag ? 'Y' : 'N',
      seeLastScan: seeLastScan ? 'Y' : 'N',
      startTm: startTm !== '' ? startTm : '1970-01-01',
      endTm: endTm !== '' ? endTm : '2020-12-31',
      comboBoxes
    }
    const res = await dataQuerySearch(data)
    return res.result
  }

  render() {
    const { dataLoaderList, dataLoader, itemData } = this.state
    const { items, params, itemSelected } = this.props
    const { existsImg, mbHave, scanedFlag, seeLastScan } = params

    return (
      <StyleDataQuery>
        <Title className='bold'>Data Loader</Title>
        <LoaderGroup>
          <Checkbox.Group
            options={dataLoaderList}
            defaultValue={dataLoader}
            onChange={v => this.setState({ dataLoader: v })}
          />
        </LoaderGroup>
        <LoaderDefect>
          <Title>Defect</Title>
          <Form layout='vertical' labelCol={{ span: 2 }}>
            <Form.Item label='Filter:'>
              <Checkbox onChange={e => this.onCheckboxChange('existsImg', e.target.checked)} defaultChecked={existsImg}>
                有照片
              </Checkbox>
              <Checkbox onChange={e => this.onCheckboxChange('mbHave', e.target.checked)} defaultChecked={mbHave}>
                Manual Classified
              </Checkbox>
              <Checkbox
                onChange={e => this.onCheckboxChange('scanedFlag', e.target.checked)}
                defaultChecked={scanedFlag}
              >
                有前层scan结果
              </Checkbox>
              <Checkbox
                onChange={e => this.onCheckboxChange('seeLastScan', e.target.checked)}
                defaultChecked={seeLastScan}
              >
                多次scan只看最后一次
              </Checkbox>
            </Form.Item>
            <Form.Item label='Time:'>
              <DatePicker.RangePicker size='small' onChange={this.onDatePickerChange} />
            </Form.Item>
            <Form.Item label='Query:'>
              <Checkbox.Group options={generateData()} defaultValue={items} onChange={this.onQueryChange} />
            </Form.Item>
            {items.length > 0 ? (
              <Form.Item label='Inspector:'>
                <DragDropContext onDragEnd={this.onDragEnd}>
                  <Droppable droppableId='droppable' direction='horizontal'>
                    {p1 => (
                      <DragContainer ref={p1.innerRef} {...p1.droppableProps}>
                        {items.map((item, index) => (
                          <Draggable key={item} draggableId={item} index={index}>
                            {p2 => (
                              <DragItem ref={p2.innerRef} {...p2.draggableProps} {...p2.dragHandleProps}>
                                <DragCard>
                                  <h4>{GET_LABEL(item)} 【{itemSelected[index] ? itemSelected[index].length : 0 || 0}/{itemData[index] ? itemData[index].length : 0}】</h4>
                                  <Input.Search
                                    onChange={e => this.onSearchInput(index, e.target.value)}
                                    onSearch={() => this.onSearchMark(index)}
                                    size='small'
                                    enterButton
                                  />
                                  <DragList
                                    dataSource={itemData[index]}
                                    renderItem={text => (
                                      <p
                                        className={itemSelected[index].includes(text) ? 'active' : ''}
                                        onClick={() => this.onSelect(index, text)}
                                      >
                                        {text}
                                      </p>
                                    )}
                                  />
                                </DragCard>
                              </DragItem>
                            )}
                          </Draggable>
                        ))}
                        {p1.placeholder}
                      </DragContainer>
                    )}
                  </Droppable>
                </DragDropContext>
              </Form.Item>
            ) : null}
            <Form.Item label=' '>
              <Button onClick={this.loadItems} type='primary'>Load</Button>
              <Button onClick={this.resetItems} type='dashed'>Reset</Button>
            </Form.Item>
          </Form>
        </LoaderDefect>
      </StyleDataQuery>
    )
  }
}

injectReducer('DataQuery', reducer)
const mapStateToProps = state => ({ ...state.DataQuery })
const mapDispatchToProps = { changeParams, changeItems, changeItemSelected, changeFilterOption }
export default connect(mapStateToProps, mapDispatchToProps)(DataQuery)
