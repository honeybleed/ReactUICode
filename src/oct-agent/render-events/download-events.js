const fs = require('fs');
const request = require('request');
const {ipcMain} = require("electron");
ipcMain.on('do-download',(event, args)=>{
    let sender = event.sender;
    let fileWriteStream = fs.createWriteStream(args.file_path, {
        flags: 'r+',
        start: args.start
    });
    fileWriteStream.on('finish',()=>{
        sender.send('download-finish', {
            uuid: args.uuid
        });
    }).on('error', (err)=>{
        sender.send('download-error', {
            uuid: args.uuid,
            error: err
        })
    });
    request.get(args.download_url).on("response", (response) => {
        if(response.statusCode === 200) {
            response.on("data", (data) => {
                sender.send('download-update', {
                    uuid: args.uuid,
                    data: data.length
                })
            }).pipe(fileWriteStream);
        } else {
            sender.send('download-error', {
                uuid: args.uuid,
                error: new Error("Error " + response.statusCode + " " + response.statusMessage)
            });
        }
    }).on("error", (err) => {
        sender.send('download-error', {
            uuid: args.uuid,
            error: err
        });
    });
});