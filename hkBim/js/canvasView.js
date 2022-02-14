class CanvasView {
    constructor(domName) {
        if(domName !== undefined) {
            this.dom = document.querySelector(domName);
        }
    }
    //canvas画边框
    draw(obj) {
        if(obj.type == undefined||obj.type < 1||obj.type > 20) {
            console.error('type is undefined or type greater than 20 or type less than 1');
            return false;
        }
        if(obj.borderColor == undefined) {
            obj.borderColor = ['red', 'orange', 'yellow', 'green', '#41dd9c'];
        }
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = obj.width = obj.width || 128;
        canvas.height = obj.height = obj.height || 128;
        ctx.fillStyle = obj.background || 'rgba(0,0,0,.5)';
        ctx.strokeStyle = obj.borderColor[0]
        ctx.lineWidth = obj.lineWidth = obj.lineWidth || '6';
        ctx.font = obj.fontSize = obj.fontSize || 'normal 16px Microsoft Yahei' ;
        let a = 'type'+obj.type;
        eval('CanvasView.'+a+ '(ctx, obj)');
        if(this.dom !== undefined) {
            this.dom.appendChild(canvas);
        }
        return canvas;
    }
    //边框类型
    static type1(ctx, obj) {
        let rowStart = 1;
        let borderW = 30;
        //四脚线
        let point = [{point1:[0,borderW],point2:[0,0],point3:[borderW,0]},
                    {point1:[obj.width-borderW,0],point2:[obj.width,0],point3:[obj.width, borderW]},
                    {point1:[0,obj.height-borderW],point2:[0,obj.height],point3:[borderW,obj.height]},
                    {point1:[obj.width-borderW,obj.height],point2:[obj.width,obj.height],point3:[obj.width,obj.height - borderW]},  
                    ];
        point.forEach(item => {
            ctx.beginPath();
            ctx.moveTo(item.point1[0], item.point1[1]);
            ctx.lineTo(item.point2[0], item.point2[1]);
            ctx.lineTo(item.point3[0], item.point3[1]);
            ctx.stroke();
            ctx.closePath();
        })
        //文字框
        let box = [{point1:[obj.lineWidth/2, obj.lineWidth/2],point2:[obj.width-obj.lineWidth/2,obj.lineWidth/2],
            point3:[obj.width-obj.lineWidth/2, obj.height-obj.lineWidth/2],point4:[obj.lineWidth/2, obj.height-obj.lineWidth/2]}];
        ctx.lineWidth = '2';
        ctx.strokeStyle = obj.borderColor[1];
        box.forEach(item => {
            ctx.beginPath();
            ctx.moveTo(item.point1[0], item.point1[1]);
            ctx.lineTo(item.point2[0], item.point2[1]);
            ctx.lineTo(item.point3[0], item.point3[1]);
            ctx.lineTo(item.point4[0], item.point4[1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        })
        CanvasView.drawText(ctx, obj);
    }
    static type2(ctx, obj) {
        let r = obj.width<obj.height?obj.width/2-obj.lineWidth*2:obj.height/2-obj.lineWidth*2;
        let text = obj.text || '';
        let l = r/obj.borderColor.length;
        ctx.lineCap = 'round';
        if(obj.borderColor.length < 0) {
            console.error('obj.borderColor must be a array');
            return false;
        }
        ctx.font = obj.fontSize = obj.fontSize || 'normal 25px kaiti' ;
        for(var i= 0;i<= obj.borderColor.length;i++){
            let start = (0.75+0.5*i)*Math.PI;
            let end = (2.25+0.5*i)*Math.PI;
            if(i === 0 || i === obj.borderColor.length-1){
                start = 0;
                end = 2*Math.PI;
            }
            ctx.strokeStyle = obj.borderColor[i];
            ctx.beginPath();
            ctx.arc(obj.width/2, obj.height/2, r-i*l,start, end);
            ctx.stroke();
            ctx.closePath();
            if(r-i*l<0||r-i*l< ctx.measureText(text).width) break;
        }
        ctx.fillStyle = obj.fontColor || 'orange';
        ctx.beginPath();
        ctx.fillText(text, 
            (obj.width- ctx.measureText(text).width)/2 ,
            (obj.height+(obj.fontSize.replace(/[^0-9]/ig,'')*1))/2)
        ctx.closePath();
        
    }
    static type3(ctx, obj) {
        ctx.beginPath();
        ctx.arc(64, 64, 45, 0,2*Math.PI);
        ctx.fill();
        ctx.arc(64, 64, 43, 0,2*Math.PI);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle =  ctx.strokeStyle;
        ctx.beginPath();
        ctx.lineTo(42, 103.6);
        ctx.lineTo(63, 125);
        ctx.lineTo(86, 103.6);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        let text  = 'text内容';
        if(typeof(obj.text) == 'object'){
            text = obj.text.content || 'text内容';
            ctx.shadowBlur = obj.text.shadow? 8:0;
            ctx.font = obj.text.size || "normal 22px Arial";
            ctx.fillStyle = obj.text.color || "#FFF";
            ctx.shadowColor=  ctx.fillStyle;
        }else{
            text = obj.text || 'text内容';
            ctx.font =  obj.fontSize || "normal 22px Arial";
            ctx.fillStyle = obj.fontColor || "#fff";
            ctx.shadowColor=  ctx.fillStyle;
        }
        ctx.beginPath();
        ctx.textAlign = 'center';
        ctx.fillText(text, 64, 70);
        ctx.closePath();
    }
    static type4(ctx, obj) {
        ctx.fillStyle = obj.borderColor[0];
        ctx.beginPath();
        ctx.fillRect(0, 0, obj.width/2, obj.height);
        ctx.fillStyle = obj.borderColor[1];
        ctx.fillRect(obj.width/2, 0, obj.width/2, obj.height);
        ctx.closePath();
    }
    static type5(ctx, obj) {
        //文字背景
        let box = [{point1:[0, 0],point2:[obj.width-10,0],point3:[obj.width,10],
            point4:[obj.width, obj.height/3],point5:[10, obj.height/3],point6:[0, (obj.height-10)/3]}];
        box.forEach(item => {
            ctx.beginPath();
            ctx.moveTo(item.point1[0], item.point1[1]);
            ctx.lineTo(item.point2[0], item.point2[1]);
            ctx.lineTo(item.point3[0], item.point3[1]);
            ctx.lineTo(item.point4[0], item.point4[1]);
            ctx.lineTo(item.point5[0], item.point5[1]);
            ctx.lineTo(item.point6[0], item.point6[1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        })
        //下边线
        ctx.beginPath();
        let grad = ctx.createLinearGradient(0, 0, obj.width, 0);
        grad.addColorStop(0,obj.borderColor[0]);
        grad.addColorStop(0.5,obj.borderColor[1]);
        grad.addColorStop(1,obj.borderColor[0]);
        ctx.fillStyle= grad;
        ctx.rect(10, (obj.height-ctx.lineWidth*1)/3,obj.width, ctx.lineWidth*1)
        ctx.closePath();
        ctx.fill();
        //连接线
        ctx.shadowBlur = 10;
        ctx.lineWidth = obj.lineWidth = obj.lineWidth || '2';
        ctx.shadowColor=obj.borderColor[1];
        ctx.fillStyle= ctx.strokeStyle = obj.borderColor[1];
        ctx.beginPath();
        ctx.arc(10, (obj.height-ctx.lineWidth*1)/3,ctx.lineWidth, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(10, (obj.height-ctx.lineWidth*1)/3);
        ctx.lineTo(obj.width/6, obj.height/2.5);
        ctx.lineTo(obj.width/2.5, obj.height/2.5);
        ctx.lineTo(obj.width/2, obj.height/1.5);
        ctx.stroke();
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(obj.width/2, obj.height/1.5, ctx.lineWidth, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();

        CanvasView.drawText(ctx, obj);
        
    }
    static type6(ctx, obj) {
        //文字框
        ctx.strokeStyle = obj.borderColor[0];
        ctx.rect(obj.lineWidth/2, obj.height/2-20, obj.width-obj.lineWidth, obj.height/3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = obj.borderColor[1];
        ctx.beginPath();
        ctx.arc(18, obj.height/2, 10, 0, Math.PI*2);
        ctx.closePath();
        // ctx.fill();
        CanvasView.drawText(ctx, obj);
    }
    static type7(ctx, obj) {
        let lines = [];
        let number = obj.number || 5;
        let showX = !!obj.showX ? -5: 1;
        let showY = !!obj.showY ? 5: -1;
        updated(number);
        animate();
        function init() {
            let x,y,vx,vy,h,color;
            let flag = rangeNum(showX, showY);
            if(flag > 0) {
                x = rangeNum(5,obj.width-5);
                y = rangeNum(0,15);
                vx = 0;
                vy = rangeNum(1, 3);
                h = 0;
            }else{
                x = rangeNum(0, 15);
                y = rangeNum(0, obj.height-5);
                vx = rangeNum(1, 3);
                vy = 0;
                h = 0;
            }
            return {x, y, vx, vy, h, color}; 
        }
        function creat(arg) {
            ctx.lineWidth = '1';
            ctx.fillStyle = arg.color;
            for(let i = 20; i > 0; i--) {
                ctx.strokeStyle = `rgba(225, 0, 225, ${1/i})`;
                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.moveTo(arg.x,arg.y);
                ctx.lineTo(arg.x-arg.vx*i,arg.y-arg.vy*i);
                ctx.closePath();
                ctx.stroke();
            }
                
        }
        function updated(num) {
            for(let i = 0; i< num; i++) {
                let line = init();
                creat(line);
                lines.push(line);
            }
        }
        window.requestAnimFrame = (function(){
            return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function( callback ){
                    window.setTimeout(callback, 6000 / 60);
                };
        })();
        function animate() {
            ctx.clearRect(0,0,obj.width, obj.height);
            lines.forEach( (item, index) => {
                ++item.h;
                let arg = {
                    x: item.x+(item.vx*item.h), 
                    y: item.y+(item.vy*item.h), 
                    vx: item.vx, vy: item.vy, 
                    h: item.h
                };
                creat(arg);
                if((item.vx*item.h) > obj.width+55 || (item.vy*item.h) > obj.height+55) {
                    lines.splice(index, 1);
                    updated(1);
                }
            })
            requestAnimationFrame(animate);
        }
        function rangeNum(min, max) {
            return Math.round(Math.random()*(max-min) + min);
        }

    }
    //文字
    static drawText(ctx, obj) {
        //文本title
        let rowStart = 1;
        let title = '';
        let titleSize = 0;
        let titleAlign = 'center';
        ctx.shadowBlur = 0;
        if(typeof(obj.title) == 'object') {
            title = obj.title.content;
            ctx.font = obj.title.size = obj.title.size || 'normal 20px Microsoft Yahei' ;
            ctx.fillStyle = obj.title.color || '#fff';
            ctx.textBaseLine = 'middle';
            ctx.shadowBlur = obj.title.shadow? 8:0;
            titleAlign = obj.title.align||titleAlign;
        }else{
            title = obj.title;
            ctx.fillStyle = '#fff';
        }
        titleSize = ctx.font.replace(/[^0-9]/ig, '')*1;
        if(title !== undefined) {
            titleAlign = checkTextPos(titleAlign, title);
            ctx.beginPath();
            ctx.fillText(title, titleAlign, titleSize+3)
            ctx.closePath();
            rowStart++;
        }
        //文本内容
        let text = '';
        let top = 0;
        let left  = 0;
        let textAlign = 'left';
        let textSize = 0;
        ctx.shadowBlur = 0;
        if(typeof(obj.text) == 'object') {
            text = obj.text.content;
            ctx.fillStyle = obj.text.color || '#fff';
            ctx.font = obj.text.size = obj.text.size || 'normal 16px Microsoft Yahei' ;
            ctx.shadowBlur = obj.text.shadow? 8:0;
            textAlign = obj.text.align||textAlign;
            top = obj.text.top|| 5;
            left = obj.text.left|| 0;
        }else {
            text = obj.text;
            top = 5;
            left = 0;
            ctx.font = obj.fontSize || 'normal 12px Microsoft Yahei';
            ctx.fillStyle = '#fff';
        }
        textSize = ctx.font.replace(/[^0-9]/ig, '')*1;
        let row = CanvasView.textRow(text);
        row.forEach((item, i) => {
            let align = checkTextPos(textAlign, item);
            ctx.beginPath();
            ctx.fillText(item, align+left, (titleSize+ top)*(i+rowStart));
            ctx.closePath();
        })
        function checkTextPos(align, text) {
            switch(align) {
                case 'left': return 10;break;
                case 'center': return (obj.width-ctx.measureText(text).width)/2;break;
                case 'right': return obj.width-ctx.measureText(text).width - 10;break;
            }
        }
    }
    //文字换行
    static textRow(text) {
        let rowtArr = [];
        let str = text = text ||'';
        let count = 0;
        find();
        function find() {
            count = str.indexOf('/n');
            if (count > -1){
                rowtArr.push(str.substring(0, count));
                str = str.substring(count+2, str.length);
                find();
            }else{
                rowtArr.push(str.substring(count, text.length));
                return false;
            }
        }
        return rowtArr;
       
    }
}
// export default CanvasView;