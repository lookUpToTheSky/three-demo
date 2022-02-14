var frame = new THREE.Group();
let frameModel = new THREE.Group();
let sky,riverGroup,buildGroup = new THREE.Group(),planeGroup,noteGroup, note1Group;
var objArr = [];//桁架数组
var frame13 = new THREE.Group();
let objLoadNum = 0;
let objLoader = new THREE.OBJLoader();
let mtlLoader = new THREE.MTLLoader();
var senCodeArr3 = [441072,305999,441068,465975];
var senCodeArr6 = [441069,441067,441070,441066];
var sensorList0 = [
    [{node:null,data:null},  {node:null,data:null}, {node:null,data:null}]
    ]//传感器模型0，12p桁架传感器模型
var sensorList1 = [
    [{node:null,data:null, senName: 'ND-03-02,ND-06-02'},  {node:null,data:null, senName: 'ND-03-03,ND-06-03'}, {node:null,data:null, senName: 'ND-03-04,ND-06-043'}],
    [{node:null,data: null, senName: 'ND-03-07,ND-06-07'}, {node:null,data:null, senName: 'ND-03-08, ND-06-08'}, {node:null,data:null, senName: 'ND-03-09, ND-06-09'}],
    [{node:null,data:null, senName: 'ND-03-12, ND-06-12'}]
    ]//传感器模型1，1p-9p桁架传感器模型
var sensorList2 = [
    [{node:null,data:null}, {node:null,data:null},{node: null,data:null}, {node:null,data:null},{node:null,data:null}],
    [{node:null,data:null}, {node:null,data:null},{node:null,data:null}, {node:null,data:null},{node:null,data:null}],
    [{node:null,data:null},                              {node:null,data:null},                {node:null,data:null},]
]//传感器模型2，10p和11p桁架传感器模型
var sensorList3 = [
    {node:null,data:null,senName:'YL-03-01,YL-06-01',senCode:385409},  {node:null,data:null,senName:'YL-03-02,YL-06-02',senCode:385414},
    {node:null,data:null,senName:'YL-03-03,YL-06-03',senCode:386759},{node:null,data:null,senName:'YL-03-04,YL-06-04',senCode:385410},
    {node:null,data: null,senName:'YL-03-05,YL-06-05',senCode:386762},{node:null,data:null,senName:'YL-03-06,YL-06-06',senCode:386763},
    {node:null,data:null,senName:'YL-03-07,YL-06-07',senCode:386761},{node:null,data: null,senName:'YL-03-08,YL-06-08',senCode:385418},
    {node:null,data:null,senName:'YL-03-09,YL-06-09',senCode:385421},{node:null,data:null,senName:'YL-03-10,YL-06-10',senCode:385416},
    {node:null,data:null,senName:'YL-03-11,YL-06-11',senCode:385422}
    ]//应力传感器模型3p，6p桁架应力传感器模型
var sensorList4 = [
    {node:null,data:null,senCode:441072},  {node:null,data:null,senCode:305999}, 
    {node:null,data:null,senCode:441068},{node:null,data:null,senCode:465975}
    ]//位移传感器模型3p，6p桁架应力传感器模型
var sensorList5 = [
    [{node:null,data:null, senName: 'JSD3P-01,JSD6P-01'},  {node:null,data:null, senName: 'JSD3P-02,JSD6P-02'}, {node:null,data:null, senName: 'JSD3P-03,JSD6P-03'}],
    [{node:null,data: null, senName: 'JSD3P-04,JSD6P-04'}, {node:null,data:null, senName: 'JSD3P-05,JSD6P-05'}, {node:null,data:null, senName: 'JSD3P-06,JSD6P-06'}],
    [{node:null,data:null, senName: 'JSD3P-07, JSD6P-07'}]
    ]//传感器模型1，1p-9p桁架传感器模型
