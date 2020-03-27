import React from 'react'
import _ from 'lodash'
import { Modal, Icon, Popconfirm, Table, InputNumber } from 'antd'
import { delay } from '@/utils/web'

class AddDoiModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      tableData: []
    }
  }

  componentDidMount() {
    this.setState({ tableData: this.props.addDoiData })
  }

  handleOk = e => {
    const {changeAddModal} = this.props
    console.log(this.state.tableData,'tableData')
    changeAddModal(this.state.tableData)
  };

  handleCancel = e => {
    const {changeAddModal} = this.props
    changeAddModal()
  };

  changeCell = (value, id, cellName) => {
    const newTableData = _.cloneDeep(this.state.tableData)
    newTableData[id][cellName] = value
    this.setState({ tableData: newTableData })
  }

  render() {
    const { tableData } = this.state
    const columns = [
      {
        title: 'Product',
        dataIndex: 'product',
        align: 'center',
      },
      {
        title: 'Step',
        dataIndex: 'layer',
        align: 'center',
      },
      {
        title: 'MB',
        dataIndex: 'doi',
        align: 'center',
      },
      {
        title: 'Add True Defect Count',
        dataIndex: 'cntSpec',
        align: 'center',
        render:(text, record) => (
          <InputNumber defaultValue={text} onChange={value => this.changeCell(value, record.key, 'cntSpec')} />
        )
      },
      {
        title: 'Norm. Add True Defect Count',
        dataIndex: 'normCntSpec',
        align: 'center',
        render:(text, record) => (
          <InputNumber defaultValue={text} onChange={value => this.changeCell(value, record.key, 'normCntSpec')} />
        )
      },
      {
        title: 'Add True Defect Density',
        dataIndex: 'densitySpec',
        align: 'center',
        render:(text, record) => (
          <InputNumber defaultValue={text} onChange={value => this.changeCell(value, record.key, 'densitySpec')} />
        )
      },
      {
        title: 'Norm. Add True Defect Density',
        dataIndex: 'normDensitySpce',
        align: 'center',
        render:(text, record) => (
          <InputNumber defaultValue={text} onChange={value => this.changeCell(value, record.key, 'normDensitySpce')} />
        )
      },
      {
        title: 'DD%',
        dataIndex: 'dDSpec',
        width: 80,
        align: 'center',
        render:(text, record) => (
          <InputNumber style={{width: '100%'}} defaultValue={text} onChange={value => this.changeCell(value, record.key, 'dDSpec')} />
        )
      },
      {
        title: 'Norm. DD%',
        dataIndex: 'normDDSpec',
        align: 'center',
        render:(text, record) => (
          <InputNumber defaultValue={text} onChange={value => this.changeCell(value, record.key, 'normDDSpec')} />
        )
      },
      {
        title: 'KR',
        dataIndex: 'kr',
        width: 80,
        align: 'center',
        render:(text, record) => (
          <InputNumber style={{width: '100%'}} defaultValue={text} onChange={value => this.changeCell(value, record.key, 'kr')} />
        )
      }
    ]
    return (
      <Modal
        title={this.props.title}
        width={1000}
        visible={this.props.showAddDoiModal}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Table rowKey={record => record.product+record.layer+record.doi} dataSource={tableData} columns={columns} bordered size='small' pagination={false}></Table>
      </Modal>
    )
  }
}

export default AddDoiModal
