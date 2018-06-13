const request = require('request');
const logo = "1004";
const unlockType = 0;
const phone = '';

const URLTemplate = `http://121.43.101.137:7018/requestLock?logo=${logo}&unlockType=${unlockType}&phone=${phone}`;

function makePost() {
    let options = {
        url: URLTemplate,
        method: "POST",
    };
    request(options, (err, resp, body)=>{
        if (err) {
            console.error(err);
        } else {
            console.log(body);
        }
    })
}

makePost();