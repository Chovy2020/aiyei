import styled from 'styled-components'
// import { Card, List } from 'antd'

export const StyleSingleMap = styled.div`
  .mapPareto {
    display: flex;
  }
`

export const StyleWafer = styled.div`
  display: flex;
  flex-direction: column;
  width: 428px;
  .formDropDown {
    height: 50px;
    button + button {
      margin-left: 10px;
    }
  }
  .heatmap-canvas {
    z-index: -999;
  }
  .mapContent {
    display: flex;
    .single-map-content {
      position: relative;
      width: 400px;
      height: 400px;
      border: 1px solid #ccc;
      .single-map-main {
        width: 400px;
        height: 400px;
      }
      .single-map-img {
        display: none;
        position: absolute;
        z-index: 999;
        width: 540px;
        height: auto;
        max-height: 400px;
        border: 1px solid #ccc;
        background: #fff;
        border-radius: 0 10px 10px 10px;
        box-shadow: 0px 0px 20px #aaa;
        .single-map-close {
          position: absolute;
          right: 10px;
          top: 10px;
          cursor: pointer;
        }
      }
      .single-mapimg:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        border-top: 15px solid #aaa;
        border-bottom: 15px solid transparent;
        border-right: 15px solid transparent;
      }
    }
    .operBtn {
      margin: 0 5px;
      display: flex;
      flex-direction: column;
      i {
        cursor: pointer;
        margin-bottom: 5px;
        height: 20px;
      }
      i.checked,
      i:hover {
        color: #409eff;
      }
    }
  }
  .heatRuler {
    text-align: center;
    margin: 0 5px;
  }
  .heatMapRuler {
    height: 90%;
    width: 10px;
    margin: 0 auto;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: linear-gradient(#f65656, #54ca44, #c6c6fe);
  }
`


export const StylePareto = styled.div`
  flex: 1;
`