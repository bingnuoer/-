// axios 公共配置
// 基地址
axios.defaults.baseURL = 'http://geek.itheima.net'

// 添加请求拦截器-axios官网copy
axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    // 设置请求拦截器，统一携带 token
    const token = localStorage.getItem('token')
    // 请求头参数
    token && (config.headers.Authorization = `Bearer ${token}`)
    
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });
