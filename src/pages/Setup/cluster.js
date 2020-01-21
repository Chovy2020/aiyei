import React from 'react'
import { StyleCluster } from './style'
import _ from 'lodash'
import { Table ,Input,InputNumber,Button,Icon} from 'antd'
import { getCluster } from './service'
const { Column } = Table;
const ButtonGroup = Button.Group;

class Cluster extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: []
    }
  }
  componentDidMount() {
    getCluster({}).then(response => {
      this.setState({tableData: response})
    })
  }

  changeCell = (value, id, cellName) => {
    let newTableData = _.cloneDeep(this.state.tableData)
    newTableData[id-1][cellName] = value
    this.setState({tableData: newTableData})
  }

  addTableCell = () => {
    let newCell = {
      productId: '',
      stepId: '',
      distance: '',
      minimalCnt: ''
    }
    this.setState({tableData: [...this.state.tableData,newCell]})
  }
  delete = (e) => {
    console.log(e,1)
  }
  saveTable = () => {

  }


  render() {
    return (
      <StyleCluster>
        <Table dataSource={this.state.tableData} bordered>
          <Column title="Product" dataIndex="productId" key="productId" render={(text, record) => (
            <Input value={text} onChange={(e) => this.changeCell(e.target.value,record.subDieId,'productId')}/>
          )}/>
          <Column title="Step" dataIndex="stepId" key="stepId" render={(text, record) => (
            <Input value={text} onChange={(e) => this.changeCell(e.target.value,record.subDieId,'stepId')}/>
          )}/>
          <Column title="Distance" dataIndex="distance" key="distance"  align="center" render={(text, record) => (
            <InputNumber value={text} onChange={(value) => this.changeCell(value,record.subDieId,'distance')}/>
          )}/>
          <Column title="Minimal Count" dataIndex="minimalCnt" key="minimalCnt"  align="center" render={(text, record) => (
            <InputNumber value={text} onChange={(value) => this.changeCell(value,record.subDieId,'minimalCnt')}/>
          )}/>
          <Column
            title="Action"
            key="action"
            render={(text, record) => (
              <Icon type="delete" onClick={this.delete(record)}/>
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

export default Cluster
