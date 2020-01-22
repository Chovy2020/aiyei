import React from 'react'
import { StyleCluster } from './style'
import _ from 'lodash'
import { Table ,Input,InputNumber,Button,Icon,Popconfirm} from 'antd'
import { getAdder,updateAdder } from './service'
const { Column } = Table;
const ButtonGroup = Button.Group;

class Adder extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: []
    }
  }
  componentDidMount() {
    this.init()
  }

  init = () => {
    getAdder({}).then(response => {
      let resData = _.cloneDeep(response).map((item,idx) => {
        return {key: idx, ...item}
      })
      this.setState({tableData: resData})
    })
  }

  changeCell = (value, id, cellName) => {
    let newTableData = _.cloneDeep(this.state.tableData)
    newTableData[id][cellName] = value
    this.setState({tableData: newTableData})
  }

  addTableCell = () => {
    let newCell = {
      key: this.state.tableData.length,
      productId: '',
      stepId: '',
      tolerance: 0
    }
    this.setState({tableData: [...this.state.tableData, newCell]})
  }
  handleDelete = (key) => {
    let newData = _.cloneDeep(this.state.tableData)
    newData.splice(key,1)
    let resData = _.cloneDeep(newData).map((item,idx) => {
      item.key = idx
      return item
    })
    this.setState({tableData: resData})
  }
  saveTable = () => {
    let cfgAdders = this.state.tableData.map(item => {
      return {
        "productId": item.productId,
        "stepId": item.stepId,
        "technology": "T1",
        "tolerance": item.tolerance,
        "createBy": "xrj",
        "remarks": null,
        "updateTm": null
      }
    })
    updateAdder({cfgAdders}).then(response => {
      this.init()
    })
  }

  render() {
    return (
      <StyleCluster>
        <Table dataSource={this.state.tableData} bordered>
          <Column title="Product" dataIndex="productId" key="productId" render={(text, record) => (
            <Input value={text} onChange={(e) => this.changeCell(e.target.value,record.key,'productId')}/>
          )}/>
          <Column title="Step" dataIndex="stepId" key="stepId" render={(text, record) => (
            <Input value={text} onChange={(e) => this.changeCell(e.target.value,record.key,'stepId')}/>
          )}/>
          <Column title="Tolerance" dataIndex="tolerance" key="tolerance"  align="center" render={(text, record) => (
            <InputNumber value={text} onChange={(value) => this.changeCell(value,record.key,'tolerance')}/>
          )}/>
          <Column
            title="Action"
            key="action"
            render={(text, record) => (
              <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
                <Icon type="delete"/>
              </Popconfirm>
            )}
          />
        </Table>
        <ButtonGroup>
          <Button type="default" onClick={this.addTableCell}><Icon type="plus" /></Button>
          <Button type="default" onClick={this.saveTable}>Save</Button>
        </ButtonGroup>
      </StyleCluster>
    )
  }
}

export default Adder
