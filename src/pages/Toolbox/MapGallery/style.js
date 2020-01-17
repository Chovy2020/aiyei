import styled from 'styled-components'
// import { Card, List } from 'antd'

export const StyleMapGallery = styled.div`
  .ant-form-item button + button {
    margin-left: 10px;
  }
`

export const StyleWaferMapGroup = styled.div``

export const StyleWaferMap = styled.ul`
  width: 960px;
  margin: 10px 0;
  flex-wrap: wrap;
  display: flex;
  list-style: none;
  li {
    box-sizing: border-box;
    width: 104px;
    height: 143px;
    margin: 2px 7px;
    display: block;
    overflow: hidden;
    border: 1px solid transparent;
    .wafer {
      width: 100px;
      height: 100px;
      box-sizing: content-box;
      overflow: hidden;
      border: 1px solid transparent;
      &.radius {
        border-color: #ccc;
        border-radius: 50%;
      }
    }
    &.selected {
      border-color: red;
    }
    p {
      margin: 0;
      line-height: 1;
      font-size: 12px;
      width: 200%;
      margin-left: -25%;
      transform: scale(0.75);
      padding-left: 2px;
      & + p {
        margin-top: -3px;
      }
    }
  }
`
