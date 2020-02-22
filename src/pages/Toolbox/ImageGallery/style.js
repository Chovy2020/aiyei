import styled from 'styled-components'
// import { Card, List } from 'antd'

export const StyleImageGallery = styled.div`
  .ant-select {
    margin-right: 10px;
  }
  button + button {
    margin-left: 10px;
  }
`

export const StyleImages = styled.ul`
  width: 100%;
  padding: 0 99px;
  flex-wrap: wrap;
  box-sizing: border-box;
  display: flex;
  list-style: none;
  li {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 5px;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      border: 2px solid transparent;
      padding: 2px;
    }
    &.selected img {
      border-color: red;
    }
    .wafer-info {
      position: absolute;
      left: 12px;
      bottom: 10px;
      color: #0f0;
      font-size: 12px;
      p {
        margin: 0;
        line-height: 1.5;
      }
      &.font-size-12 p{
        font-size: 12px;
      }
      &.font-size-14 p{
        font-size: 14px;
      }
      &.font-size-16 p{
        font-size: 16px;
      }
      &.font-size-18 p{
        font-size: 18px;
      }
    }
  }
  &.col3 li {
    width: 33.33%;
    height: calc((100vw - 80px - 40px - 20px * 2 - 220px) / 3);
  }
  &.col4 li {
    width: 25%;
    height: calc((100vw - 80px - 40px - 20px * 2 - 220px) / 4);
  }
  &.col5 li {
    width: 20%;
    height: calc((100vw - 80px - 40px - 20px * 2 - 220px) / 5);
  }
`
