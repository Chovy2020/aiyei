/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { Form, DatePicker, Checkbox, Button, Input } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
// import moment from 'moment'
import { StyleDataQuery, Title, LoaderGroup, LoaderDefect, DragContainer, DragItem, DragCard, DragList } from './style'

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
      defect: {
        existsImg: false, // 有照片
        mbHave: true, // Manual Classified
        secondScan: false, // 有前层scan结果
        seeLastScan: false, // 多次scan只看最后一次
        time: ['', ''] // 开始日期 结束日期 yyyy-MM-dd
      },
      items: DATA_QUERY_INIT.map(i => DATA_QUERY_QUERY[i])
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
    this.setState({ items: value })
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) return
    const { items } = this.state
    this.setState({ items: reorder(items, result.source.index, result.destination.index) })
  }

  render() {
    const { dataLoaderList, dataLoader, items } = this.state
    const data = [
      'Racing car sprays burning fuel into crowd.',
      'Japanese princess to wed commoner.',
      'Australian walks 100km after outback crash.',
      'Man charged over missing wedding girl.',
      'Los Angeles battles huge wildfires.'
    ]

    return (
      <StyleDataQuery>
        <Title className='bold'>Data Loader</Title>
        <LoaderGroup>
          <Checkbox.Group options={dataLoaderList} defaultValue={dataLoader} onChange={this.onLoaderChange} />
        </LoaderGroup>
        <LoaderDefect>
          <Title>Defect</Title>
          <Form layout='vertical' labelCol={{ span: 2 }}>
            <Form.Item label='Filter:'>
              <Checkbox onChange={e => this.onCheckboxChange('existsImg', e)}>有照片</Checkbox>
              <Checkbox onChange={e => this.onCheckboxChange('mbHave', e)}>Manual Classified</Checkbox>
              <Checkbox onChange={e => this.onCheckboxChange('secondScan', e)}>有前层scan结果</Checkbox>
              <Checkbox onChange={e => this.onCheckboxChange('seeLastScan', e)}>多次scan只看最后一次</Checkbox>
            </Form.Item>
            <Form.Item label='Time:'>
              <DatePicker.RangePicker onChange={this.onDatePickerChange} />
            </Form.Item>
            <Form.Item label='Query:'>
              <Checkbox.Group
                options={generateData()}
                defaultValue={DATA_QUERY_INIT.map(i => DATA_QUERY_QUERY[i])}
                onChange={this.onQueryChange}
              />
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
                                  <h4>{item}</h4>
                                  <Input.Search onSearch={value => console.log(value)} size='small' />
                                  <DragList
                                    dataSource={data}
                                    renderItem={text => (
                                      <p>{text}</p>
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
              <Button type='dashed'>Reset</Button>
              <Button type='primary'>Load</Button>
            </Form.Item>
          </Form>
        </LoaderDefect>
      </StyleDataQuery>
    )
  }
}

export default DataQuery
