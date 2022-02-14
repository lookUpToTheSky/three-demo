$(window).load(function () {
    // 判断是否是业务平台iframe连接
    let params = location.search.slice(1)
    if(params.split('=')[0] === 'user') {
        $('.header').hide()
        // $('.pageLeft').hide()
        // $('.pageRight').hide()
        $('.theme').hide()
        $('.pageLeft').css('background', '#12223B')
        $('.pageRight').css('background', '#12223B')
        $('.pilelist').css('background', '#12223B')
    }
    $('.container').show()
    Date.prototype.Format = timeFormat;
    // const baseURL = 'http://192.168.11.151:8088';
    // const websocketURL = 'ws://192.168.11.151:8088/websocket/';
    const baseURL = 'https://yun.kexsci.com/yun/api';
    const websocketURL = 'wss://yun.kexsci.com/wss/websocket/';
    //全局ajax获取后台数据
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
    let scene, camera, renderer, controls, sky, DirectLight;
    let composer, outLineColor, SMAAShader, bloomPass;
    let echartDom, echart, fullEchartDom, fullEchart;
    let towerArr = [], lineArr = [];
    var clock = new THREE.Clock();
    let pmId = 22; //项目Id
    let gpIdArr = []; //区域code
    let gpId = null; //桩Id
    let MonitoringType = [{
            name: '拉力',
            unit: 'kN'
        }, {
            name: '应力',
            unit: 'kN'
        }, {
            name: '压力',
            unit: 'kN'
        },
        {
            name: '倾斜',
            unit: 'mm'
        }, {
            name: '沉降',
            unit: 'mm'
        }, {
            name: '应力',
            unit: 'kN'
        }, {
            name: '倾斜',
            unit: 'mm'
        }
    ]; //监测类型配置
    let currentType = {
        name: '拉力',
        unit: 'KN'
    }; //当前监测类型配置
    let currentSensor = null;
    let currentSt = null;
    let endBox = null;
    let animationId = null;
    let flashTimer = null;
    let webSocket = null;
    let webSocketData = [];
    let themeNum = 1;
    let getEchartsTimer = null;
    let scaling = window.innerHeight / 1041;
    let linkSensorLine = new THREE.Group();
    let container = document.getElementsByClassName('container')[0];
    let sensorPillar = [{
            id: 1,
            name: '11#桩',
            pos: {
                x: -105,
                y: 0,
                z: 57
            },
            group: new THREE.Group(),
            sensor: [{
                    ptId: 430,
                    state: 1
                },{
                    ptId: 431,
                    state: 1
                }, {
                    ptId: 432,
                    state: 1
                },
                {
                    ptId: 433,
                    state: 1
                }, {
                    ptId: 434,
                    state: 1
                },
                {
                    ptId: 435,
                    state: 1
                }, {
                    ptId: 436,
                    state: 1
                },
                [{
                    ptId: 522,
                    state: 1,
                    name: '锚索计'
                },{
                    ptId: 519,
                    state: 1,
                    name: '土压力'
                },{
                    ptId: 437,
                    state: 1
                }], [{
                    ptId: 523,
                    state: 1,
                    name: '锚索计'
                }, {
                    ptId: 520,
                    state: 1,
                    name: '土压力'
                },{
                    ptId: 438,
                    state: 2
                }], [{
                    ptId: 524,
                    state: 1,
                    name: '锚索计'
                }, {
                    ptId: 521,
                    state: 1,
                    name: '土压力'
                },{
                    ptId: 439,
                    state: 1
                }], {
                    ptId: 440,
                    state: 1
                }, {
                    ptId: 441,
                    state: 1
                }, {
                    ptId: 442,
                    state: 1
                }, {
                    ptId: 443,
                    state: 1
                }
            ]
        },
        {
            id: 2,
            name: '27#桩',
            pos: {
                x: -39.8,
                y: 0,
                z: 90.8
            },
            group: new THREE.Group(),
            sensor: [{
                    ptId: 198,
                    state: 1
                },
                {
                    ptId: 199,
                    state: 1
                }, {
                    ptId: 200,
                    state: 1
                },
                {
                    ptId: 201,
                    state: 1
                }, {
                    ptId: 202,
                    state: 1
                },
                {
                    ptId: 203,
                    state: 1
                }, {
                    ptId: 204,
                    state: 1
                }, [{
                    ptId: 212,
                    state: 1,
                    name: '锚索计'
                }, {
                    ptId: 516,
                    state: 1,
                    name: '土压力'
                },{
                    ptId: 205,
                    state: 1
                }],[{
                    ptId: 213,
                    state: 1,
                    name: '锚索计'
                }, {
                    ptId: 517,
                    state: 1,
                    name: '土压力'
                }, {
                    ptId: 206,
                    state: 1
                }], [{
                    ptId: 214,
                    state: 1,
                    name: '锚索计'
                }, {
                    ptId: 518,
                    state: 1,
                    name: '土压力'
                },{
                    ptId: 207,
                    state: 1
                }], {
                    ptId: 208,
                    state: 1
                }, {
                    ptId: 209,
                    state: 1
                }, {
                    ptId: 210,
                    state: 1
                }, {
                    ptId: 211,
                    state: 1
                }
            ]
        },
        {
            id: 3,
            name: '47#桩',
            pos: {
                x: 52.5,
                y: 0,
                z: 64.8
            },
            group: new THREE.Group(),
            sensor: [{
                    ptId: 188,
                    state: 1
                },
                {
                    ptId: 189,
                    state: 1
                }, {
                    ptId: 190,
                    state: 1
                },
                {
                    ptId: 191,
                    state: 1
                }, {
                    ptId: 192,
                    state: 1
                },
                {
                    ptId: 193,
                    state: 1
                },{
                    ptId: 194,
                    state: 1
                },[{
                    ptId: 178,
                    state: 1,
                    name: '锚索计'
                }, {
                    ptId: 195,
                    state: 1,
                    name: '土压力'
                }, {
                    ptId: 181,
                    state: 1
                }], [{
                    ptId: 179,
                    state: 1,
                    name: '锚索计'
                }, {
                    ptId: 196,
                    state: 1,
                    name: '土压力'
                },{
                    ptId: 182,
                    state: 1
                }], [{
                    ptId: 180,
                    state: 1,
                    name: '锚索计'
                }, {
                    ptId: 197,
                    state: 1,
                    name: '土压力'
                }, {
                    ptId: 183,
                    state: 1
                }], {
                    ptId: 184,
                    state: 1
                }, {
                    ptId: 185,
                    state: 1
                }, {
                    ptId: 186,
                    state: 1
                }, {
                    ptId: 187,
                    state: 1
                }
            ]
        },
        {
            id: 4,
            name: '107#桩',
            pos: {
                x: -76.3,
                y: 0,
                z: 37
            },
            group: new THREE.Group(),
            sensor: [{
                    ptId: 502,
                    state: 1
                }, {
                    ptId: 503,
                    state: 1
                }, {
                    ptId: 504,
                    state: 1
                }, {
                    ptId: 505,
                    state: 1
                }, {
                    ptId: 506,
                    state: 1
                }, {
                    ptId: 507,
                    state: 1
                }, {
                    ptId: 508,
                    state: 1
                },
                {
                    ptId: 509,
                    state: 1
                }, {
                    ptId: 510,
                    state: 1
                }, {
                    ptId: 511,
                    state: 1
                }, {
                    ptId: 512,
                    state: 1
                }, {
                    ptId: 513,
                    state: 1
                }, {
                    ptId: 514,
                    state: 1
                }, {
                    ptId: 515,
                    state: 1
                }
            ]
        },
        {
            id: 5,
            name: '125#桩',
            pos: {
                x: -34.5,
                y: 0,
                z: 64.5
            },
            group: new THREE.Group(),
            sensor: [{
                    ptId: 488,
                    state: 1
                }, {
                    ptId: 489,
                    state: 1
                }, {
                    ptId: 490,
                    state: 1
                }, {
                    ptId: 491,
                    state: 1
                }, {
                    ptId: 492,
                    state: 1
                }, {
                    ptId: 493,
                    state: 1
                }, {
                    ptId: 494,
                    state: 1
                },
                {
                    ptId: 495,
                    state: 1
                }, {
                    ptId: 496,
                    state: 1
                }, {
                    ptId: 497,
                    state: 1
                }, {
                    ptId: 498,
                    state: 1
                }, {
                    ptId: 499,
                    state: 1
                }, {
                    ptId: 500,
                    state: 1
                }, {
                    ptId: 501,
                    state: 1
                }
            ]
        },
        {
            id: 6,
            name: '158#桩',
            pos: {
                x: 34.2,
                y: 0,
                z: 45
            },
            group: new THREE.Group(),
            sensor: [{
                    ptId: 474,
                    state: 1
                }, {
                    ptId: 475,
                    state: 1
                }, {
                    ptId: 476,
                    state: 1
                }, {
                    ptId: 477,
                    state: 1
                }, {
                    ptId: 478,
                    state: 1
                }, {
                    ptId: 479,
                    state: 1
                }, {
                    ptId: 480,
                    state: 1
                },
                {
                    ptId: 481,
                    state: 1
                }, {
                    ptId: 482,
                    state: 1
                }, {
                    ptId: 483,
                    state: 1
                }, {
                    ptId: 484,
                    state: 1
                }, {
                    ptId: 485,
                    state: 1
                }, {
                    ptId: 486,
                    state: 1
                }, {
                    ptId: 487,
                    state: 1
                }
            ]
        },
        {
            id: 7,
            name: '冷却塔冠梁',
            pos: {
                x: 0,
                y: 24.8,
                z: 0
            },
            group: new THREE.Group(),
            sensor: [{
                    ptId: 450,
                    state: 1,
                    pos: {
                        x: -55,
                        y: 1,
                        z: 86.5
                    }
                }, {
                    ptId: 451,
                    state: 1,
                    pos: {
                        x: -30,
                        y: 1,
                        z: 90.8
                    }
                }, {
                    ptId: 452,
                    state: 1,
                    pos: {
                        x: 0,
                        y: 1,
                        z: 90
                    }
                }, {
                    ptId: 453,
                    state: 1,
                    pos: {
                        x: 30,
                        y: 1,
                        z: 80
                    }
                }, {
                    ptId: 454,
                    state: 1,
                    pos: {
                        x: 52.5,
                        y: 1,
                        z: 64.8
                    }
                }, {
                    ptId: 455,
                    state: 1,
                    pos: {
                        x: 68.5,
                        y: 1,
                        z: 48.5
                    }
                },
                {
                    ptId: 444,
                    state: 1,
                    pos: {
                        x: -55,
                        y: -1,
                        z: 89
                    }
                }, {
                    ptId: 445,
                    state: 1,
                    pos: {
                        x: -30,
                        y: -1,
                        z: 93
                    }
                }, {
                    ptId: 446,
                    state: 1,
                    pos: {
                        x: 0,
                        y: -1,
                        z: 92
                    }
                }, {
                    ptId: 447,
                    state: 1,
                    pos: {
                        x: 30,
                        y: -1,
                        z: 82
                    }
                }, {
                    ptId: 448,
                    state: 1,
                    pos: {
                        x: 52.5,
                        y: -1,
                        z: 67
                    }
                }, {
                    ptId: 449,
                    state: 1,
                    pos: {
                        x: 68.5,
                        y: -1,
                        z: 50
                    }
                }
            ]
        },
        {
            id: 8,
            name: '锚索冠梁',
            pos: {
                x: 0,
                y: 21.3,
                z: 0
            },
            group: new THREE.Group(),
            sensor: []
        },
        {
            id: 9,
            name: '锚索冠梁',
            pos: {
                x: 0,
                y: 15.5,
                z: 0
            },
            group: new THREE.Group(),
            sensor: []
        },
        {
            id: 10,
            name: '锚索冠梁',
            pos: {
                x: 0,
                y: 9.5,
                z: 0
            },
            group: new THREE.Group(),
            sensor: []
        },
    ];
    let chartOption = {
        title: {
            text: '',
            top: 30,
            x: 'center',
            textStyle: {
                color: '#38b0de',
                fontSize: 18,
                fontWeight: 'normal'
            }
        },
        color: ['#52FFFF', '#FFAE00', '#e36159', '#00ff7f', '#bc1717',
            '#0088cc', '#ff7f00', '#db7093', '#b87333',
            '#ff2400', '#215e21', '#ff00ff', '#99cc32',
            '#23238e', '#5340cc'
        ],
        tooltip: {
            trigger: "axis",
            backgroundColor: 'rgba(31,59,107,0.9)',
            axisPointer: {
                type: 'cross',
                label: {
                    color: '#000',
                    backgroundColor: '#eee',
                }
            }
        },
        legend: {
            data: [],
            x: 'center',
            y: 0,
            type: 'scroll',
            pageIconColor: 'orange',
            pageIconSize: 20,
            pageTextStyle: {
                color: '#fff'
            },
            left: 15,
            textStyle: {
                fontSize: 14,
                padding: 3,
                backgroundColor: '#41dd9c',
                color: "#fff" //刻度颜色
            }
        },
        toolbox: {
            iconStyle: {
                borderColor: '#e36159',
            },
            // feature: {
            //     saveAsImage: {}
            // },
            top: 40,
            right: 20
        },
        dataZoom: [{
            type: 'inside',
            realtime: true,
            start: 0,
            end: 100,
        }, {
            height: 20,
            type: 'slider',
            realtime: true,
            start: 0,
            end: 100,
        }],
        grid: {
            top: 80,
            left: 55,
            right: 50,
            bottom: 60
        },
        xAxis: {
            //x轴
            type: "category",
            name: '时间',
            data: [],
            boundaryGap: false,
            axisLabel: {
                rotate: 30,
                textStyle: {
                    color: "#fff" //刻度颜色
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(82,255,255,1)'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(82,255,255,.16)'
                }
            }
        },
        yAxis: {
            //y轴
            type: "value",
            name: "",
            // max: function (value) {
            //     return value.max * 5;
            // },
            // scale: true,
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: "#fff", //刻度颜色
                    fontSize: 12 //刻度大小
                }
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(82,255,255,1)'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(82,255,255,.16)'
                }
            }
        },
        series: []
    } //ecahrt图表对象
    init();
    //入口
    function init() {
        initScene();
        initCamera();
        initRenderer();
        setSkyBox('sky');
        initLight();
        initControl();
        composerPass();
        // helper();
        buildPillar();
        render();
        bulidPlane();
        getNowTime();
        loadWether();
        initPage();
        getGroup(); //获取监测类型
        loadObj({
            fileName: 'tower2',
            shadow: true,
            scale:[0.05, 0.05, 0.05],
        });
        loadObj({
            fileName: 'walls',
            opacity: 0.2,
            scale:[0.05, 0.05, 0.05],
        });
        loadObj({
            fileName: 'road',
            scale:[0.05, 0.05, 0.05],
        });
        loadObj({
            fileName: 'headPiller',
            scale:[0.05, 0.05, 0.05],
            bgColor: 'orange',
            lineShow: true
        });
        loadObj({
            fileName: 'setionPiller',
            scale:[0.05, 0.05, 0.05],
            bgColor: '#60ACEB',
            lineShow: true
        });
        loadObj({
            fileName: 'green',
            scale:[0.05, 0.05, 0.05],
            bgColor: 'green',
            setMaterial: true
        });
        resizeWindow();
    }
    //场景初始化
    function initScene() {
        scene = new THREE.Scene();
    }
    //相机初始化
    function initCamera() {
        camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 1, 30000);
        camera.position.set(100, 160, 600);
    }
    //渲染器初始化
    function initRenderer() {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.sortObjects = true;
        container.appendChild(renderer.domElement);
        new THREE.onEvent(scene, camera); //事件初始化
    }
    //场景灯光初始化
    function initLight() {
        var AmbientLight = new THREE.AmbientLight(0x888888, 1.4); //环境光
        scene.add(AmbientLight);
        DirectLight = new THREE.DirectionalLight(0xffffff); //平行光
        DirectLight.position.set(0, 300, 300);
        DirectLight.shadow.camera.near = 2; //产生阴影的最近距离
        DirectLight.shadow.camera.far = 1000; //产生阴影的最远距离
        DirectLight.shadow.camera.left = -500; //产生阴影距离位置的最左边位置
        DirectLight.shadow.camera.right = 500; //最右边
        DirectLight.shadow.camera.top = 500; //最上边
        DirectLight.shadow.camera.bottom = -500; //最下面
        DirectLight.castShadow = true; //开启castShadow生成动态的投影

        DirectLight.shadow.mapSize.width = 1024;
        DirectLight.shadow.mapSize.height = 1024;
        DirectLight.name = 'DirLight';
        scene.add(DirectLight);
    }
    //鼠标控制初始化
    function initControl() {
        controls = new THREE.OrbitControls(camera, renderer.domElement);  
        controls.minDistance = 50; //设置相机移动距离
        controls.maxDistance = 500;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI/2;
        // 使动画循环使用时阻尼或自转 意思是否有惯性
        controls.enableDamping = true;
        //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        controls.dampingFactor = 0.9;
    }
    //特效处理通道
    function composerPass() {
        composer = new THREE.EffectComposer(renderer); //通道组合器
        var renderPass = new THREE.RenderPass(scene, camera); //渲染一个新环境
        // 外边框outLine
        outLineColor = new THREE.OutlinePass(
            new THREE.Vector2(container.clientWidth, container.clientHeight), scene, camera);
        outLineColor.visibleEdgeColor.set('orange');
        outLineColor.edgeStrength = 8;

        //场景发光
        bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight))
        bloomPass.exposure = 1;
        bloomPass.threshold = 0.5;
        bloomPass.strength = 1;
        bloomPass.radius = 0.5;
        bloomPass.enabled = false;

        //抗锯齿SMAAShader
        SMAAShader = new THREE.SMAAPass(container.clientWidth, container.clientHeight);
        SMAAShader.renderToScreen = true;

        composer.addPass(renderPass);
        composer.addPass(bloomPass);
        composer.addPass(outLineColor);
        composer.addPass(SMAAShader);

    }
    //辅助线
    function helper() {
        var axes = new THREE.AxesHelper(3000);
        scene.add(axes);
        var polarGridHelper = new THREE.PolarGridHelper(500, 16, 8, 64, '#41dd9c', '#3299cc');
        polarGridHelper.position.y = -120;
        scene.add(polarGridHelper);
        var tweenA = thingAnimate(polarGridHelper.rotation, {
            x: 0,
            y: 3.14,
            z: 0
        }, 5000);
        var tweenB = thingAnimate(polarGridHelper.rotation, {
            x: 0,
            y: 3.14,
            z: 0
        }, 5000);
        tweenA.chain(tweenB);
        tweenB.chain(tweenA);
    }

    function render() {
        var delta = clock.getDelta();
        controls.update(delta);
        TWEEN.update();
        composer.render(delta);
        requestAnimationFrame(render);
        composer.autoClear = false;
    }
    //加载fbx文件模型
    function loadFbx(filename, s={x:1, y:1, z:1}, p={x:0, y:0, z:0}, r={x: 0, y:0, z: 0}) {
        var FbxLaod = new THREE.FBXLoader();
        FbxLaod.load(`../source/${filename}`, obj => {
            obj.scale.set(s.x, s.y, s.z);
            obj.position.set(p.x, p.y, p.z);
            obj.rotation.set(r.x, r.y, r.z);
            scene.add(obj);
        })
    }
    //动画
    function thingAnimate(start, end, time, num) {
        let tween = new TWEEN.Tween(start)
            .to(end, time)
            .yoyo(true)
            .repeat(num || 0)
            .start('+800')
        tween.start();
        return tween;
    }
    //加载obj文件
    function loadObj({fileName, scale, bgColor, position, rotation, shadow, opacity, objEvent, lineShow, setMaterial}) {
        let s = scale || [1,1,1];
        let p = position || [0,0,0];
        let r = rotation || [0,0,0];
        let mtlLoader = new THREE.MTLLoader();
        let loader = new THREE.OBJLoader();
        mtlLoader.load('../source/' + fileName + '.mtl', (materials) => {
            materials.preload();
            loader.setMaterials(materials);
            loader.load('../source/' + fileName + '.obj', function (obj) {
                obj.name = fileName;
                if(fileName !== "walls") {
                    towerArr.push(obj);
                    obj.renderOrder = -2;
                };
                obj.children.forEach(child => {
                    child.material.flatShading = THREE.SmoothShading;
                    if(child.type === 'Mesh' && !!shadow) {
                        child.receiveShadow = true;
                        child.castShadow = true; 
                    }
                    if(fileName === 'road') child.material.side = THREE.DoubleSide;
                    if(!!opacity) {
                        child.material.opacity = opacity;
                        child.material.transparent = true;
                    } 
                    if(!!bgColor)  {
                        child.material.color.set(bgColor)
                    }
                    if(!!setMaterial) {
                        let te = new THREE.TextureLoader().load('../img/grass.png');
                        te.wrapS = THREE.RepeatWrapping;
                        te.wrapT = THREE.RepeatWrapping;
                        te.repeat.set(50,50);
                        child.material = new THREE.MeshBasicMaterial({map: te});
                    }
                    if(!!lineShow) {
                        var edges = new THREE.EdgesGeometry(child.geometry);
                        var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
                            color: bgColor,
                        }));
                        line.name = 'lines_'+ fileName;
                        line.scale.set(s[0], s[1], s[2]);
                        line.position.set(p[0], p[1], p[2]);
                        line.rotation.set(r[0], r[1], r[2]);
                        line.visible = fileName == 'setionPiller'? true : false;
                        lineArr.push(line);
                        scene.add(line); 
                    }
                }) 
                obj.scale.set(s[0], s[1], s[2]);
                obj.position.set(p[0], p[1], p[2]);
                obj.rotation.set(r[0], r[1], r[2]);
                scene.add(obj);
                if( fileName == "tower2") {
                    $('#loading').fadeOut();
                    thingAnimate(camera.position, {
                        x: 0,
                        y: 20,
                        z: 180
                    }, 2000);
                    $('.theme').css('opacity', '1');
                }
                if(objEvent) {
                    // 点击事件
                    obj.on('click', () => {
                        obj.children.forEach(child => {
                            child.material.opacity = child.material.opacity == 1 ? 0.1 : 1;
                            child.material.transparent = true;
                        })
                        if (outLineColor.selectedObjects.length > 0) return;
                        outLineColor.selectedObjects = [obj];
                        setTimeout(() => {
                            outLineColor.selectedObjects = [];
                        }, 1000)
                    })
                }
                
            })
        })
    }
    //传感器信息牌
    function sensorInfo() {
        $('.sensorInfo').css('display', 'block');
        //获取到窗口的一半高度和一半宽度
        let halfWidth = container.clientWidth / 2;
        let halfHeight = container.clientHeight / 2;
        let point = new THREE.Vector3();
        if (currentSensor == null) return;
        scene.updateMatrixWorld(true);
        endBox.getWorldPosition(point);
        let pos = new THREE.Vector3(point.x, point.y, point.z);
        let vector = pos.project(camera);
        $(".sensorInfo").css({
            left: vector.x * halfWidth + halfWidth - $('.sensorInfo').width() / 2,
            top: -vector.y * halfHeight + halfHeight - $('.sensorInfo').height() + 5
        })
        animationId = requestAnimationFrame(sensorInfo);
    }
    //创建连线
    function linkLine() {
        let geometry1 = new THREE.SphereGeometry(2, 64, 64);
        let boxMaterial = new THREE.MeshBasicMaterial({
            color: 'red',
            depthTest: false,
            transparent: true,
            opacity: 0.3
        });
        let startBox = new THREE.Mesh(geometry1, boxMaterial);
        startBox.position.set(currentSensor.position.x, currentSensor.position.y, currentSensor.position.z);
        endBox = new THREE.Mesh(geometry1, boxMaterial);
        let texture = new THREE.Texture(new CanvasView().draw({
            type: 4,
            borderColor: ['#60ACEB', 'orange']
        }))
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 1);
        let tweenA = thingAnimate(texture.offset, {
            x: -1
        }, 1000);
        let tweenB = thingAnimate(texture.offset, {
            x: -1
        }, 1000);
        tweenA.chain(tweenB);
        tweenB.chain(tweenA);
        let material = new THREE.MeshBasicMaterial({
            map: texture,
            depthTest: false
        });
        let point = {};
        point.x = currentSensor.position.clone().x;
        point.y = currentSensor.position.clone().y;
        point.z = currentSensor.position.clone().z;
        endBox.position.set(point.x - 30, point.y + 20, point.z);
        let path = new THREE.CatmullRomCurve3([
            startBox.position,
            new THREE.Vector3(point.x - 10, point.y, point.z),
            new THREE.Vector3(point.x - 20, point.y + 10, point.z),
            new THREE.Vector3(point.x - 30, point.y + 15, point.z),
            endBox.position
        ]);
        //通过多段曲线路径创建生成管道，CurvePath：管道路径
        var tube = new THREE.TubeGeometry(path, 100, 0.3, 10, false);
        var tubeMesh = new THREE.Mesh(tube, material);
        scene.remove(linkSensorLine);
        linkSensorLine.add(startBox);
        linkSensorLine.add(endBox);
        linkSensorLine.add(tubeMesh);
        currentSensor.parent.add(linkSensorLine);
    }
    //传感器和桩
    function buildPillar() {
        let posArr = [20, 17, 14, 11, 8, 5, 2, 20, 17, 14, 11, 8, 5, 2]; //位置数组2-20米
        let material = new THREE.MeshPhongMaterial({
            color: "#41ddac",
            side: THREE.DoubleSide,
        });
        let sensorModel = new THREE.SphereGeometry(1.5, 64, 64);
        let sensorMesh = new THREE.Mesh(sensorModel, new THREE.MeshBasicMaterial({
            color: "#444",
        }));
        let color = '#fff';
        let sensor = null;
        sensorMesh.scale.set(0.001, 0.001, 0.001);
        // 传感器
        for (let j = 0; j < sensorPillar.length; j++) {
            for (let i = 0; i < sensorPillar[j].sensor.length; i++) {
                if (Array.isArray(sensorPillar[j].sensor[i])) {
                    sensorPillar[j].sensor[i].forEach((item, index) => {
                        sensor = item;
                        sensorM();
                    })
                } else {
                    sensor = sensorPillar[j].sensor[i];
                    sensorM();
                }

                function sensorM() {
                    let s = sensorMesh.clone();
                    sensorPillar[j].group.add(s);
                    s.name = 'sensor_' + sensor.ptId;
                    if (sensorPillar[j].name == '冷却塔冠梁') {
                        let pos = sensorPillar[j].sensor[i].pos;
                        s.position.set(pos.x, pos.y, pos.z);
                        sensor.mesh = s;
                    } else {
                        if (i < sensorPillar[j].sensor.length / 2) {
                            s.position.y = posArr[i] * 2.3 - 23;
                            s.position.z = -4;
                            sensor.pos = {
                                x: 0,
                                y: s.position.y,
                                z: 0
                            };
                            sensor.mesh = s;
                        } else {
                            s.position.y = posArr[i] * 2.3 - 23;
                            s.position.z = 4;
                            sensor.pos = {
                                x: 0,
                                y: s.position.y,
                                z: 0
                            };
                            sensor.mesh = s;
                        }
                    }

                    //传感器hover事件
                    s.on('hover', () => {
                        if (currentSensor == s) return;
                        //清除上一次传感器
                        let senName = s.name.substring(7, s.name.length);
                        document.body.style.cursor = 'pointer';
                        sensorPillar.forEach((element) => {
                            element.sensor.forEach(function (item) {
                                if (Array.isArray(item)) {
                                    item.forEach((child) => {
                                        showSensorInfo(child);
                                    })
                                } else {
                                    showSensorInfo(item);
                                }
                                //采集点信息牌
                                function showSensorInfo(sensor) {
                                    if (sensor.ptId == senName) {
                                        $('#info').html('');
                                        new CanvasView('#info').draw({
                                            type: 1,
                                            width: 220,
                                            height: 120,
                                            title: {
                                                content: '采集点信息',
                                                size: 'normal 18px Microsoft Yahei',
                                                color: '#6DA8DB',
                                                top: 10
                                            },
                                            borderColor: ['#6DA8DB', '#6DA8DB'],
                                            background: '#000',
                                            fontSize: 'normal 16px Microsoft Yahei',
                                            text: {
                                                content: `名称：${sensor.senName}/n状态：${sensor.status}/n数据：${sensor.value?sensor.value+currentType.unit: '无数据'}`,
                                                size: 'normal 16px Microsoft Yahei',
                                                color: 'orange',
                                                align: 'left',
                                                top: 6,
                                                left: 25
                                            }
                                        })
                                    }
                                }

                            });
                        });
                        let len = linkSensorLine.children.length;
                        for (let i = 0; i < len; i++) {
                            if (linkSensorLine.children[0].type === 'Mesh') {
                                linkSensorLine.children[0].geometry.dispose();
                                linkSensorLine.children[0].material.dispose();
                            }
                            linkSensorLine.remove(linkSensorLine.children[0]);
                        }
                        currentSensor = s;
                        cancelAnimationFrame(animationId);
                        linkLine();
                        sensorInfo();
                    }, () => {
                        document.body.style.cursor = '';
                    })
                }
            }

        }
        //支护桩
        let pillar = new THREE.CylinderGeometry(2, 2, 45, 5);
        let pillarMesh = new THREE.Mesh(pillar, material);
        sensorPillar.forEach((item, i) => {
            let model = pillarMesh.clone();
            model.geometry = pillarMesh.geometry.clone();
            model.name = 'pillar';
            model.castShadow = true;
            if(i < 6) item.group.add(model);
            item.group.position.set(item.pos.x, item.pos.y-9.5, item.pos.z);
            item.group.scale.set(0.001, 0.001,0.001);
            scene.add(item.group);
            if(i < 6) {
                var edges = new THREE.EdgesGeometry(model.geometry);
                var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
                    color: '#60ACEB'
                }));
                line.name = 'line';
                line.visible = false;
                item.group.add(line);
            }
            if(i == 6) pillarText(item.name, item.group, { x: 20, y: 17,z: 80});
            if (i < 6) {
                pillarText(item.name, item.group);
                //点击事件
                item.group.on('click', function () {
                    let pillarY = item.group.position.y < 0 ? 60 : -9.5;
                    thingAnimate(item.group.position, {
                        x: item.group.x,
                        y: pillarY,
                        z: item.group.z
                    }, 1000)
                })
                //hover事件
                item.group.on('hover', () => {
                    outLineColor.selectedObjects = [model];
                    document.body.style.cursor = 'pointer';
                }, () => {
                    outLineColor.selectedObjects = [];
                    document.body.style.cursor = '';
                })
            }
        })
    }
    //桩名
    function pillarText(text, group, pos) {
        let size = text.length >= 5? 22: 15;
        var texture = new THREE.Texture(new CanvasView().draw({
            type: 3,
            text: {
                content: text,
                color: '#eee',
                size: `normal ${38-size}px Microsoft Yahei`,
            },
            background: "rgba(0,0,0,.8)",
            borderColor: ['red'],
            lineWidth: '6'
        }));
        texture.needsUpdate = true;
        var material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        panel = new THREE.Sprite(material);
        let p = pos || {x: 0, y: 38, z: 0};
        panel.scale.set(size, size, size);
        panel.position.set(p.x, p.y - 3, p.z);
        thingAnimate(panel.position, p , 600, 'Infinity');
        panel.renderOrder = 5;
        group.add(panel);
    }
    //地板
    function bulidPlane() {
        let texture = new THREE.TextureLoader().load('../img/lightCircle.png');
        let plane = new THREE.PlaneGeometry(800, 800);
        let material = new THREE.MeshPhongMaterial({
            emissive: '#60ACEB',
            map: texture,
            side: THREE.BackSide,
            transparent: true
        });
        let mesh = new THREE.Mesh(plane, material);
        mesh.name = 'circle';
        mesh.rotation.x = 1.57;
        mesh.position.y = -30;
        mesh.visible = false;
        scene.add(mesh);
        var tweenA = thingAnimate(mesh.rotation, {
            x: 1.57,
            y: 0,
            z: 2 * Math.PI
        }, 50000);
        var tweenB = thingAnimate(mesh.rotation, {
            x: 1.57,
            y: 0,
            z: 2 * Math.PI
        }, 50000);
        tweenA.chain(tweenB);
        tweenB.chain(tweenA);

        let plane2 = new THREE.PlaneGeometry(1000, 800);
        let grass = new THREE.TextureLoader().load('../img/plane.png');
        grass.wrapS = THREE.RepeatWrapping;
        grass.wrapT = THREE.RepeatWrapping;
        grass.repeat.set(1,1);
        let material2 = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: grass
        });
        let mesh2 = new THREE.Mesh(plane2, material2);
        mesh2.name = "landPlane";
        mesh2.position.y = -35;
        mesh2.rotation.x = 1.57;
        // mesh2.receiveShadow = true; 
        scene.add(mesh2);

    }
    //传感器闪灯
    function sensorFlash() {
        let flashColor = "#fff";
        let flag = false;
        if (flashTimer !== null) {
            clearInterval(flashTimer);
            flashTimer = null;
        }
        flashTimer = setInterval(function () {
            flashLight();
        }, 800);
        function flashLight() {
            flag = !flag;
            sensorPillar.forEach((element, i) => {
                element.sensor.forEach((child, j) => {
                    if (Array.isArray(child)) {
                        child.forEach(child2 => {
                            showCurrentSensor(child2);
                        })
                    } else {
                        showCurrentSensor(child);
                    }

                    function showCurrentSensor(current) {
                        webSocketData.forEach(item2 => {
                            if (current.ptId == item2.ptId) {
                                current.state = item2.ptStatus * 1;
                                if (current.mesh.name.substring(0, 6) == 'sensor') {
                                    switch (current.state) {
                                        case 0:
                                            flashColor = '#666';
                                            current.status = '禁用';
                                            current.senName = item2.senName;
                                            current.value = item2.deflection;
                                            break;
                                        case 1:
                                            flashColor = '#32cd32';
                                            current.status = '在线';
                                            current.senName = item2.senName;
                                            current.value = item2.deflection;
                                            break;
                                        case 2:
                                            flashColor = '#fff';
                                            current.status = '离线';
                                            current.senName = item2.senName;
                                            current.value = item2.deflection;
                                            break;
                                    }
                                    if (flag) {
                                        current.mesh.scale.set(1, 1, 1);
                                        current.mesh.material = new THREE.MeshBasicMaterial({
                                            color: flashColor,
                                            transparent: false,
                                        });
                                    } else {
                                        current.mesh.scale.set(2, 2, 2);
                                        current.mesh.material = new THREE.MeshBasicMaterial({
                                            transparent: true,
                                            opacity: 0
                                        });
                                    }
                                }
                            }
                        })
                    }
                });
            });
        }
    }
    //动态时间加载
    function getNowTime() {
        setInterval(function () {
            let day, week, houer;
            let date = new Date().getTime();
            houer = new Date(date).Format('HH:mm:ss');
            var weeksArr = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
            week = new Date().getDay();
            week = weeksArr[week];
            day = new Date(date).Format('yyyy-MM-dd');
            $('.header #houer').text(houer);
            $('.header #week').text(week);
            $('.header #day').text(day);
        }, 1000)
        //时间格式化函数
    }
    function timeFormat(fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "H+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    //实时加载天气
    function loadWether() {
        $.ajax({
            type: "GET",
            url: "https://free-api.heweather.com/s6/weather/now",
            async: true,
            data: {
                "location": "CN101250101",
                "key": "eb55782b84b14e439393e2042f90cf75"
            },
            success: function (data) {
                if (data.HeWeather6[0].now != undefined) {
                    let wether = data.HeWeather6[0].now;
                    $('#cond_txt').text(wether.cond_txt);
                    $('#wind_sc').text(wether.wind_sc + '级');
                    $('#wind_spd').text(wether.wind_spd + 'km/h');
                    $('#pcpn').text(wether.pcpn);
                    $('#tmp').text(wether.tmp + '℃');
                    $('#hum').text(wether.hum + '%');
                }

            }
        });
        setInterval(function (params) {
            loadWether();
        }, 10 * 60 * 1000)
    }
    //天空盒
    function setSkyBox(type) {
        if (sky != undefined) scene.remove(sky);
        var loader = new THREE.TextureLoader();
        var skyBox = new THREE.BoxGeometry(20000, 20000, 20000);
        var rootPath = '../img/';
        var imgNameArr = ['_posx', '_negx', '_posy', '_negy', '_posz', '_negz'];
        var format = '.jpg';
        var materialArr = [];
        for (let i = 0; i < imgNameArr.length; i++) {
            materialArr.push(new THREE.MeshBasicMaterial({
                map: loader.load(rootPath + type + imgNameArr[i] + format),
                side: THREE.BackSide
            }));
        }
        sky = new THREE.Mesh(skyBox, materialArr);
        sky.name = 'skyBox';
        scene.add(sky);
    }
    //屏幕适配
    function initPage() {
        if (scaling < 1.5 && scaling > 0.5) {
            // $('.header').css('transform','scale('+scaling+')');
            $('.pageLeft').css({
                'transform': 'scale(' + scaling + ')'
            });
            $('.pageRight').css({
                'transform': 'scale(' + scaling + ')'
            });
        }
    }
    //监测项目群组
    function getGroup() {
        getData("get", "/echart/selectProjectStructure", {
            pmId
        }).then((res) => {
            if (res.data.length > 0) {
                gpIdArr = res.data;
                gpId = gpIdArr[0].gpId;
                frameControl(gpIdArr);
                allDataMonitoring();
                showCurrentPile();
                getWarnMsg(gpId, 5);
                dataCollection(gpId);
                openWebSocket();
            }
        });
    }
    //项目监测详情
    function allDataMonitoring() {
        getData("get", "/echart/getGPCountByPmId/" + pmId, {}).then((res) => {
            let ulHtml = '';
            $('#allGpNum').text(res.data);
        });
        getData("get", "/echart/getPointCountByPmId", {
            pmId
        }).then((res) => {
            let sensorNum = res.data.allCount;
            $('#allSensorNum').text(sensorNum);
        });
        getData("get", "/echart/getPointCountByPmId", {
            gpId
        }).then((res) => {
            let sensorNum = res.data.allCount;
            $('#sensorNum').text(sensorNum);
        });
        getData("get", "/echart/getDatasCountByPmId/" + pmId, {}).then((res) => {
            let dataNum = res.data;
            if (res.data > 10000) {
                dataNum = Math.round(res.data / 10000) + '万';
            }
            $('#allDataNum').text(dataNum);
        });
        getData("get", "/echart/getWarnCountByPmId/" + pmId, {}).then((res) => {
            let warnNum = res.data;
            $('#allWarnNum').text(warnNum);
        });
    }
    //预警信息 
    function getWarnMsg(gpId, size) {
        let warnDom1 = $('.warnMsg1 p');
        let warnDom2 = $('.warnMsg1 table');
        getData("get", "/echart/selectLatelyWarnInfo/" + gpId + '/' + size, {}).then((res) => {
            if (res.data == null || res.data.length == 0) {
                warnDom1.text("无预警信息");
                warnDom1.css('display', 'block');
                warnDom2.css('display', 'none');
            } else {
                let html = `<tr>
                            <th>采集点名称</th>SpriteMaterial
                            <th>预警等级</th>
                            <th>发送时间</th>
                            <th>恢复时间</th> 
                        </tr>`;
                res.data.forEach((item, i) => {
                    html += `<tr><td>${item.ptName.substr(0,8)}</td>
                            <td>${item.grade}级</td>
                            <td>${item.eventIntime.substr(0,10)} ${item.eventIntime.substr(11,8)}</td>
                            <td>${item.eventRecovertime != undefined?item.eventRecovertime.substr(0,10)+' '+item.eventRecovertime.substr(11,8):'未恢复'}</td></tr>`
                })
                warnDom1.css('display', 'none');
                warnDom2.css('display', 'block');
                warnDom2.html(html);
            };
        })
    }
    //数据采集频率
    function dataCollection(gpId) {
        let unit = currentType.unit;
        getData("get", "/echart/get24HoursMaxMinSpeed/" + gpId, {}).then((res) => {
            if (res.data.data != null) {
                let h24MaxValue = res.data.data.h24MaxValue + unit;
                let h24Speed = res.data.data.h24Speed + unit;
                $('#h24MaxValue').text(h24MaxValue);
                $('#h24Speed').text(h24Speed);
            } else {
                $('#h24MaxValue').text(res.data.message);
                $('#h24Speed').text(res.data.message);
            }
        });
        getData("get", "/echart/get15DayMaxMinSpeed/" + gpId, {}).then((res) => {
            if (res.data.data != null) {
                let d15MaxValue = res.data.data.d15MaxValue + unit;
                let d15Speed = res.data.data.d15Speed + unit;
                $('#d15MaxValue').text(d15MaxValue);
                $('#d15Speed').text(d15Speed);
            } else {
                $('#d15MaxValue').text(res.data.message);
                $('#d15Speed').text(res.data.message);
            }
        });
    }
    //控制按钮生成和控制
    function frameControl(pileList) {
        let parent = $('.pilelist ul')[0];
        let ulHtml = '';
        pileList.forEach((element, i) => {
            if (element.gpId == gpId) {
                ulHtml += `<li class="selected" data-index="${i}" value=${element.gpId}>${element.gpName}</li>`;
            } else {
                ulHtml += `<li data-index="${i}" value=${element.gpId}>${element.gpName}</li>`;
            }
        });
        $('.pilelist>ul').html(ulHtml);
        $('.echartTitle').text(currentType.name + '-时间曲线图');
        $('.fullEchartTitle').text(currentType.name + '-时间曲线图');
        parent.addEventListener('mousedown', (e) => {
            if (e.target.getAttribute('value') * 1 === gpId || !e.target.dataset.index) return false;
            e.target.classList.remove('key-up');
            e.target.classList.add('key-down'); 
            e.stopPropagation();
        }, false);
        parent.addEventListener('mouseup', changeSpType, false);
    }
    // 切换
    function changeSpType(e) {
        //点击当前桁架不重加载
        if (e.target.getAttribute('value') * 1 === gpId || !e.target.dataset.index) {
            return false;
        }
        let index = e.target.dataset.index * 1;
        currentType = MonitoringType[index];
        $('.echartTitle').text(currentType.name + '-时间曲线图');
        $('.fullEchartTitle').text(currentType.name + '-时间曲线图');
        $('#d15MaxValue').text('···');
        $('#d15Speed').text('···');
        $('#h24MaxValue').text('···');
        $('#h24Speed').text('···');
        gpId = e.target.getAttribute('value') * 1;
        let liNode = $('.pilelist ul .selected')[0];
        liNode.classList.remove('selected');
        e.target.classList.add('selected');
        setTimeout(() => {
            e.target.classList.remove('key-down');
            e.target.classList.add('key-up');
        }, 100)
        dataCollection(gpId);
        getWarnMsg(gpId, 5);
        initData(linkSensorLine);
        showCurrentPile();
        if(webSocket) {
            webSocket.close(1000);
        } else {
            openWebSocket();
        }
        e.stopPropagation();
    }
    //切换桁架更新数据
    function initData(linkSensorLine) {
        removeSensorInfo();
        webSocketData = [];
        //隐藏传感器
        sensorPillar.forEach((element, i) => {
            element.sensor.forEach((child, j) => {
                if (Array.isArray(element.sensor[j])) {
                    child.forEach((child2) => {
                        child2.mesh.scale.set(0.001, 0.001, 0.001);
                    })
                } else {
                    child.mesh.scale.set(0.001, 0.001, 0.001);
                }
            })
        })
        $('.echartWarpper > p').css('display', 'none');
        $('.fullEchartWarpper > p').css('display', 'none');
        thingAnimate(controls.target, new THREE.Vector3(0,0,0), 2000);
        thingAnimate(camera.position, {x: 0, y: 20, z: 180}, 2000);
        camera.lookAt({x:0,y:0,z:0});
        //清除图表数据
        chartOption.xAxis.data = [];
        chartOption.legend.data = [];
        chartOption.series = [];
        echart.setOption({}, true);
        fullEchart.setOption({}, true);
    }
    //显示与隐藏
    function showCurrentPile() {
        let stList = [];
        let ptIdArr = [];
        let activeSt = [];
        let btn = [];
        let show = false;
        let currentStName = '';
        sensorPillar.forEach(child => {
            child.group.scale.set(0.001, 0.001, 0.001);
        })
        lineArr.forEach( item => { item.visible = false; });
        //查找场景中btn,并移除
        scene.traverse((child) => {
            if (child.name.substr(child.name.length - 3, child.name.length) == 'btn') {
                btn.push({parent: child.parent,child});
            };
        })
        btn.forEach((item) => {
            item.child.off('click');
            item.child.off('hover');
            item.child.geometry.dispose();
            item.child.material.dispose();
            item.parent.remove(item.child);
        })
        //显示当前桩，隐藏上次桩
        gpIdArr.forEach((item) => {
            if (item.gpId === gpId) {
                stList = item.kxSiteList;
                currentStName = item.kxSiteList[0].stName;
            }
        })
        //默认显示第一组监测点
        stList[0].kxPoints.forEach((element) => {
            ptIdArr.push(element.ptId);
        })
        stList.forEach(item => {
            if (item.gpId == 47 || item.gpId == 48) show = true;
            sensorPillar.forEach(child => {
                if (item.stName.substr(0, 5) == child.name) {
                    lineArr.forEach( item => {
                        if(item.name == 'lines_headPiller'){
                            item.visible = true;
                        }
                    })
                    child.group.scale.set(1, 1, 1);
                    return;
                }
                if (item.stName.replace(/[^0-9]/ig, '') * 1 === child.name.replace(/[^0-9]/ig, '') * 1 &&
                    item.stName.replace(/[^0-9]/ig, '') * 1 !== 0) {
                    let pos = {
                        x: -10,
                        y: 15,
                        z: 20
                    };
                    if (item.stName.indexOf('外') > -1) {
                        pos = {
                            x: -10,
                            y: 15,
                            z: 20
                        };
                    } else if (item.stName.indexOf('内') > -1) {
                        pos = {
                            x: 10,
                            y: 15,
                            z: -20
                        };
                    }
                    child.group.scale.set(1, 1, 1);
                    if (item.stName.replace(/[^0-9]/ig, '') * 1) {
                        buildBtnModel(item, currentStName, child.group, pos, activeSt);
                    }
                }
                if (show && child.name == '锚索冠梁') {
                    child.group.scale.set(1, 1, 1);
                    lineArr.forEach( item => {
                        if(item.name == 'lines_setionPiller'){
                            item.visible = true;
                        }
                    })
                };
            })
        })
        getEchartData(ptIdArr, currentStName);
    }
    //模型菜单
    function buildBtnModel(stM, currentStName, group, pos, activeSt) {
        var canvas = new CanvasView().draw({
            type: 7,
            width: 256,
            height: 128,
            text: {
                content: stM.stName,
                top: 54,
                left: 22,
                color: '#eee',
                size: 'normal 25px Microsoft Yahei',
            },
            borderColor: ['#eee', '#eee'],
            lineWidth: '10'
        });
        var canvas2 = new CanvasView().draw({
            type: 7,
            width: 256,
            height: 128,
            text: {
                content: stM.stName,
                top: 54,
                left: 22,
                color: 'orange',
                size: 'normal 25px Microsoft Yahei',
            },
            background: '#000',
            borderColor: ['#38b0de', 'green'],
            lineWidth: '10'
        });
        var texture = new THREE.CanvasTexture(canvas);
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            depthTest: false,
            transparent: true
        });
        panel = new THREE.Mesh(new THREE.PlaneGeometry(20, 10, 1), material);
        let p = panel.clone();
        p.material = panel.material.clone();
        if (stM.stName == currentStName) {
            p.material.map = new THREE.CanvasTexture(canvas2);
            currentSt = p.name.substring(0, p.name.length - 3) * 1;
            activeSt.push({
                node: p,
                canvas
            });
        }
        p.position.set(pos.x, pos.y, pos.z);
        p.rotateY(1);
        p.name = stM.stId + 'btn';
        group.add(p);
        p.on('hover', () => {
            thingAnimate(p.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2
            }, 500);
            document.body.style.cursor = 'pointer';
        }, () => {
            thingAnimate(p.scale, {
                x: 1,
                y: 1,
                z: 1
            }, 500);
            document.body.style.cursor = '';
        })
        p.on('click', () => {
            let count = false;
            let ptIdArr = [];
            if (Object.prototype.isPrototypeOf(activeSt) && Object.keys(activeSt).length !== 0) {
                activeSt.forEach(item => {
                    item.node.material.map = new THREE.CanvasTexture(item.canvas);
                })
            }
            p.parent.traverse( child => {
                if(child.name === 'pillar') {
                    let pos = child.getWorldPosition(new THREE.Vector3());
                    let TweenA = thingAnimate(controls.target, new THREE.Vector3(pos.x,pos.y,pos.z), 2000);
                    let count = camera.position.z - pos.z > 0? 1: -1;
                    let TweenB = thingAnimate(camera.position, {
                        x: pos.x + count*30,
                        y: pos.y + 20,
                        z: pos.z + count*40
                    }, 2000);
                    camera.lookAt({x:pos.x,y:pos.y,z:pos.z});
                }
            })
            p.material.map = new THREE.CanvasTexture(canvas2);
            activeSt.forEach(item => {
                if (item.node.name == p.name) {
                    count = true;
                }
            })
            if (!count) activeSt.push({
                node: p,
                canvas
            });
            let lastSt = currentSt * 1;
            currentSt = p.name.substring(0, p.name.length - 3) * 1;
            if (lastSt == currentSt) return;
            //默认显示第一组监测点
            stM.kxPoints.forEach((element) => {
                ptIdArr.push(element.ptId);
            })
            //清除图表数据
            chartOption.xAxis.data = [];
            chartOption.legend.data = [];
            chartOption.series = [];
            echart.setOption({}, true);
            fullEchart.setOption({}, true);
            getEchartData(ptIdArr, stM.stName);
        })

    }
    //获取图表数据
    function getEchartData(ptIdArr, echartTitle) {
        echartDom = document.getElementById('dataEchart');
        echart = echarts.init(echartDom);
        fullEchartDom = document.getElementById('fullDataEchart');
        fullEchart = echarts.init(fullEchartDom);
        //窗口变化改变图表大小
        let date = new Date().getTime();
        let lastDate = date - 24 * 60 * 60 * 1000;
        let startTime = new Date(lastDate).Format('yyyy-MM-dd HH:mm:ss');
        let endTime = new Date(date).Format('yyyy-MM-dd HH:mm:ss');
        let ptIds = ptIdArr.join(',');
        getData("get", "/echart/selectPointDatasByPtId", {
            ptIds,
            startTime,
            endTime
        }).then(async (res) => {
            let offLine = res.data.every( item => !!item.offLineTime)
            if(offLine) {
                endTime = res.data[0].offLineTime.maxTime;
                startTime = new Date(endTime).getTime() - 24 * 60 * 60 * 1000;
                startTime = new Date(startTime).Format('yyyy-MM-dd HH:mm:ss');
                const { data } = await getData("get", "/echart/selectPointDatasByPtId", { ptIds, startTime, endTime})
                getEchart(data);
            }else{
                getEchart(res.data);
            }
            // if (res.data.length > 0) {
            //     getEchart(res.data);
            // } else {
            //     $('.echartWarpper > p').css('display', 'block');
            //     $('.fullEchartWarpper > p').css('display', 'block');
            // }
        });

        function getEchart(sensorList) {
            let len = sensorList.length;
            chartOption.title.text = echartTitle;
            chartOption.xAxis.data = [];
            //x刻度
            for (let i = 0; i < len; i++) {
                if (!!sensorList[i].x) {
                    sensorList[i].x.forEach((item) => {
                        chartOption.xAxis.data.push(item.substr(-11))
                    })
                    break;
                }
            }
            chartOption.series = [];
            chartOption.legend.data = [];
            //y
            for (let i = 0; i < len; i++) {
                let lineColor = `rgba(${Math.ceil(Math.random()*225)},${Math.ceil(Math.random()*225)},${Math.ceil(Math.random()*225)})`;
                let seriesRoot = {
                    name: " ",
                    type: "line",
                    showSymbol: false,
                    data: []
                };
                let legendRoot = {
                    name: " ",
                    textStyle: {
                        backgroundColor: ''
                    }
                };
                chartOption
                chartOption.series[i] = seriesRoot;
                chartOption.legend.data.push(legendRoot);
                chartOption.legend.data[i].name = sensorList[i].ptName;
                chartOption.color.push(lineColor);
                chartOption.legend.data[i].textStyle.backgroundColor = chartOption.color[i];
                chartOption.yAxis.name = currentType.name + `(${currentType.unit})`
                chartOption.series[i].name = sensorList[i].ptName;
                chartOption.series[i].data = sensorList[i].y;
            }
            echart.setOption(chartOption, true);
            fullEchart.setOption(chartOption, true);
        }
    }
    //webSocketData实时数据推送
    function openWebSocket() {
        if (!webSocket) {
            // 如果网站是 https 则对应 wss
            // 如果网站是 http 则对应 ws 即可
            // webSocket = new WebSocket('ws://118.25.55.220:9001/websocket/'+ gpId);
            webSocket = new WebSocket(websocketURL + pmId);
            // 建立 websocket 连接成功触发事件
            webSocket.onopen = function () {
                // console.log("websoket服务器连接成功...");
                sensorFlash();
            };
            // 接收服务端数据时触发事件
            webSocket.onmessage = function (evt) {
                var res = JSON.parse(evt.data);
                let count = -1;
                let stId = [];
                webSocketData.forEach((item, i) => {
                    if (item.ptId == res.ptId) count = i;
                })
                if (count !== -1) {
                    webSocketData[count] = res;
                    count = -1;
                } else {
                    if (res.gpId == gpId) webSocketData.push(res);
                }
            };
            //关闭服务器时触发
            webSocket.onclose = function (evt) {
                console.log('webSocket关闭成功');
                webSocket = null;
                if (evt.code == 1000) {
                    openWebSocket();
                }
            }
        }
    }
    // 页面事件 
    $('.sensorInfo .close').eq(0).on('click', removeSensorInfo);
    $(".fullScreen").on('click', openFullScreen);
    $(".closeFullScreen").on('click', closeFullScreen);
    $('.screenMask').on('click', closeFullScreen);
    $('.fullEchartWarpper').on('click', (event) => {
        event.stopPropagation();
    });
    //点击更换模式
    $(".theme").on('click', (e) => {
        //点击当前桁架不重加载
        if (e.target.getAttribute('value') * 1 == themeNum) {
            return false;
        }
        switch (e.target.getAttribute('value') * 1) {
            case 1:
                selectedTheme('sea');
                break;
            case 2:
                selectedTheme('dark');
                break;
        }
        //更换场景模式
        function selectedTheme(type) {
            setSkyBox(type);
            themeNum = e.target.getAttribute('value') * 1;
            $(".theme li.selected")[0].classList.remove('selected');
            e.target.classList.add('selected');
            if (type == 'dark' || type == 'star') {//
                thingAnimate(camera.position, {
                    x: 0,
                    y: 60,
                    z: 250
                }, 2000);
                bloomPass.enabled = true;
                DirectLight.intensity = 0.1;
                // scene.getObjectByName('landPlane').visible = true;
                // scene.getObjectByName('mountain').visible = false;
                scene.getObjectByName('circle').visible = true;
                sensorPillar.forEach(item => {
                    item.group.children.forEach((child, i) => {
                        if (child.type == "LineSegments") {
                            child.visible = true;
                        }
                        if (child.name == 'pillar') {
                            child.material.transparent = true;
                            child.material.opacity = 0;
                        }
                    });
                });
                towerArr.forEach( item => {
                    item.traverse(child => {
                        if(child.type === "Mesh") {
                            child.material.opacity = 0.5;
                            child.material.transparent = true;
                        }
                    })
                })
            } else {
                thingAnimate(camera.position, {
                    x: 0,
                    y: 60,
                    z: 180
                }, 2000);
                bloomPass.enabled = false;
                scene.getObjectByName('skyBox').material.forEach(item => {
                    item.color.set('#fff');
                })
                towerArr.forEach( item => {
                    item.traverse(child => {
                        if(child.type === "Mesh") {
                            child.material.opacity = 1;
                            child.material.transparent = false;
                        }
                    })
                })
                DirectLight.intensity = 1;
                // scene.getObjectByName('landPlane').visible = false;
                // scene.getObjectByName('mountain').visible = true;
                scene.getObjectByName('circle').visible = false;
                sensorPillar.forEach(item => {
                    item.group.children.forEach((child, i) => {
                        if (child.type == "LineSegments") {
                            child.visible = false;
                        }
                        if (child.name == 'pillar') {
                            child.material.transparent = false;
                            child.material.opacity = 1;
                        }
                    });
                })
            }
        }
        e.stopPropagation();
    })
    //移除传感器信息便签
    function removeSensorInfo() {
        //清除上一次传感器
        let len = linkSensorLine.children.length;
        $('.sensorInfo').css('display', 'none');
        for (let i = 0; i < len; i++) {
            if (linkSensorLine.children[0].type === 'Mesh') {
                linkSensorLine.children[0].geometry.dispose();
                linkSensorLine.children[0].material.dispose();
            }
            linkSensorLine.remove(linkSensorLine.children[0]);
        }
        currentSensor = null;
        cancelAnimationFrame(animationId);
    }
    //打开曲线图大屏
    function openFullScreen() {
        $('.screenMask').css('display', 'block');
        $('.fullEchartWarpper').css('display', 'block');
        setTimeout(() => {
            $('.fullEchartWarpper').css('width', '80vw');
        }, 100)
    }
    //关闭曲线图大屏
    function closeFullScreen() {
        $('.fullEchartWarpper').css('width', '100px');
        setTimeout(() => {
            $('.fullEchartWarpper').css('display', 'none');
            $('.screenMask').css('display', 'none');
        }, 500)
    }
    //屏幕宽度变化初始化数据
    function resizeWindow() {
        $(window).resize(function () {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            composer.setSize(container.clientWidth, container.clientHeight);
            scaling = window.innerHeight / 1041;
            new THREE.onEvent(scene, camera);
            initPage();
            if (fullEchart != undefined) fullEchart.resize();
        })
    }
})