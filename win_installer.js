const MSICreator = require('electron-wix-msi').MSICreator;
const path = require('path');
const fs = require('fs');

const APP_PATH = path.join(__dirname, 'oct-agent-output');
const APP_NAME = 'OCTAgent';
const VERSION = '1.0.1';
const OUT_PUT = path.join(__dirname, 'oct-agent-publish');

async function rename_msi(filePath, old, re) {
    return new Promise((resolve, reject) => {
        fs.rename(path.join(filePath, old), path.join(filePath, re), (err => {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        }))
    })
}

const X32_Installer = new MSICreator({
    appDirectory: path.join(APP_PATH, APP_NAME+"-win32-ia32"),
    description: 'oct file push client agent for win32 x32',
    exe: APP_NAME,
    name: APP_NAME,
    manufacturer: 'OCTopuslink',
    version: VERSION,
    outputDirectory: path.join(OUT_PUT, 'x32')
});
const X64_Installer = new MSICreator({
    appDirectory: path.join(APP_PATH, APP_NAME+"-win32-x64"),
    description: 'oct file push client agent for win32 x64',
    exe: APP_NAME,
    name: APP_NAME,
    manufacturer: 'OCTopuslink',
    version: VERSION,
    outputDirectory: path.join(OUT_PUT, 'x64')
});

async function doMSIBuild(){
    console.log('making x32 wxs ...');
    await X32_Installer.create();
    console.log('building x32 msi ...');
    await X32_Installer.compile();
    await rename_msi(path.join(OUT_PUT, 'x32'), APP_NAME+".msi", APP_NAME+'_x32.msi');
    console.log('x32 mis build completed!');
    console.log('making x64 wxs ...');
    await X64_Installer.create();
    console.log('building x64 msi ...');
    await X64_Installer.compile();
    await rename_msi(path.join(OUT_PUT, 'x64'), APP_NAME+".msi", APP_NAME+'_x64.msi');
    console.log('x64 mis build completed!');
}

doMSIBuild().then();
