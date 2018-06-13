const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const fileArray = [
     {
        uuid: "00f263aa-3fa2-4214-ae76-96be9ab235b5",
        name: "David-Lewis-Pencil_Drawing_Techniques.pdf",
         img: "http://img.zcool.cn/community/01ad0e57e23c220000012e7ed7c8fa.jpg"
    },
    {
        uuid: "4a6881a5-93f6-495c-bdc5-424919939df8",
        name: "IntelliJIDEALicenseServer(v1.3).zip",
        img: "http://logo.chuangyimao.com/uploads/logo/20150108/nail/150108050428e481cbc739.gif"
    },
    {
        uuid: "44ecd1f5-0949-49b9-8edc-3d8373f09d35",
        name: "Mockplus_Setup_v2.3.6.exe",
        img: "http://img.download.pchome.net/3l/13/140117_600x450.jpg"
    }
];
const checkPathName = "/files";
const downPathName = "/file";

http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    if (pathname === checkPathName) {
        doFileCheck(req, res);
    } else if (pathname === downPathName) {
        doDownload(req, res);
    } else {
        return404(pathname, res);
    }
}).listen(3322);

const doDownload = (req, res) => {
    let params = url.parse(req.url,true).query;
    if (params.hasSize === undefined || params.chunk === undefined || params.uuid === undefined) {
        returnDownloadArgsRequired(res);
    } else {
        let item = fileArray.find((fileItem) => {
            if (fileItem.uuid === params.uuid) {
                return true;
            }
        });
        if (!item) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end("has no file match uuid: " + params.uuid);
        } else {
            let fileName = item.name;
            let fullPath = path.join(__dirname, 'test-files', fileName);
            fs.stat(fullPath, (err, stat) => {
                if(err) {
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end("read file: " + params.uuid + "error!");
                } else {
                    if (stat.size <=  params.hasSize) {
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end("request index out of range!");
                    } else {
                        doRealUploadBlock(fullPath, stat.size, params.hasSize*1, params.chunk*1, res);
                    }
                }
            })
        }
    }
};

const doRealUploadBlock = (fullPath, size, hasSize, chunk, res) => {
    let start = hasSize;
    let end = hasSize + (chunk * 1024) - 1;

    if ( end > (size - 1) ) {
        end = size - 1;
        console.log("[" + start + "," + end + "]" + "last");
    } else {
        console.log("[" + start + "," + end + "]");
    }
    let readStream = fs.createReadStream(fullPath, {start:start, end: end});
    readStream.pipe(res);
};

const doFileCheck = (req, res) => {
    res.end(JSON.stringify(fileArray));
};

let return404 = (pn, res) => {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("This Request URL " + pn + "was not found on this server.");
};
// let returnUUIDRequired = (res) => {
//     res.writeHead(500, {'Content-Type': 'text/plain'});
//     res.end("param uuid was required.");
// };
let returnDownloadArgsRequired = (res) => {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end("param index[number] & chunk[number/mb] & uuid[string] was required.");
};
// let checkFileStats = (uuid, res) => {
//     if (!fileMap[uuid]) {
//         res.writeHead(500, {'Content-Type': 'text/plain'});
//         res.end("has no file match uuid: " + uuid);
//     } else {
//         let fileName = fileMap[uuid];
//         let fullPath = path.join(__dirname, 'test-files', fileName);
//         fs.stat(fullPath, (err, stat) => {
//             if(err) {
//                 console.log(err);
//                 res.end("read file: " + uuid + "error!");
//             } else {
//                 console.log(stat);
//                 res.end(JSON.stringify({
//                     name: fileName,
//                     size: stat.size,
//                     img: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1524568405106&di=24e7baaafbb4abed77f47111bc615df8&imgtype=0&src=http%3A%2F%2Fa.hiphotos.baidu.com%2Fbaike%2Fw%253D217%2Fsign%3D809ef80b0af79052ef1f403f3bf3d738%2Fe850352ac65c1038f37945dab1119313b07e89a7.jpg"
//                 }));
//             }
//         })
//     }
// };