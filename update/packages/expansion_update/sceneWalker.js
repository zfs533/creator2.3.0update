
console.log(1);
console.log(process.argv[0])
console.log(process.argv[1])
console.log(process.argv[2])
console.log(process.argv[3])
// const fs = require('fs');
// const path = require("path");
// /* 场景脚本 */
// module.exports = {
//     async getCanvasChildren(event, className, filePath) {
//         Editor.success(className);
//         Editor.success(filePath);
//         let url = this.checkFilePath(filePath);
//         await this.dealUrl(className, url);
//         /* 获取当前选中节点uuid */
//         let uuid = Editor.Selection.curSelection('node');
//         /* 获取节点对象 */
//         let node = cc.engine.getInstanceById(uuid);
//         node.addComponent(className);
//         Editor.success("add success");
//     },

//     /**
//      * 递归创建目录 同步方法 
//      * @param {绝对路径 string} dirname 
//      */
//     mkdirsSync(dirname) {
//         if (fs.existsSync(dirname)) {
//             return true;
//         } else {
//             Editor.success(path.dirname(dirname));
//             if (this.mkdirsSync(path.dirname(dirname))) {
//                 fs.mkdirSync(dirname);
//                 return true;
//             }
//         }
//     },

//     /**
//      * 文件存放路径
//      * @param {相对路径 string} filePath 
//      */
//     checkFilePath(filePath) {
//         let url = `${Editor.Project.path}/assets/scripts/${filePath}`
//         if (!fs.existsSync(url)) {
//             this.mkdirsSync(url);
//         }
//         return url;
//     },

//     /**
//      * 生成脚本组件
//      * @param {类名 string} className 
//      * @param {绝对路径} filePath 
//      */
//     async dealUrl(className, filePath) {
//         return new Promise(async resolve => {
//             if (!fs.existsSync(filePath)) {
//                 Editor.error("目录不存在")
//                 Editor.success(filePath);
//                 resolve()
//                 return;
//             }
//             /* 将模版拷贝到指定位置 */
//             fs.copyFileSync(`${__dirname}/moduleScript.ts`, `${filePath}/${className}.ts`);
//             /* 刷新脚本资源目录 */
//             await Editor.Ipc.sendToMain("bindscript:refreshAssets", () => {
//                 setTimeout(() => {
//                     resolve();
//                 }, 3000);
//             });
//         });
//     }
// };