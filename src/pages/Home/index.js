import React from 'react'

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      msg: 'hello world',
      num: 1
    }
  }

  onButtonClick = () => {
    let { num } = this.state
    num += 1
    this.setState({ num })
  }

  render() {
    const { msg, num } = this.state

    return (
      <div className='App'>
        Home
        <p>
          {msg}-{num}
        </p>
        <button type='button' onClick={this.onButtonClick}>Click</button>
      </div>
    )
  }
}
export default Home
