import React from 'react'
import _ from 'lodash'
import { Table, Input, InputNumber, Button, Icon, Popconfirm } from 'antd'
import { StyleCluster } from './style'
import { getCluster, updateCluster } from './service'

const { Column } = Table
const ButtonGroup = Button.Group

class Cluster extends React.Component {
  constructor(props) {
    super(props)
    this.state = { tableData: [] }
  }

  componentDidMount() {
    this.init()
  }

  init = () => {
    getCluster({}).then(response => {
      const resData = _.cloneDeep(response).map((item, idx) => ({ key: idx, disabled: true, ...item }))
      this.setState({ tableData: resData })
    })
  }

  changeCell = (value, id, cellName) => {
    const newTableData = _.cloneDeep(this.state.tableData)
    newTableData[id][cellName] = value
    this.setState({ tableData: newTableData })
  }

  addTableCell = () => {
    const newCell = { key: this.state.tableData.length,
      productId: '',
      stepId: '',
      distance: 0,
      minimalCnt: 0 }
    this.setState({ tableData: [...this.state.tableData, newCell] })
  }

  handleDelete = key => {
    const newData = _.cloneDeep(this.state.tableData)
    newData.splice(key, 1)
    const resData = _.cloneDeep(newData).map((item, idx) => {
      item.key = idx
      return item
    })
    this.setState({ tableData: resData })
  }

  saveTable = () => {
    const cfgClusterDefinitions = this.state.tableData.map(item => ({ productId: item.productId,
      stepId: item.stepId,
      technology: 'T1',
      distance: item.distance,
      minimalCnt: item.minimalCnt,
      createBy: 'xrj',
      remarks: null,
      updateTm: null }))
    updateCluster({ cfgClusterDefinitions }).then(response => {
      this.init()
    })
  }

  render() {
    return (
      <StyleCluster>
        <Table dataSource={this.state.tableData} bordered size='small' pagination={{ pageSize: 5 }}>
          <Column
            title='Product'
            dataIndex='productId'
            key='productId'
            render={(text, record) => (
              <Input value={text} onChange={e => this.changeCell(e.target.value, record.key, 'productId')} disabled={record.disabled} />
            )}
          />
          <Column
            title='Step'
            dataIndex='stepId'
            key='stepId'
            render={(text, record) => (
              <Input value={text} onChange={e => this.changeCell(e.target.value, record.key, 'stepId')} disabled={record.disabled} />
            )}
          />
          <Column
            title='Distance'
            dataIndex='distance'
            key='distance'
            align='center'
            render={(text, record) => (
              <InputNumber value={text} onChange={value => this.changeCell(value, record.key, 'distance')} />
            )}
          />
          <Column
            title='Minimal Count'
            dataIndex='minimalCnt'
            key='minimalCnt'
            align='center'
            render={(text, record) => (
              <InputNumber value={text} onChange={value => this.changeCell(value, record.key, 'minimalCnt')} />
            )}
          />
          <Column
            title='Action'
            key='action'
            render={(text, record) => (
              <Popconfirm title='Sure to delete?' onConfirm={() => this.handleDelete(record.key)}>
                <Icon type='delete' />
              </Popconfirm>
            )}
          />
        </Table>
        <ButtonGroup>
          <Button type='default' onClick={this.addTableCell}><Icon type='plus' /></Button>
          <Button type='default' onClick={this.saveTable}>Save</Button>
        </ButtonGroup>
      </StyleCluster>
    )
  }
}

export default Cluster
