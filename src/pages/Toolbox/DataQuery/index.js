/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { Form, DatePicker, Checkbox, Button, Card, Input } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
// import moment from 'moment'
import { StyleDataQuery, Title, LoaderGroup, LoaderDefect, DragContainer, DragItem } from './style'

const { Item } = Form
const { RangePicker } = DatePicker

const DATA_QUERY_QUERY = {
  'Product ID': 'product_id',
  'Step ID': 'step_id',
  'Lot ID': 'lot_id',
  'Wafer ID': 'wafer_no',
  'Scan Time/Date': 'scan_tm',
  'Inspect Equip ID': 'eqp_id',
  'Recipe ID': 'recipe_id',
  'Test ID': 'test_no_group',
  'Slot ID': 'slot_num'
}
const DATA_QUERY_INIT = ['Product ID', 'Step ID', 'Lot ID', 'Wafer ID']
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

// fake data generator
const getItems = count => Array.from({ length: count }, (v, k) => k).map(k => ({
  id: `item-${k}`,
  content: `item ${k}`
}))

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const grid = 8

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle
})

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid,
  overflow: 'auto'
})

class DataQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataLoaderList: ['Defect', 'Metrology', 'MES', 'EAP', 'WAT', 'CP', 'iEMS', 'SPC'], // Data Loader 列表,
      dataLoader: ['Defect'], // Data Loader 已选列表
      defect: {
        existsImg: false, // 有照片
        mbHave: true, // Manual Classified
        secondScan: false, // 有前层scan结果
        seeLastScan: false, // 多次scan只看最后一次
        time: ['', ''] // 开始日期 结束日期 yyyy-MM-dd
      },
      items: getItems(10)
    }
    this.onDragEnd = this.onDragEnd.bind(this)
  }

  onLoaderChange = dataLoader => {
    console.log('checked = ', dataLoader)
    this.setState({ dataLoader })
  }

  onCheckboxChange(key, e) {
    const { defect } = this.state
    defect[key] = e.target.checked
    this.setState({ defect })
  }

  onDatePickerChange = (dates, dateStrings) => {
    const { defect } = this.state
    defect.time = dateStrings
    this.setState({ defect })
  }

  onQueryChange = value => {
    console.log('onQueryChange', value)
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) return
    const { items } = this.state
    this.setState({ items: reorder(items, result.source.index, result.destination.index) })
  }

  render() {
    const { dataLoaderList, dataLoader, items } = this.state

    return (
      <StyleDataQuery>
        <Title className='bold'>Data Loader</Title>
        <LoaderGroup>
          <Checkbox.Group options={dataLoaderList} defaultValue={dataLoader} onChange={this.onLoaderChange} />
        </LoaderGroup>
        <LoaderDefect>
          <Title>Defect</Title>
          <Form layout='vertical' labelCol={{ span: 2 }}>
            <Item label='Filter:'>
              <Checkbox onChange={e => this.onCheckboxChange('existsImg', e)}>有照片</Checkbox>
              <Checkbox onChange={e => this.onCheckboxChange('mbHave', e)}>Manual Classified</Checkbox>
              <Checkbox onChange={e => this.onCheckboxChange('secondScan', e)}>有前层scan结果</Checkbox>
              <Checkbox onChange={e => this.onCheckboxChange('seeLastScan', e)}>多次scan只看最后一次</Checkbox>
            </Item>
            <Item label='Time:'>
              <RangePicker onChange={this.onDatePickerChange} />
            </Item>
            <Item label='Query:'>
              <Checkbox.Group options={generateData()} defaultValue={DATA_QUERY_INIT} onChange={this.onQueryChange} />
            </Item>
            <Item label='Inspector:'>
              <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId='droppable' direction='horizontal'>
                  {(p1, s1) => (
                    <DragContainer ref={p1.innerRef} style={getListStyle(s1.isDraggingOver)} {...p1.droppableProps}>
                      {items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(p2, s2) => (
                            <DragItem
                              ref={p2.innerRef}
                              {...p2.draggableProps}
                              {...p2.dragHandleProps}
                              style={getItemStyle(s2.isDragging, p2.draggableProps.style)}
                            >
                              <Card>
                                <p>{item.content}</p>
                                <Input.Search onSearch={value => console.log(value)} />
                              </Card>
                            </DragItem>
                          )}
                        </Draggable>
                      ))}
                      {p1.placeholder}
                    </DragContainer>
                  )}
                </Droppable>
              </DragDropContext>
            </Item>
            <Item label=' '>
              <Button type='dashed'>Reset</Button>
              <Button type='primary'>Load</Button>
            </Item>
          </Form>
        </LoaderDefect>
      </StyleDataQuery>
    )
  }
}

export default DataQuery
