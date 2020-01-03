import styled from 'styled-components'
import { Card, List } from 'antd'

export const StyleDataQuery = styled.div``

export const Title = styled.h3`
  line-height: 2;
  font-size: 16px;
  font-weight: 300;
  border-bottom: 1px solid #e4e7ed;
  margin: 0 0 10px;
  &.bold {
    font-weight: bold;
  }
`

export const LoaderGroup = styled.div``
export const LoaderDefect = styled.div`
  h3 {
    margin-top: 20px;
  }
  button + button {
    margin-left: 10px;
  }
`

export const DragContainer = styled.div`
  width: calc((100vw - 80px - 40px - 20px * 2) * 22 / 24 - 1px);
  height: 250px;
  background-color: #f3f3f3;
  overflow-x: auto;
  display: flex;
  margin: 0;
  padding: 5px;
  white-space: nowrap;
  border: 1px solid #efefef;
  [data-rbd-drag-handle-context-id="0"] {
    cursor: default;
  }
`
export const DragItem = styled.div`
  margin: 5px;
  user-select: none;
  padding: 0;
  &:last-child {
    margin-right: 10px;
  }
`
export const DragCard = styled(Card)`
  width: 200px;
  height: 226px;
  .ant-card-body {
    padding: 5px;
  }
  h4 {
    margin-bottom: 0;
  }
`
export const DragList = styled(List)`
  overflow: hidden;
  padding: 2px 0;
  p {
    margin: 0;
    font-size: 12px;
    &.active {
      font-weight: bold;
      background-color: #409eff50;
    }
  }
  p + p {
    margin-top: 1px;
  }
`
