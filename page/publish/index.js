/**
 * 目标1：设置频道下拉菜单
 *  1.1 获取频道列表数据
 *  1.2 展示到下拉菜单中
 */

// 封装函数，复用
async function getChannleList() {
    // 1.1 发送请求，获取频道列表数据
    const res = await axios({
        url: '/v1_0/channels'
    })

    // console.log("频道列表数据");
    // console.log(res);

    // 数组元素项转换标签
    const htmlStr = `<option value="" selected="">请选择文章频道</option>` + res.data.channels.map(item => {
        return `<option value="${item.id}">${item.name}</option>`
    }).join('')
    // console.log(htmlStr);
    // 渲染到页面标签
    document.querySelector('.form-select').innerHTML = htmlStr
}
// 打开页面，默认调用一次
getChannleList()

/**
 * 目标2：文章封面设置
 *  2.1 准备标签结构和样式
 *  2.2 选择文件并保存在 FormData
 *  2.3 单独上传图片并得到图片 URL 网址
 *  2.4 回显并切换 img 标签展示（隐藏 + 号上传标签）
 */
// 2.2 选择文件并保存在 FormData
// 监听图片选择区域的change事件
document.querySelector('.img-file').addEventListener('change', async e => {
    // 将用户选择的图片文件转换为 FormData 格式，并将其作为请求体发送到服务器
    const file = e.target.files[0]
    // 图片转换成FormData格式，在发送请求
    const fd = new FormData()
    // 将选择的文件添加到 FormData 实例中，并指定表单数据的键名为 'img'。也就是说，在后续的请求中，服务器端可以通过这个键名来获取上传的文件。
    fd.append('image', file)

    // 2.3 单独上传图片并得到图片 URL 网址
    const res = await axios({
        url: '/v1_0/upload',
        method: 'POST',
        data: fd
    })
    console.log(res);
    // 获取上传的图片url
    const imgUrl = res.data.url
    // 渲染到页面img标签中
    document.querySelector('.rounded').src = imgUrl
    // 显示img标签
    document.querySelector('.rounded').classList.add('show')
    // 隐藏上传图片的“+”标签
    document.querySelector('.place').classList.add('hide')
})

// 优化：点击 img 可以重新切换封面
// 思路：img点击 => 用JS方式触发文件选择元素click事件方法
document.querySelector('.rounded ').addEventListener('click', () => {
    document.querySelector('.img-file').click()
    // 循环->监听图片选择区域的change事件-重新覆盖一张封面
})

/**
 * 目标3：发布文章保存
 *  3.1 基于 form-serialize 插件收集表单数据对象
 *  3.2 基于 axios 提交到服务器保存
 *  3.3 调用 Alert 警告框反馈结果给用户
 *  3.4 重置表单并跳转到列表页
 */
