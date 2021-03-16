'use strict'
let Fs = require('fs');
Editor.Panel.extend({
    /* 样式使用外表文件 */
    style: Fs.readFileSync(Editor.url('packages://bindscript/panel/index.css', 'utf8')),
    /* 界面模版使用外部文件 */
    template: Fs.readFileSync(Editor.url('packages://bindscript/panel/index.html')),
    ready() {
        new window.Vue({
            el: this.shadowRoot,
            data: {
                /* 脚本名称 */
                className: "",
                /* 保存路径 */
                pathName: "",
            },
            methods: {
                startBtnEvent(event) {
                    if (this.className.length < 1) {
                        Editor.warn("脚本名称不能为空");
                        return;
                    }
                    Editor.Ipc.sendToMain("bindscript:callSceneScript", this.className, this.pathName);
                }
            }
        });
    }
});