import styled from 'styled-components'
import { Card } from 'antd'

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
  margin: 10px 0 0 0;
  padding: 5px;
  white-space: nowrap;
  border: 1px solid #efefef;
`
export const DragItem = styled.div`
  border: 1px solid #f00;
  padding: 0;
`
export const DragCard = styled(Card)`
  width: 200px;
  height: 230px;
`
