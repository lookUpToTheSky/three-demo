// const baseURL = 'http://192.168.11.151:8088';
// const websocketURL = 'ws://192.168.11.151:8088/websocket/';
// const baseURL = 'http://111.231.106.94:8088';
const websocketURL = 'wss://yun.kexsci.com/wss/websocket/';
const baseURL = 'https://yun.kexsci.com/yun/api/';
// const websocketURL = 'ws://yun.kexsci.com/yun/api/websocket/';
//全局ajax获取数据
function getData(type, api, data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: type,
            url: baseURL + api,
            data: data,
            asyc: true,
            dataType: "json", // 返回的数据类型 json
            success: function (data) {
                resolve(data)
            },
            error: function (err) {
                reject(err)
            }
        });
    })	
}