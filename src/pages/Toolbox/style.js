import styled from 'styled-components'
import { Tabs } from 'antd'

export const StyleToolbox = styled.div`
  display: flex;
  min-height: 100%;
`

export const Tools = styled.div`
  width: 40px;
  border-right: 1px solid #E4E7ED;
  i {
    display: flex;
    font-size: 16px;
    height: 40px;
    justify-content: center;
    align-items: center;
    outline: none;
    &:hover {
      cursor: pointer;
      background-color: #E4E7ED;
    }
  }
`

export const Content = styled.div`
  flex: 1;
  .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab:first-child {
    border-left: none;
    border-top-left-radius: 0;
  }
  .ant-tabs-nav .ant-tabs-tab-active {
    font-weight: inherit;
  }
  .ant-tabs-bar {
    margin: 0;
  }
`

export const StyleTabPane = styled(Tabs.TabPane)`
  height: calc(100vh - 90px);
  overflow-y: auto;
  padding: 20px;
`