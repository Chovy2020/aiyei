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
  height: calc(100vh - 50px);
  display: flex;
`
export const Menu = styled.div`
  background-color: #3b4053;
  width: 80px;
  text-align: center;
  height: 100%;
  ul {
    list-style: none;
    width: 100%;
    li {
      padding: 10px;
      cursor: pointer;
      a {
        display: flex;
        flex-direction: column;
        color: #fff;
        align-items: center;
        i {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          height: 40px;
          justify-content: center;
          align-items: center;
          font-size: 18px;
          background-color: rgba(255, 255, 255, 0.1);
        }
        span {
          font-size: 12px;
          font-weight: 300;
        }
      }
      &.active {
        background: rgba(255, 255, 255, 0.1);
        a i {
          background: linear-gradient(180deg, #1c92ed, #2ccac1);
        }
      }
    }
  }
`

export const Main = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
`
