const EXPIRES_TIME = 500;
export class CookieTools {
    static _expires(minute: number){
        let d = new Date();
        d.setTime(d.getTime() + minute * 60*1000);
        return 'expires='+d.toGMTString();
    }
    static setCookie(name: string) {
        document.cookie = "account="+name+";"+CookieTools._expires(EXPIRES_TIME);
    }
    static removeCookie(){
        let d = new Date(0);
        let t = 'expires='+d.toGMTString();
        document.cookie = "account="+";"+t;
    }
    static getCookie(){
        let ca = document.cookie.split(';');
        if(ca.length < 1) return '';
        let myCa = ca.find((val)=>{
            return val.indexOf('account=') >= 0;
        });
        if (myCa) {
            let kv = myCa.split('=');
            if (kv.length === 2) {
                return kv[1];
            } else {
                return '';
            }
        } else {
            return '';
        }
    }
}