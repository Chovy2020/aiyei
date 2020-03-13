import styled from 'styled-components'
import logo from '@/assets/images/logo.png'

export const LoginDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to left, #2ccac1, #1c92ed); 
  .ant-form-item {
    margin-bottom: 25px;
  }
`
export const Logo = styled.div`
  background: url(${logo}) 0 center no-repeat;
  background-size: 75px auto;
  padding-left: 80px;
  font-weight: bold;
  position: fixed;
  top: 14px;
  left: 20px;
  color: #fff;
`