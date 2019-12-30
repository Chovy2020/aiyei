import styled from 'styled-components'
import logo from '@/assets/images/logo.png'

export const Header = styled.header`
  background: linear-gradient(-45deg, #2ccac1, #1c92ed);
  height: 50px;
  color: #fff;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  line-height: 50px;
  padding: 0 20px;
`

export const Logo = styled.div`
  background: url(${logo}) 0 center no-repeat;
  background-size: 75px auto;
  padding-left: 80px;
  font-weight: bold;
`

export const Container = styled.div`
  height: calc(100% - 50px);
  display: flex;
`
