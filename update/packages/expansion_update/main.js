'use strict';
module.exports = {
    //初始化
    load() {
        Editor.clearLog("", true);
    },
    //卸载
    unload() { },
    //事件监听
    messages: {
        jsonCallMain() {
            Editor.clearLog("", true);
            Editor.log(Editor.Project.path);
            Editor.log(Editor.assetdb.exists("db://assets"));
            Editor.info(Editor.url("db://assets"));
            Editor.success(Editor.url("packages://update"));
        },

        opanPanel() {
            Editor.Panel.open("update");
        },

        /**
         * @param {*} event 
         * @param {版本号} className 
         * @param {热更地址} filePath 
         */
        async startGenerate(event, updateVersion, updateUrl) {
            const fs = require('fs');
            /* 检测资源目录是否存在 */
            Editor.log(Editor.Project.path + "/build/jsb-default/res");
            var resPath = `${Editor.Project.path}/build/jsb-default/res`;
            var resDir = `${Editor.Project.path}/build/res`;
            var srcPath = `${Editor.Project.path}/build/jsb-default/src`;
            var srcDir = `${Editor.Project.path}/build/src`;
            if (!fs.existsSync(resPath) || !fs.existsSync(srcPath)) {
                Editor.warn("请先构建项目~");
                return;
            }

            /* 拷贝资源 */
            await copyDir(resPath, resDir, (err) => { Editor.error(err) });
            await copyDir(srcPath, srcDir, (err) => { Editor.error(err) });

            /* 开始生成 */
            const maniModule = require("./create_manifest");
            maniModule.setManifestData(updateUrl, updateVersion);
            maniModule.dest = `${Editor.Project.path}/build`;
            maniModule.src = `${Editor.Project.path}/build`;
            Editor.log(maniModule.dest);
            maniModule.start();
        }
    }
}

/**
 * 拷贝文件夹
 * @param {源文件目录} src 
 * @param {目标文件目录} dist 
 * @param {*} callback 
 */
async function copyDir(src, dist, callback) {
    const fs = require('fs');
    return new Promise(resolve => {
        fs.access(dist, function (err) {
            if (err) {
                // 目录不存在时创建目录
                fs.mkdirSync(dist);
            }
            _copy(null, src, dist);
            resolve();
        });
        function _copy(err, src, dist) {
            if (err) {
                callback(err);
            } else {
                fs.readdir(src, function (err, paths) {
                    if (err) {
                        callback(err)
                    } else {
                        paths.forEach(function (path) {
                            var _src = src + '/' + path;
                            var _dist = dist + '/' + path;
                            fs.stat(_src, function (err, stat) {
                                if (err) {
                                    callback(err);
                                } else {
                                    // 判断是文件还是目录
                                    if (stat.isFile()) {
                                        fs.writeFileSync(_dist, fs.readFileSync(_src));
                                    } else if (stat.isDirectory()) {
                                        // 当是目录是，递归复制
                                        copyDir(_src, _dist, callback)
                                    }
                                }
                            })
                        })
                    }
                })
            }
        }
    });
}