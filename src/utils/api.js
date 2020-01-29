import axios from 'axios'
import { message } from 'antd'
import store from './store'

const ERROR_CODE = {
  400: '请求错误(400)',
  401: '未授权，请重新登录(401)',
  403: '拒绝访问(403)',
  404: '请求出错(404)',
  408: '请求超时(408)',
  500: '服务器错误(500)',
  501: '服务未实现(501)',
  502: '网络错误(502)',
  503: '服务不可用(503)',
  504: '网络超时(504)',
  505: 'HTTP版本不受支持(505)'
}

// 全局axios配置
axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true
axios.defaults.timeout = 30 * 60 * 1000


const LOADING_DELAY = 200
let timer = null

// http request 拦截器
axios.interceptors.request.use(
  config => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      store.dispatch({type: 'CHANGE_TOOLBOX_LOADING', payload: true})
    }, LOADING_DELAY)
    // 需要权限的接口的token验证
    // const { token } = localStorage
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    message.error('请求超时')
    return Promise.reject(error)
  }
)

// http response 拦截器
axios.interceptors.response.use(
  res => {
    clearTimeout(timer)
    store.dispatch({type: 'CHANGE_TOOLBOX_LOADING', payload: false})
    if (res && res.data) {
      if (res.data.code === 200) return res.data.data
      // todo: 针对post下载文件需要做处理
      if (res.headers['content-type'] === 'application/octet-stream') {
        const blob = new Blob([res.data], { type: 'charset=utf-8' })
        const downloadElement = document.createElement('a')
        const href = window.URL.createObjectURL(blob) // 创建下载的链接
        downloadElement.href = href
        downloadElement.download = res.headers['content-disposition'].match(/filename=(\S*)/)[1] || 'NA' // 下载后文件名
        document.body.appendChild(downloadElement)
        downloadElement.click() // 点击下载
        document.body.removeChild(downloadElement) // 下载完成移除元素
        window.URL.revokeObjectURL(href) // 释放掉blob对象
        return Promise.resolve()
      }
      console.log(ERROR_CODE[res.data.code] || '未知错误!')
    } else console.log('服务器错误!')
    return Promise.reject()
  },
  err => {
    clearTimeout(timer)
    store.dispatch({type: 'CHANGE_TOOLBOX_LOADING', payload: false})
    console.log((err && err.response && ERROR_CODE[err.response.status]) || '连接服务器失败!')
    return Promise.reject(err)
  }
)

/**
 * axios get请求 统一catch error
 *
 * @export
 * @param {String} url
 * @returns {Promise}
 */
export function get(url) {
  return new Promise(resolve => {
    axios
      .get(url)
      .then(res => resolve(res))
      .catch(() => {})
  })
}

/**
 * axios post请求 统一catch error
 *
 * @export
 * @param {String} url
 * @param {Object} data
 * @returns {Promise}
 */
export function post(url, data) {
  return new Promise(resolve => {
    axios
      .post(url, data)
      .then(res => resolve(res))
      .catch(() => {})
  })
}

/**
 * axios post 下载文件
 *
 * @export
 * @param {String} url
 * @param {Object} data
 * @returns {Promise}
 */
export function download(url, data) {
  return new Promise(resolve => {
    axios({
      url,
      method: 'post',
      data,
      responseType: 'arraybuffer'
    })
      .then(res => resolve(res))
      .catch(() => {})
  })
}
