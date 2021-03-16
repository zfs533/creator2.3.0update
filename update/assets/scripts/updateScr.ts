/**
 * 这个要加到main.js里面
 if (cc.sys.isNative) {
    var hotUpdateSearchPaths = cc.sys.localStorage.getItem("searchPaths");
    if (hotUpdateSearchPaths) {
        jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
    }
}
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class ABCDE extends cc.Component {
    private am: jsb.AssetsManager;
    private updating: boolean = false;
    @property({ type: cc.Asset })
    aaaaa: cc.Asset = undefined;
    onLoad(): void {
    }
    private versionCompareHandle(versionA, versionB) {
        cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        var vA = versionA.split('.');
        var vB = versionB.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    }

    private setVerifyCallback(path, asset) {
        let dataPath = jsb.fileUtils.getFileDir(path);
        /* 校验 */
        // let code = md5(dataPath);
        // if (code === asset.md5) {
        //     return true;
        // }
        // if (jsb.fileUtils.isFileExist(path)) {
        //     jsb.fileUtils.removeFile(path);
        // }
        // if (jsb.fileUtils.isFileExist(path + ".tmp")) {
        //     jsb.fileUtils.removeFile(path + ".tmp");
        // }
        // if (jsb.fileUtils.isFileExist(path + ".temp")) {
        //     jsb.fileUtils.removeFile(path + ".temp");
        // }
        cc.log("MD5 ERR:" + asset.path + " \n remote:" + asset.md5 + " \n download:" + asset.md5)
        return true;

    }

    /**
     * 检测是否需要热更的回调函数
     * @param event 
     */
    private checkUpdateCallback(event) {
        cc.log('Code: ' + event.getEventCode());
        let needUpdate = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log("No local manifest file found, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log("Fail to download manifest file, hot update skipped.");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log("Already up to date with the latest remote version.");
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                cc.log('New version found, please try to update.');
                needUpdate = true;
                break;
            default:
                return;
        }

        this.am.setEventCallback(null);
        if (needUpdate) {
            this.startUpdate();
        }
    }

    btnSet(): void {
        if (this.am) { return; }
        cc.log("-----------------------os_start")
        cc.log(cc.sys.os);
        cc.log(cc.sys.OS_ANDROID);
        cc.log(cc.sys.OS_IOS);
        cc.log(cc.sys.isNative);
        /* 在指定的更新目录位置创建临时更新文件夹和缓存文件夹 */
        let storagePath = jsb.fileUtils.getWritablePath();
        cc.log(storagePath);
        let am = jsb.AssetsManager.create("", storagePath);
        /* 设置版本manifest版本对比函数 */
        am.setVersionCompareHandle(this.versionCompareHandle);
        /* 设置下载文件后，校验文件正确性函数 */
        am.setVerifyCallback(this.setVerifyCallback);
        this.am = am;

        cc.log(jsb.AssetsManager.create("", storagePath));
        cc.log("-----------------------os_end")
        cc.log("update inited finished");

    }

    private loadCustomManifest() {
        cc.log("loadcustom----------");
        cc.log(this.am.getState() === jsb.AssetsManager.State.UNINITED);
        /* 初始化本地应用包内manifest */
        if (this.am.getState() === jsb.AssetsManager.State.UNINITED) {
            this.am.loadLocalManifest(this.aaaaa.nativeUrl);
        }
    }


    btnUnset(): void {
        // for (let m in this.aaaaa {
        //     cc.log(m);
        // }
        this.loadCustomManifest();
        this.checkUpdate();
    }

    private checkUpdate() {
        cc.log(this.am.getLocalManifest());
        cc.log(this.am.getLocalManifest().isLoaded());
        if (!this.am.getLocalManifest() || !this.am.getLocalManifest().isLoaded()) {
            cc.log('Failed to load local manifest ...');
            return;
        }
        /* 设置检测是否需要热更新监听函数 */
        this.am.setEventCallback(this.checkUpdateCallback.bind(this));
        this.am.checkUpdate();
    }

    private updateingCb(event: any): void {
        let restart = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log("失败=》没有本地文件");
                break
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log("失败=》下载和解析manifest文件错误" + event.getMessage());
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log("已经更新到最新版本");
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                cc.log("更新结束");
                /* 用cc.sys.localStorage保存Local Manifest的搜索路径 */
                let paths = jsb.fileUtils.getSearchPaths();
                let path = this.am.getLocalManifest().getSearchPaths();
                paths = path.concat(paths);
                cc.log(paths);
                cc.sys.localStorage.setItem("searchPaths", JSON.stringify(paths));
                jsb.fileUtils.setSearchPaths(paths);
                cc.game.restart();
                /* main.js中将缓存文件夹的搜索路径前置在搜索路径中（优先级最高，游戏启动的时候，这个文件在构建后的build目录下） */
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                cc.log("更新失败" + event.getMessage());
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                cc.log("更新遇到错误" + event.getMessage());
                break
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                cc.log("失败=》解密失败");
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                cc.log("----------update progression----------");
                cc.log("byte progression:" + event.getPercent() / 100);
                cc.log("File progression : " + event.getPercentByFile() / 100);
                cc.log(event.getDownloadedFiles() + ' / ' + event.getTotalFiles());
                cc.log(event.getDownloadedBytes() + ' / ' + event.getTotalBytes());
                var msg = event.getMessage();
                if (msg) {
                    cc.log('Updated file: ' + msg);
                }
                break;
            default: break;
        }
        if (restart) {
            cc.game.restart();
        }
    }

    private startUpdate(): void {
        if (this.am && !this.updating) {
            cc.log("开始更新啦啦啦啦");
            this.am.setEventCallback(this.updateingCb.bind(this));
            this.am.update();
            this.updating = true;
        }
    }

}
