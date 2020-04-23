import React from 'react'
import _ from 'lodash'
import { Table } from 'antd'

class HistoryList extends React.Component {
  constructor(props) {
    super(props)
    this.dataSource = []
    this.state = { 
      
    }
  }

  componentDidMount() {
    this.getHold()
  }

  getHold = () => {
    this.dataSource = []
    const arr = this.props.historyArr
    arr.forEach((item, index) => {
      this.dataSource.push({
        key: index,
        ...item
      })
    })
  }


  render() {
    this.getHold()
    const { dataSource } = this
    const columns = [
      {
        title: 'Step Name',
        dataIndex: 'stepName',
        key: 'stepName',
        align: 'center'
      },
      {
        title: 'Step No',
        dataIndex: 'stepNo',
        key: 'stepNo',
        align: 'center'
      },
      {
        title: 'EQP ID',
        dataIndex: 'eqpId',
        key: 'eqpId',
        align: 'center'
      },
      {
        title: 'Chamber',
        dataIndex: 'chamber',
        key: 'chamber',
        align: 'center'
      },
      {
        title: 'Activity',
        dataIndex: 'activity',
        key: 'activity',
        align: 'center'
      },
      {
        title: 'Txn Time',
        dataIndex: 'processTm',
        key: 'processTm',
        align: 'center'
      },
      {
        title: 'Hold Comment',
        dataIndex: 'holdComment',
        key: 'holdComment',
        align: 'center'
      }
    ];
    return (
      <Table dataSource={dataSource} columns={columns} bordered
        rowKey={r => `${r.key}`}
      />
    )
  }
}

export default HistoryList