// 3.1 基于 form-serialize 插件收集表单数据对象
// 点击“保存”按钮，获取表单数据
document.querySelector('.send').addEventListener('click', async e => {
    // 如果是修改文章，就不走下面发布文章的逻辑
    if (e.target.innerHTML !== '发布') return
    // 以下是发布的逻辑
    const form = document.querySelector('.art-form')
    const data = serialize(form, { hash: true, empty: true })
    // console.log(data);
    // 发布文章 参数不需要id,移除id
    delete data.id
    // console.log(data);

    // 给data对象添加cover属性
    data.cover = {
        type: 1, //封面类型
        images: [document.querySelector('.rounded ').src] //封面图片URL
    }
    // console.log(data);

    // 捕获错误
    try {
        // 发布文章-发送请求
        const res = await axios({
            url: '/v1_0/mp/articles',
            method: 'POST',
            // 携带请求头的参数，已经封装好了
            data
        })
        console.log(res);
        // 3.3 调用 Alert 警告框反馈结果给用户
        myAlert(true, "发布成功！")

        // 3.4 重置表单并跳转到列表页
        // 已经获取到表单form
        form.reset() //只能重置表单数据
        // 手动重置图片与富文本编辑
        // 渲染到页面img标签中
        document.querySelector('.rounded').src = ''
        // 显示img标签
        document.querySelector('.rounded').classList.remove('show')
        // 隐藏上传图片的“+”标签
        document.querySelector('.place').classList.remove('hide')

        // 重置富文本编辑-调用方法
        editor.setHtml()


        // 跳转到列表页
        setTimeout(() => {
            location.href = '../content/index.html'
        }, 1500);

    } catch (error) {
        // 调用 Alert 警告框反馈结果给用户
        myAlert(false, error.response.data.message)
    }
})

    /**
     * 目标4：编辑-回显文章
     *  4.1 页面跳转传参（URL 查询参数方式）
     *  4.2 发布文章页面接收参数判断（共用同一套表单）
     *  4.3 修改标题和按钮文字
     *  4.4 获取文章详情数据并回显表单
     */
    ; (function () {
        // 4.2 发布文章页面接收参数(location.search)判断（共用同一套表单）
        // console.log(location.search); //?id=cffa853a-0426-4d46-ba43-a7c89a57dc2f
        const paramsStr = location.search
        // 参数 键和值 分离获取
        const params = new URLSearchParams(paramsStr)
        params.forEach(async (value, key) => {
            console.log(value, key);
            // 跳转页面后，有id参数-编辑文章业务
            //            无id参数-发布文章业务
            // 当前有要编辑的文章id传过来，编辑业务
            if (key === 'id') {
                // 4.3 修改标题和按钮文字
                document.querySelector('.title span').innerHTML = '修改文章'
                document.querySelector('.send').innerHTML = '修改'

                // 4.4 获取文章详情数据并回显表单
                const res = await axios({
                    url: `/v1_0/mp/articles/${value}`,
                })
                console.log(res);
                const dataObj = {
                    channel_id: res.data.channel_id,
                    title: res.data.title,
                    rounded: res.data.cover.images[0],
                    content: res.data.content,
                    id: res.data.id
                }
                // 遍历数据对象(为一个数组)属性，映射到页面元素上，快速赋值
                // 取出对象里的元素形成一个数组（Object.keys(dataObj)），遍历数组元素
                Object.keys(dataObj).forEach(key => {
                    // 回显图片
                    if (key === 'rounded') {
                        // 封面设置-请求的数据对象中有封面
                        if (dataObj[key]) {
                            // 回显封面
                            document.querySelector('.rounded').src = dataObj[key]
                            document.querySelector('.rounded').classList.add('show')
                            document.querySelector('.place').classList.add('hide')
                        }
                    } else if (key === 'content') {
                        // 富文本编辑器回显
                        editor.setHtml = dataObj[key]
                    } else {
                        // 用name属性，快速获取表单元素并赋值
                        document.querySelector(`[name=${key}]`).value = dataObj[key]
                    }
                })
            }
        })
    })();


/**
 * 目标5：编辑-保存文章
 *  5.1 判断按钮文字，区分业务（因为共用一套表单）
 *  5.2 调用编辑文章接口，保存信息到服务器
 *  5.3 基于 Alert 反馈结果消息给用户
 */
// 点击修改按钮，修改文章
document.querySelector('.send').addEventListener('click', async e => {
    // 5.1 判断按钮文字，区分业务（因为共用一套表单）
    if (e.target.innerHTML !== '修改') return
    // 修改文章的逻辑
    // 获取表单数据
    const form = document.querySelector('.art-form')
    const data = serialize(form, { hash: true, empty: true })
    console.log(data);

    // 5.2 调用编辑文章接口，保存信息到服务器
    try{
        const res = await axios({
            url: `/v1_0/mp/articles/${data.id}`,
            method: 'PUT',
            data: {
                ...data,
                cover: {
                    type: document.querySelector('.rounded ').src ? 1 : 0,
                    images: [document.querySelector('.rounded ').src ? 1 : 0]
                }
            }
        })
        console.log(res);
        myAlert(true, '修改文章成功！')
    }catch(error){
        myAlert(false, error.response.data.message)
    }

})