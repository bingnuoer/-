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

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 优化axios响应结果，直接返回data数据对象
    const result = response.data
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return result;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么-统一对401身份验证失败作出处理
    console.dir(error);
    // 条件链式写法
    if (error?.response?.status === 401) {
        alert('身份验证失败，请重新登录')
        // 清空本地存储
        localStorage.clear()
        // 跳转到登录页
        location.href = '../login/index.html'
    }
    return Promise.reject(error);
});