//动画
function thingAniamte(start, end, time, num) {
    let tween = new TWEEN.Tween(start)
        .to(end, time)
        .yoyo(true)
        .repeat(num||0)
        .start('+800')
    tween.start();
    return tween;
}
//天空盒
function setSkyBox(type,scene) {
    // if(sky != undefined) scene.remove(sky);
    let loader = new THREE.TextureLoader();
    let skyBox = new THREE.BoxGeometry(20000,20000,20000);
    let rootPath = 'image/';
    let imgNameArr = ['_posx','_negx','_posy','_negy','_posz','_negz'];
    let format = '.jpg';
    let materialArr = [];
    for(let i=0; i< imgNameArr.length;i++) {
        materialArr.push(new THREE.MeshBasicMaterial({
            map:loader.load(rootPath+type+imgNameArr[i]+format),
            side: THREE.BackSide}));
    }
    sky = new THREE.Mesh(skyBox, materialArr);
    sky.name = 'skyBox';
}
//传感器模型0
function buildLight0(frame, group) {
    sensorList0[0].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x -94 + j*78;
        pos.y = pos.y + 39.4;
        pos.z = pos.z + 9.5;
        positionSensor(item,group, pos.x, pos.y, pos.z);
    })
} 
//传感器模型1
function buildLight1(frame, group) {
    sensorList1[0].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x - 60 + j*40;
        pos.y = pos.y + 46.7;
        pos.z = pos.z + 5.5;
        positionSensor(item,group, pos.x, pos.y, pos.z);
    })
    sensorList1[1].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x -60 + j*40;
        pos.y = pos.y + 46.7;
        pos.z = pos.z + 13;
        positionSensor(item, group,pos.x, pos.y, pos.z);
    })
    sensorList1[2].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x - 20;
        pos.y = pos.y + 39.4;
        pos.z = pos.z + 9.5;
        positionSensor(item, group,pos.x, pos.y, pos.z);
    })
} 
//传感器模型2
function buildLight2(frame, group) {
    sensorList2[0].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x - 100 + j*41.5;
        pos.y = pos.y + 46.7;
        pos.z = pos.z  + 5.5;
        positionSensor(item, group,pos.x, pos.y, pos.z);
    })
    sensorList2[1].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x - 100 + j*41.5;
        pos.y = pos.y + 46.7;
        pos.z = pos.z + 13;
        positionSensor(item,group, pos.x, pos.y, pos.z);
    })
    sensorList2[2].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x - 94 + j*78;
        pos.y = pos.y + 39.4;
        pos.z = pos.z + 9.5;
        positionSensor(item, group,pos.x, pos.y, pos.z);
    })
} 
//应力监测传感器模型3
function buildLight3(frame, group) {
    sensorList3.forEach((item, j) => {
        let pos = frame.position.clone();
        if(j < 2) {
            pos.x = pos.x - 100;
            pos.y = pos.y + 46.7;
            pos.z = pos.z + 5.5+ j*8;
            positionSensor(item, group,pos.x, pos.y, pos.z);
        }else if(j>=2&&j<4){
            pos.x = pos.x - 97.5;
            pos.y = pos.y + 43;
            pos.z = pos.z + 7.5+ (j-2)*4;
            positionSensor(item, group,pos.x, pos.y, pos.z);
        }else if(j>=4&&j<6){
            pos.x = pos.x - 15.75;
            pos.y = pos.y + 46.7;
            pos.z = pos.z + 5.5+ (j-4)*8;
            positionSensor(item, group,pos.x, pos.y, pos.z);
        }else if(j>=6&&j<7) {
            pos.x = pos.x - 15.75;
            pos.y = pos.y + 39.5;
            pos.z = pos.z + 9.5;
            positionSensor(item, group,pos.x, pos.y, pos.z);
        }else if(j>=7&&j<9) {
            pos.x = pos.x + 66;
            pos.y = pos.y + 46.7;
            pos.z = pos.z + 5.5+ (j-7)*8;
            positionSensor(item, group,pos.x, pos.y, pos.z);
        }else if(j>=9&&j<11){
            pos.x = pos.x + 64.5;
            pos.y = pos.y + 43;
            pos.z = pos.z + 7.5+ (j-9)*4;
            positionSensor(item,group, pos.x, pos.y, pos.z);
        }
    })
} 
//位移监测传感器模型4
function buildLight4(frame, group) {
    sensorList4.forEach((item, j) => {
        let pos = frame.position.clone();
        if(j < 2) {
            pos.x = pos.x - 100;
            pos.y = pos.y + 46.7;
            pos.z = pos.z + 5.5+ j*8;
            positionSensor(item, group,pos.x, pos.y, pos.z);
        }else{
            pos.x = pos.x + 66;
            pos.y = pos.y + 46.7;
            pos.z = pos.z + 5.5+ (j-2)*8;
            positionSensor(item, group, pos.x, pos.y, pos.z);
        }
    })
} 
//传感器模型5
function buildLight5(frame, group) {
    sensorList5[0].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x - 100 + j*82.5;
        pos.y = pos.y + 46.7;
        pos.z = pos.z + 5.5;
        positionSensor(item,group, pos.x, pos.y, pos.z);
    })
    sensorList5[1].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x - 100 + j*82.5;
        pos.y = pos.y + 46.7;
        pos.z = pos.z + 13;
        positionSensor(item, group,pos.x, pos.y, pos.z);
    })
    sensorList5[2].forEach((item, j) => {
        let pos = frame.position.clone();
        pos.x = pos.x - 20;
        pos.y = pos.y + 39.4;
        pos.z = pos.z + 9.5;
        positionSensor(item, group,pos.x, pos.y, pos.z);
    })
} 
//clone传感器
function positionSensor(sensor,group, x, y, z) {  
    let sphere = new THREE.SphereGeometry(1,110,140);
    let MeshPhongMaterial = new THREE.MeshBasicMaterial({color: '#7fff00', transparent: true, opacity: 0});
    mesh = new THREE.Mesh(sphere, MeshPhongMaterial);
    sensor.node = mesh.clone(true);
    sensor.node.position.x = x;
    sensor.node.position.y = y;
    sensor.node.position.z = z;
    sensor.node.name = 'sensor';
    if(sensor.sensorData) {
        sensor.node.sensorData = sensor.sensorData;
    }
    group.add(sensor.node);
}
//地板
function plane() {
    planeGroup = new THREE.Group();
    let plane = new THREE.PlaneGeometry(1900,1500);
    let material = new THREE.MeshBasicMaterial( { color:"#111"});
    let cube = new THREE.Mesh( plane, material );
    cube.rotation.x = -1.57;
    cube.position.x = 250;
    cube.position.z = 400;
    cube.name='plane';
    cube.position.y = -15;
    planeGroup.add(cube)
}
function frameNote() {
    noteGroup = new THREE.Group();
    note1Group = new THREE.Group();
    let texture = new THREE.Texture(new CanvasView().draw({
        type: 5,
        title: {
            content:'中南大学体育馆主馆',
            size:'normal 12px Arial',
            color: '#00F6FF',
            align:'center'
        },
        background:'rgba(0,0,0,0.8)',
        text: {
            content:'钢桁架数：12榀',
            size:'normal 14px Arial',
            color: 'orange',
            align:'center'
        },
        lineWidth: '2',
        borderColor: ['green', '#00F6FF']
    }))
    texture.needsUpdate = true; 
    texture.repeat.set(1,1);
    let material = new THREE.SpriteMaterial({
        map: texture,
        // color:'#ccc'
    });
    let note = new THREE.Sprite(material);
    note.position.y = 100;
    note.position.x = -10;
    note.scale.multiplyScalar(100);
    note.name="note";
    noteGroup.add(note);

    objArr.forEach((item, i) => {
        var pos;
        if(i == 12) {
            pos = item.position.clone();
            pos.y = pos.y + 50;
            pos.z = pos.z - 105;
            pos.x = pos.x -10;  
        }else{
            pos = item.position.clone();
            pos.y = pos.y + 60;
            pos.z = pos.z + 10;
            pos.x = pos.x -10;  
        }
        let texture = new THREE.Texture(new CanvasView().draw({
                type: 3,
                text: {
                    content:`${i+1}P`,
                    color: 'orange',
                    size:'normal 38px Arial'
                },
                background: 'rgba(0,0,0, .6)',
                lineWidth:'4',
                borderColor:['#3299cc']
            }))
        let material = new THREE.SpriteMaterial({map: texture});
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1,1);
        let sprite = new THREE.Sprite(material);
        sprite.position.y =pos.y;
        sprite.position.z =pos.z;
        sprite.position.x =pos.x;
        sprite.scale.set(15,15,15);
        sprite.name = 'frameId';
        note1Group.add( sprite );
    })
}
//桁架模型
let onProgress = function onProgress(xhr) {
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        var percent = $("#loading");
        //percent.text('正在加载 ' + Math.round(percentComplete, 2) + '%');
        if( Math.round(percentComplete, 2) == 100) {
            objLoadNum++;
            if(objLoadNum == 9) {
                buildModel(frame);
                // frameNote(scene);
            }
        }
    }
}
let onError = function(xhr) {console.log('加载失败')};
function frameSetColor(group) {
    group.children.forEach((item) => {
        if(item.type == 'Group') {
            item.children.forEach((element) => {
                element.material = new THREE.MeshPhongMaterial({
                    color: '#666'
                })
            })
        }
    })
}
// 加入到场景中
function buildModel(obj) {
    obj.position.z = 65.35;
    for(let i = 0; i < 13;i++) {
        if(i<12) {
            objArr[i] = obj.clone(true);
            if(i <= 8) {
                objArr[i].position.z = 65.35- 15.35*i;
            }else{
                objArr[i].position.y = - 1.8*(i-8);
                objArr[i].position.z = 65.35 - 15.34*i;
            } 
        }else{
            objArr[i] = frame13.clone(true);
        }
        objArr[i].traverse( item => {
            if(item.type == 'Mesh') {
                item.material = new THREE.MeshPhongMaterial({
                    color: '#666',
                    transparent: true,
                    opacity: 0.3
                })
            }
        })
        objArr[i].name = (i+1)+'P';
        frameModel.add(objArr[i]);
    }
    frameNote();
}
//桁架
function loadModel(fileName, progress) {
    return new Promise((reslove, reject) => {
        objLoader.load('resource/'+ fileName, function(object) {
            let group = new THREE.Group();
            object.children[0].material.color.set('#888');
            object.children[0].material.transparent = true;
            object.children[0].material.opacity = 0.3;
            group.scale.set(0.002,0.002, 0.002);
            group.add(object);
            reslove(group);
        },progress, onError);
    }); 
}
initModel();
function createdModle(scene, fileName, color, opacity, name) {
    return new Promise((reslove, reject) => {
        mtlLoader.load('resource/'+ fileName+ '.mtl', function(material) {
            material.preload();
            objLoader.setMaterials(material);
            objLoader.load('resource/'+ fileName + '.obj', function(object) {
                object.name = name || '';
                object.traverse( child => {
                    if(child.type == 'Mesh') {
                        var edges = new THREE.EdgesGeometry(child.geometry);
                        var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
                            color: color ||'#00F6FF',
                            transparent: true,
                            opacity: 0.5
                        }));
                        line.renderOrder = -5;
                        object.add(line);
                        child.material = new THREE.MeshPhysicalMaterial({
                            color:  color || '#666',
                            transparent: true,
                            opacity: opacity || 0.2
                        })
                    }
                })
                object.rotateY(-3.14);
                object.position.x = -40;
                object.position.y = 5;
                scene.add(object);
                reslove();
            });   
        })
    })
}
function initModel() {
    plane();
    setSkyBox('dark');
    // //主馆
    // buildLineBox(new THREE.BoxGeometry(180, 70, 250), '#41dd9c',[-20, 34, -10], [0,0,0] ,'', 'frameBox','yes');
    loadModel('f0.obj',onProgress).then(group =>{
        let head =  new THREE.Group();
        for(let k=0; k < 2; k++) {
            let f = group.clone();
            if(k == 0) {
                f.scale.set(0.002225,0.002,0.002);
                f.position.x = -105;
            }else {
                f.scale.set(0.00205,0.0022,0.002);
                f.position.x = -99;
            }
            f.position.y = 36.2 - 8.6*k;
            f.position.z = -104.8;
            frame13.add(f);
        }
        frameModel.add(head);
        frameSetColor(group);
        for(let i = 0; i < 4; i++){
            let f = group.clone();
            if(i<2){
                f.position.x = -105;
                f.position.y = 46.5;
                f.position.z = -5.3+11 + 7.68*i;
                f.scale.set(0.00222,0.002,0.002);
                frame.add(f);  
            }else if(i==3){
                f.position.x = 4.7-105;
                f.position.y = -7.5+46.5;
                f.position.z = -1.3+11;
                f.scale.set(0.00212,0.002,0.002);
                frame.add(f);  
            }else{
                f.position.x = 11-105;
                f.position.y = 2.1+46.5;
                f.position.z = -3+11;
                f.scale.set(0.001965,0.0009,0.0009);
                frame.add(f);  
            }
            f.name = 'f';
        }
    }) 
    loadModel('f2.obj',onProgress).then(group =>{
        frameSetColor(group);
        for(let i = 0; i <= 18; i++){
            let f = group.clone();
            f.position.x = -85.2 + 8.13*i;
            f.position.y = 43.5;
            f.position.z = 9.2;
            frame.add(f);  
            f.name = 'f';
        }
        frame.position.z = 50;
    })
    loadModel('f3.obj',onProgress).then(group =>{
        frameSetColor(group);
        let f = group.clone(); 
        f.position.y = 43.7;
        f.position.z = 10.4;
        f.position.x = -94.8 ;
        f.name = 'f';
        frame.add(f);  
        f.scale.set(0.0021,0.0022,0.0022);
        frame.position.z = 50;
    })
    loadModel('f4.obj',onProgress).then(group =>{
        frameSetColor(group);
        let f = group.clone(); 
        f.position.y = 43.4;
        f.position.z = 10.2;
        f.position.x = 61.9 ;
        frame.add(f);  
        f.scale.set(0.0021,0.0022,0.0022);
        f.name = 'f';
        frame.position.z = 50;
    })
    loadModel('a.obj',onProgress).then(group =>{
        let left = new THREE.Group();
        let head = new THREE.Group();
        let behind = new THREE.Group();
            //长方形柱子
        for(let i = 0; i < 28; i++){
            if(i == 0) {
                let a = group.clone();
                a.scale.set(0.0018,0.00174,0.0016);
                a.position.z = 22;
                a.rotation.x = 0.34;
                left.add(a); 
            }else if(i == 1){
                let a = group.clone();
                a.scale.set(0.0018,0.0008,0.0016);
                a.position.z = 35*i;
                a.position.y = 36.2;
                a.rotation.x = 1.57;
                left.add(a); 
            }else if(i< 10&& i> 1) {
                let a = group.clone();
                a.scale.set(0.002,0.0016+Math.floor(i/2)*0.00008,0.002);
                a.position.z = 21.52 + 7.71*i;
                left.add(a); 
            }else{
                let a = group.clone();
                a.position.z = 21.48 + 7.68*i;
                left.add(a); 
            }
        }
        left.position.z = -150;
        left.position.x = -100.8;
        frameModel.add(left);
        let right = left.clone()
        right.position.z = -150;
        right.position.x = 65;
        frameModel.add(right);
        
        for(let j=0; j < 10; j++) {
            let a = group.clone();
            a.position.x = -90 + 16.2*j
            a.position.z = -112;
            a.scale.set(0.002,0.00165,0.002);
            behind.add(a);
        }
        frameModel.add(behind);
        
        for(let j=0; j < 12; j++) {
            if(j !=1&&j!=2) {
                let a = group.clone();
                a.position.x = 65 - 15*j
                a.position.z = 85;
                head.add(a);
            };
        }
        frameModel.add(head);
        
        for(let k=0; k < 2; k++) {
            let a = group.clone();
            a.position.x = 64;
            a.position.y = 35.5;
            a.position.z = -112  +3.8*k;
            a.rotation.z = 1.57;
            a.scale.set(0.001,0.0073,0.001);
            head.add(a);
        }
        frameModel.add(head);
        
        for(let k=0; k < 10; k++) {
            let a = group.clone();
            a.position.x = 56.5 - 16.2*k;
            a.position.y = 36;
            a.position.z = -112;
            a.rotation.x = 1.57;
            a.scale.set(0.0005,0.00032,0.002);
            head.add(a);
        }
        frameModel.add(head);
    });
    loadModel('b.obj',onProgress).then(group =>{
        let left = new THREE.Group();
        for(let i = 0; i < 17; i++){
            let b = group.clone();
            b.position.x = 12.5;
            b.position.y = 42.8;
            b.position.z = 100 + 7.68*i;
            left.add(b);
        }
        left.position.z = -146.2;
        left.position.x = -110.8;
        frameModel.add(left);

        let right = left.clone()
        right.position.z = -146.2;
        right.position.x = 55;
        frameModel.add(right);
    });
    loadModel('c.obj',onProgress).then(group =>{
        let left = new THREE.Group();
        for(let i = 0; i < 3; i++){
            let c = group.clone();
            c.position.x = -44.5;
            c.position.y = 44.6 - 1.8*i;
            c.position.z = 87.5 - 15.3*i;
            left.add(c);
            frameModel.add(left);
        }
        left.position.z = -146.5;
        left.position.x = -55;

        let right = left.clone()
        right.position.z = -146.5;
        right.position.x = 110.6;
        frameModel.add(right);
    })
    loadModel('d.obj',onProgress).then(group =>{
        let head = new THREE.Group();
        for(let i = 0; i < 20; i++){
            let d = group.clone();
            d.position.x = 59.5 - 8*i;
            d.position.y = 31.65;
            d.position.z = -104;
            d.scale.set(0.002,0.0022,0.002);
            frame13.add(d);
        }
        for(let i = 0; i < 21; i++){
            let d = group.clone();
            if(i< 10) {
                d.position.x = 62.5 - 8*i;
                d.position.y = 30.8;
                d.position.z = -104;
                d.rotation.z = -0.78;
            }else{
                d.position.x = 64 - 8*i;
                d.position.y = 32.2;
                d.position.z = -104;
                d.rotation.z = 0.68;
            }
            d.scale.set(0.002,0.00278,0.002);
            frame13.add(d);
        }
        for(let i = 0; i < 42; i++){
            let d = group.clone();
            if(i<20){
                d.scale.set(0.002,0.0012,0.002);
                d.position.y = 35.2;
                d.position.z = -102.5;
                d.rotation.x = 1.57;
                d.position.x = 59.3 - 7.89*i;
            }else {
                d.scale.set(0.002,0.0015,0.002);
                d.position.y = 38;
                d.position.z = -97.8;
                d.rotation.x = 0.55;
                d.position.x = 225 - 7.89*i;
            }
            head.add(d);
        }
        frameModel.add(head);
    })
    loadModel('e.obj',onProgress).then(group =>{
        let behind = new THREE.Group();
        for(let i = 0; i< 2; i++){
            let e = group.clone();
            e.position.x = 54.5-22*i;
            e.scale.set(0.0028,0.002, 0.002);
            behind.add(e);
        }
        for(let i = 0; i< 8; i++){
            let e = group.clone();
            e.position.x = 13.5-15.1*i;
            e.scale.set(0.0019,0.002, 0.002);
            behind.add(e);
        }
        behind.position.y = 45;
        behind.position.z = 85;
        frameModel.add(behind);
    })  
}
function addModel(scene) {
    scene.add(sky.clone());
    createdModle(scene, 'zn_scene','#00F6FF');
    createdModle(scene, 'zn_road','#333',1);
    createdModle(scene, 'zn_river','rgb(23,91,128)',1);
    frameModel.name = 'frameM';
    frameModel.add(note1Group);
    scene.add(frameModel);  
    
}