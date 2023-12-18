// 富文本编辑器
// 创建编辑器函数，创建工具栏函数
const { createEditor, createToolbar } = window.wangEditor

// 编辑器配置对象
const editorConfig = {
    // 占位提示文字
    placeholder: '请发布内容...',
    // 编辑器内容、选区变化时的回调函数
    onChange(editor) {
        // 获取富文本内容
        const html = editor.getHtml()
        // 富文本内容是标签，打印
        console.log('editor content', html)
        // 把富文本内容 同步到 <textarea>
        // 为了后续快速收集整个表单内容做铺垫
        document.querySelector('.publish-content').value = html
    }
}

// 创建编辑器
const editor = createEditor({
    // 创建位置
    selector: '#editor-container',
    // 默认内容
    html: '<p>123<br></p>',
    // 配置项-编辑器配置对象
    config: editorConfig,
    // 配置集成模式（default 全部） （simple 简洁）
    mode: 'default', // or 'simple'
})

// 工具栏配置对象
const toolbarConfig = {}

// 创建工具栏
const toolbar = createToolbar({
    // 为指定编辑器创建工具栏-编辑器配置对象中配置的指定编辑器
    editor,
    // 工具栏创建的位置
    selector: '#toolbar-container',
    // 工具栏配置对象
    config: toolbarConfig,
    // 配置集成模式-工具栏全部/简洁
    mode: 'default', // or 'simple'
})
// 创建编辑器函数，创建工具栏函数