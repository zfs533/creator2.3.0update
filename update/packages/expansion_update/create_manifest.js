var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var manifest = {
    packageUrl: 'http://127.0.0.1:8091/',
    remoteManifestUrl: 'http://127.0.0.1:8091/project.manifest',
    remoteVersionUrl: 'http://127.0.0.1:8091/version.manifest',
    version: '2.1.0',
    assets: {},
    searchPaths: []
};

module.exports = {
    dest: "",
    src: "",
    setManifestData(updateUrl, updateVersion) {
        manifest.packageUrl = updateUrl;
        manifest.remoteManifestUrl = updateUrl + '/project.manifest';
        manifest.remoteVersionUrl = updateUrl + '/version.manifest';
        manifest.version = updateVersion;
    },
    readDir(dir, obj) {
        Editor.log(dir);
        var stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
            return;
        }
        var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
        for (var i = 0; i < subpaths.length; ++i) {
            if (subpaths[i][0] === '.') {
                continue;
            }
            subpath = path.join(dir, subpaths[i]);
            stat = fs.statSync(subpath);
            if (stat.isDirectory()) {
                this.readDir(subpath, obj);
            }
            else if (stat.isFile()) {
                // Size in Bytes
                size = stat['size'];
                md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
                compressed = path.extname(subpath).toLowerCase() === '.zip';

                relative = path.relative(this.src, subpath);
                relative = relative.replace(/\\/g, '/');
                relative = encodeURI(relative);
                obj[relative] = {
                    'size': size,
                    'md5': md5
                };
                if (compressed) {
                    obj[relative].compressed = true;
                }
            }
        }
    },
    mkdirSync(path) {
        try {
            fs.mkdirSync(path);
        } catch (e) {
            if (e.code != 'EEXIST') throw e;
        }
    },
    start() {
        this.readDir(path.join(this.src, 'src'), manifest.assets);
        this.readDir(path.join(this.src, 'res'), manifest.assets);
        var destManifest = path.join(this.dest, 'project.manifest');
        var destVersion = path.join(this.dest, 'version.manifest');
        this.mkdirSync(this.dest);
        Editor.log(JSON.stringify(manifest));
        fs.writeFile(destManifest, JSON.stringify(manifest), (err) => {
            if (err) throw err;
            Editor.success('Manifest successfully generated');
            delete manifest.assets;
            delete manifest.searchPaths;
            fs.writeFile(destVersion, JSON.stringify(manifest), (err) => {
                if (err) throw err;
                Editor.success('Version successfully generated');
                fs.close();

            });
        });
    }
}
