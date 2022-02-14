var baseURL = 'http://118.25.55.220:8082';
var wsUrl = 'ws://118.25.55.220:8082/websocket/';
// var baseURL = 'http://10.16.14.213:8082';
// var wsUrl = 'ws://10.16.14.213:8082/websocket/';
//全局ajax获取后台数据
function getData(type, api, data, dataT, contentT, processD) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type,
            url: baseURL + api,
            data,
            asyc: true,
            dataType: dataT || "json", // 返回的数据类型 json currentSensor
            contentType: contentT==undefined? 'application/x-www-form-urlencoded; charset=UTF-8': false,  
            processData: processD==undefined? true: false,
            success: function (data, status, request) {
                resolve(data);
            },
            error: function (err) {
                reject(err)
            }
        });
    })	
}