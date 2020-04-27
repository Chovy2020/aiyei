import React from 'react'
import _ from 'lodash'
import { Table } from 'antd'
import { ReduceSpacing } from './style'

class HoldLotList extends React.Component {
  constructor(props) {
    super(props)
    this.dataSource = []
    this.state = { 
      rowId: 0
    }
  }

  componentDidMount() {
    this.getHold()
    this.setRowClassName(0)
  }

  getHold = () => {
    this.dataSource = []
    const arr = this.props.holdLotListArr
    arr.forEach((item, index) => {
      this.dataSource.push({
        key: index,
        ...item
      })
    })
  }

  onRowClick = (record) => {
    this.props.emitRow(record)
    this.setState({ rowId: record.key })
  }

  setRowClassName = (record) => {
    return record.key === this.state.rowId ? 'click-row-styl' : ''
  }

  render() {
    this.getHold()
    const { dataSource } = this
    const columns = [
      {
        title: 'Product ID',
        dataIndex: 'productId',
        key: 'productId',
        align: 'center'
      },
      {
        title: 'Lot ID',
        dataIndex: 'lotId',
        key: 'lotId',
        align: 'center'
      },
      {
        title: 'Stage',
        dataIndex: 'stageId',
        key: 'stageId',
        align: 'center'
      },
      {
        title: 'Step ID',
        dataIndex: 'stepId',
        key: 'stepId',
        align: 'center'
      },
      {
        title: 'Prority',
        dataIndex: 'priority',
        key: 'priority',
        align: 'center'
      },
      {
        title: 'Qty',
        dataIndex: 'qty',
        key: 'qty',
        align: 'center'
      },
      {
        title: 'Step Hold Time',
        dataIndex: 'stepHoldTime',
        key: 'stepHoldTime',
        align: 'center'
      },
      {
        title: 'Qtime',
        dataIndex: 'qtime',
        key: 'qtime',
        align: 'center'
      },
      {
        title: 'Hold Department',
        dataIndex: 'holdDepartment',
        key: 'holdDepartment',
        align: 'center'
      },
      {
        title: 'Hold Comment',
        dataIndex: 'holdComment',
        key: 'holdComment',
      },
    ];
    return (
      <ReduceSpacing>
        <Table dataSource={dataSource} columns={columns} bordered pagination={false}
          rowKey={r => `${r.key}`}
          rowClassName={this.setRowClassName} 
          onRow={record => {
            return {
              onClick: event => { this.onRowClick(record) }, 
            }
          }}
        />
      </ReduceSpacing>
    )
  }
}

export default HoldLotList
