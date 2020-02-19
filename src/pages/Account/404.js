import React from 'react'
import Image404 from '@/assets/images/404.jpg'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const StyleContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #7eb8ec;
`

class Page404 extends React.Component {
  render() {
    return (
      <StyleContainer>
        <Link to={''}>
          <img src={Image404} alt='' />
        </Link>
      </StyleContainer>
    )
  }
}
export default Page404
