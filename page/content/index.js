/**
 * 目标1：获取文章列表并展示
 *  1.1 准备查询参数对象
 *  1.2 获取文章列表数据
 *  1.3 展示到指定的标签结构中
 */
// 1.1 准备查询参数对象
const queryObj = {
    status: '', //文章状态：（1-待审核，2-审核通过，），空字符串-全部
    channel_id: '', //频道id
    page: 1,//当前页码
    per_page: 2 //每页条数
}

// 数据总条数
let totalCount = 0

// 封装到函数
async function setArticleList() {
    // 1.2 获取文章列表数据
    const res = await axios({
        url: '/v1_0/mp/articles',
        params: queryObj
    })
    console.log("文章列表数据");
    console.log(res);
    // 展示到指定的标签结构中
    const htmlStr = res.data.results.map(item => `
    <tr>
      <td>
        <img src="${item.cover.type === 0 ? `https://img2.baidu.com/it/u=2640406343,1419332367&amp;fm=253&amp;fmt=auto&amp;app=138&amp;f=JPEG?w=708&amp;h=500` : item.cover.images[0]}" alt="" > 
      </td>
      <td>${item.title}</td>
      <td>
        ${item.status === 1 ? `<span class="badge text-bg-primary">待审核</span>` : `<span class="badge text-bg-success">审核通过</span>`}   
      </td>
      <td>
        <span>${item.pubdate}</span>
      </td>
      <td>
        <span>${item.read_count}</span>
      </td>
      <td>
        <span>${item.comment_count}</span>
      </td>
      <td>
        <span>${item.like_count}</span>
      </td>
      <td data-id="${item.id}">
        <i class="bi bi-pencil-square edit"></i>
        <i class="bi bi-trash3 del"></i>
      </td>
    </tr>
    `).join('')

    // console.log(htmlStr);

    document.querySelector('.art-list').innerHTML = htmlStr

    // 修改文章总条数
    totalCount = res.data.total_count
    // 渲染
    document.querySelector('.total-count').innerHTML = `共${totalCount}条`

}
// 进入页面先调用一次
setArticleList()

/**
 * 目标2：筛选文章列表
 *  2.1 设置频道列表数据
 *  2.2 监听筛选条件改变，保存查询信息到查询参数对象
 *  2.3 点击筛选时，传递查询参数对象到服务器
 *  2.4 获取匹配数据，覆盖到页面展示
 */
// 2.1 设置频道列表数据
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

// 2.2 监听筛选条件改变，保存查询信息到查询参数对象
// 筛选状态标记数字 -》 change事件 -》绑定到查询参数对象
document.querySelectorAll('.form-check-input').forEach(radio => {
    // 监听每个单选按钮的change事件
    radio.addEventListener('change', e => {
        // 查询参数的值 为 当前用户点击单选按钮的值
        queryObj.status = e.target.value
    })
})

// 筛选频道 -》 change事件 =》 绑定到查询参数对象上
document.querySelector('.form-select').addEventListener('change', e => {
    queryObj.channel_id = e.target.value
})

// 2.4 获取匹配数据，覆盖到页面展示
// 点击筛选按钮，渲染表格
document.querySelector('.sel-btn').addEventListener('click', () => {
    // 发送请求，渲染表格
    setArticleList()
})



/**
 * 目标3：分页功能
 *  3.1 保存并设置文章总条数
 *  3.2 点击下一页，做临界值判断，并切换页码参数并请求最新数据
 *  3.3 点击上一页，做临界值判断，并切换页码参数并请求最新数据
 */
// 3.2 点击下一页，做临界值判断，并切换页码参数并请求最新数据
document.querySelector('.next').addEventListener('click', () => {
    // 如果当前页<总页数，就发送请求重新渲染页面-达到切换页面的效果
    if (queryObj.page < (totalCount / queryObj.per_page)) {
        // 修改当前页码数
        queryObj.page++
        // 修改当前页标签数据
        document.querySelector('.page-now').innerHTML = `第${queryObj.page}页`
        // 发送请求，渲染表格
        setArticleList()
    }
})

// 3.3 点击上一页，做临界值判断，并切换页码参数并请求最新数据
document.querySelector('.last').addEventListener('click',() => {
    if(queryObj.page > 1){       
        // 修改当前页码数
        queryObj.page--
        // 修改当前页标签数据
        document.querySelector('.page-now').innerHTML = `第${queryObj.page}页`
        // 发送请求，渲染表格
        setArticleList()
    }
})

/**
 * 目标4：删除功能
 *  4.1 关联文章 id 到删除图标 - 事件委托
 *  4.2 点击删除时，获取文章 id
 *  4.3 调用删除接口，传递文章 id 到服务器
 *  4.4 重新获取文章列表，并覆盖展示
 *  4.5 删除最后一页的最后一条，需要自动向前翻页
 */
// 4.2 点击删除时，获取文章 id
// 这块绑定的是tbody
document.querySelector('.art-list').addEventListener('click',async e => {
    if(e.target.classList.contains('del')){
        const delId = e.target.parentNode.dataset.id
        console.log(delId);

        // 4.3 调用删除接口，传递文章 id 到服务器
        const res = await axios({
            url:`/v1_0/mp/articles/${delId}`,
            method:'DELETE'
        })
        console.log(res);

        // 修复bug
        // 4.5 删除最后一页的最后一条，需要自动向前翻页
        const children = document.querySelector('.art-list').children
        if(children.length === 1 && queryObj.page!==1){
            // 自动向前翻页
            queryObj.page --
            document.querySelector('.page-now').innerHTML = `第${queryObj.page}页`
        }

        // 4.4 重新获取文章列表，并覆盖展示
        setArticleList()
    }
})

// 点击编辑时，获取文章 id，跳转到发布文章页面传递文章 id 过去

