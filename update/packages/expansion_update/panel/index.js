'use strict'
let Fs = require('fs');
Editor.Panel.extend({
    /* 样式使用外表文件 */
    style: Fs.readFileSync(Editor.url('packages://update/panel/index.css', 'utf8')),
    /* 界面模版使用外部文件 */
    template: Fs.readFileSync(Editor.url('packages://update/panel/index.html')),
    ready() {
        new window.Vue({
            el: this.shadowRoot,
            data: {
                /* 热更地址http://127.0.0.1:8091 */
                updateUrl: "http://127.0.0.1:8091",
                /* 版本号 */
                updateVersion: "0.0.0",
            },
            methods: {
                startBtnEvent(event) {
                    if (this.updateVersion.length < 1) {
                        Editor.warn("版本号不能为空");
                        return;
                    }
                    if (this.updateUrl.length < 1) {
                        Editor.warn("更新地址不能为空");
                        return;
                    }
                    Editor.Ipc.sendToMain("update:startGenerate", this.updateVersion, this.updateUrl);
                }
            }
        });
    }
});