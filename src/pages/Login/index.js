import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import { changeUser } from '@/utils/action'
import {LoginDiv} from './style'
class NormalLoginForm extends React.Component {
  constructor(props) {
    super(props)
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: rerere', values);
        this.props.changeUser(values.username)
        localStorage.setItem("username",values.username)
        setTimeout(() => {
          console.log(localStorage.getItem("username"),'拿到了')
        },2000)
        axios.post('http://161.189.56.38/jems/auth/login', values).then(res => {
          if(res.code = 20000) {
            this.props.changeUser(values.username)
            localStorage.setItem("username",values.username)
          }else {
            message.warn(res.message)
          }
        })
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    let loginform = { 'width': '300px', 'height': '300px' }
    let loginformforgot = { 'float': 'right' }
    let loginformbutton = { 'width': '100%' }
    return (
      <LoginDiv>
        <Form onSubmit={this.handleSubmit} style={loginform}>
          <Form.Item>
            <h2 style={{color: '#fff'}}>Login</h2>
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Username"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(<Checkbox>Remember me</Checkbox>)}
            {/* <a style={loginformforgot} href="">
              Forgot password
            </a> */}
            <Button type="primary" htmlType="submit" style={loginformbutton}>
              Log in
            </Button>
            {/* Or <a href="">register now!</a> */}
          </Form.Item>
        </Form>
      </LoginDiv>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);
// export default WrappedNormalLoginForm


const mapStateToProps = state => ({ ...state.Init })
const mapDispatchToProps = { changeUser }
export default connect(mapStateToProps, mapDispatchToProps)(WrappedNormalLoginForm)

