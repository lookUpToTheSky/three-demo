$(window).load(() =>{
    let scene,camera,renderer,controls,DirectLight,AmbientLight, SpotLight;
    let composer,outLineColor,SMAAShader,bloomPass;
    let echartDom, echart;
    var clock = new THREE.Clock();
    let scene01 = new THREE.Group();
    let thing = new THREE.Group();
    let ptGroup = new THREE.Group();
    let hkPointModule = new THREE.Group();
    let hkPlaneMesh, map1,map2, map3;
    let loader = new THREE.TextureLoader();
    let container = $('.container-fluid')[0];
    let currentSensor = null;
    let pmId = 25;
    let gpIdArr = [];//所有群组
    let gpId = null;
    let ptIdArr = [];//所有监测点
    let webSocket = null;
    let webSocketData = [];
    let animationId = null;
    let sensorFlashTimer = null;
    let gltfLaodCount = 0, houseArr = [];
    let changeViewTimer = null;
    let MonitoringType = [{name:'应力', unit: 'kN'},{name:'轴力', unit: 'kN'},{name:'压力', unit: 'Pa'},
    {name:'轴力', unit: 'Pa'},{name:'应力', unit: 'kN'},{name:'轴力', unit: 'kN'},{name:'水位', unit: 'mm'}];//监测类型配置
    let currentType = MonitoringType[0];
    //换撑带轴力监测共18个点
    let sensor1 = [{name:'ZL-HCD-01',pos:{x:94, y:78, z:0}},{name:'ZL-HCD-02', pos:{x:70, y:156, z:0}},
        {name:'ZL-HCD-03',pos:{x:15, y:169, z:0}},{name:'ZL-HCD-04',pos:{x:-62, y:145, z:0}},
        {name:'ZL-HCD-05',pos:{x:-139, y:123, z:0}},{name:'ZL-HCD-06',pos:{x:-215, y:98, z:0}},
        {name:'ZL-HCD-07',pos:{x:-292, y:74, z:0}},{name:'ZL-HCD-08',pos:{x:-374, y:53, z:0}},
        {name:'ZL-HCD-09',pos:{x:-450, y:31, z:0}},{name:'ZL-HCD-10',pos:{x:-495, y:-36, z:0}},
        {name:'ZL-HCD-11',pos:{x:-490, y:-120, z:0}},{name:'ZL-HCD-12',pos:{x:-486, y:-203, z:0}},
        {name:'ZL-HCD-13',pos:{x:-452, y:-258, z:0}},{name:'ZL-HCD-14',pos:{x:-372, y:-258, z:0}},
        {name:'ZL-HCD-15',pos:{x:-291, y:-258, z:0}},{name:'ZL-HCD-16',pos:{x:-212, y:-258, z:0}},
        {name:'ZL-HCD-17',pos:{x:-132, y:-258, z:0}},{name:'ZL-HCD-18',pos:{x:-52, y:-258, z:0}},
    ]
    //冠梁位移监测点18个点(使用原有测点)
    let sensor2 = [{name:'WY-GL-01',pos:{x:142, y:-1, z:50}},{name:'WY-GL-02',pos:{x:110, y:100, z:50}},
        {name:'WY-GL-03',pos:{x:86, y:177, z:50}},{name:'WY-GL-04',pos:{x:-19, y:185, z:50}},
        {name:'WY-GL-05',pos:{x:-109, y:156, z:50}},{name:'WY-GL-06',pos:{x:-186, y:134, z:50}},
        {name:'WY-GL-07',pos:{x:-264, y:109, z:50}},{name:'WY-GL-08',pos:{x:-335, y:86, z:50}},
        {name:'WY-GL-09',pos:{x:-411, y:64, z:50}},{name:'WY-GL-10',pos:{x:-488, y:43, z:50}},
        {name:'WY-GL-11',pos:{x:-515, y:-52, z:50}},{name:'WY-GL-12',pos:{x:-510, y:-155, z:50}},
        {name:'WY-GL-13',pos:{x:-440, y:-280, z:50}},{name:'WY-GL-14',pos:{x:-393, y:-280, z:50}},
        {name:'WY-GL-15',pos:{x:-311, y:-280, z:50}},{name:'WY-GL-16',pos:{x:-234, y:-280, z:50}},
        {name:'WY-GL-17',pos:{x:-152, y:-280, z:50}},{name:'WY-GL-18',pos:{x:-72, y:-280, z:50}},
    ]
    //地下室外墙土压力监测共18个点
    let sensor3 = [{name:'TYL-01',pos:{x:115, y:85, z:0}},{name:'TYL-02',pos:{x:90, y:162, z:0}},
        {name:'TYL-03',pos:{x:6, y:191, z:0}},{name:'TYL-04',pos:{x:-71, y:166, z:0}},
        {name:'TYL-05',pos:{x:-148, y:144, z:0}},{name:'TYL-06',pos:{x:-223, y:122, z:0}},
        {name:'TYL-07',pos:{x:-300, y:98, z:0}},{name:'TYL-08',pos:{x:-381, y:72, z:0}},
        {name:'TYL-09',pos:{x:-458, y:51, z:0}},{name:'TYL-10',pos:{x:-516, y:-35, z:0}},
        {name:'TYL-11',pos:{x:-515, y:-120, z:0}},{name:'TYL-12',pos:{x:-510, y:-205, z:0}},
        {name:'TYL-13',pos:{x:-458, y:-280, z:0}},{name:'TYL-14',pos:{x:-374, y:-280, z:0}},
        {name:'TYL-15',pos:{x:-293, y:-280, z:0}},{name:'TYL-16',pos:{x:-214, y:-280, z:0}},
        {name:'TYL-17',pos:{x:-132, y:-280, z:0}},{name:'TYL-18',pos:{x:-52, y:-280, z:0}},
    ]
    //深部位移监测共7个点(使用原有测点)
    let sensor4 = [{name:'SBWY-01',pos:{x:120, y:63, z:0}},{name:'SBWY-02',pos:{x:74, y:206, z:0}},
        {name:'SBWY-03',pos:{x:-54, y:172, z:0}},{name:'SBWY-04',pos:{x:-208, y:126, z:0}},
        {name:'SBWY-05',pos:{x:-360, y:80, z:0}},{name:'SBWY-06',pos:{x:-513, y:-132, z:0}},
        {name:'SBWY-07',pos:{x:-11, y:-278, z:0}}
    ]
    //地下水位监测共4个点(使用原有测点)
    let sensor5 = [{name:'DXSW-01',pos:{x:129, y:36, z:50}},{name:'DXSW-02',pos:{x:-90, y:160, z:50}},
        {name:'DXSW-03',pos:{x:-515, y:-108, z:50}},{name:'DXSW-04',pos:{x:-36, y:-280, z:50}}
    ]
    
    //立柱变形监测共7个点
    let sensor6 = [{name:'WY-LZ-01',pos:{x:18, y:95, z:50}},{name:'WY-LZ-02',pos:{x:-98, y:-67, z:50}},
        {name:'WY-LZ-03',pos:{x:-143, y:-73, z:50}},{name:'WY-LZ-04',pos:{x:-250, y:-121, z:50}},
        {name:'WY-LZ-05',pos:{x:-294, y:-127, z:50}},{name:'WY-LZ-06',pos:{x:-427, y:-32, z:50}},
        {name:'WY-LZ-07',pos:{x:-419, y:-187, z:50}}
    ]
    //支撑应变监测，每个截面布设4个监测点。内支撑为两层，每层9个截面共18个截面
    let sensor7 = [{name:'ZL-ZC-01-01',pos:{x:34, y:88, z:50}},{name:'ZL-ZC-01-02',pos:{x:-96, y:-90, z:50}},
        {name:'ZL-ZC-01-03',pos:{x:-140, y:-97, z:50}},{name:'ZL-ZC-01-04',pos:{x:-202, y:70, z:50}},
        {name:'ZL-ZC-01-05',pos:{x:-194, y:-224, z:50}},{name:'ZL-ZC-01-06',pos:{x:-255, y:-87, z:50}},
        {name:'ZL-ZC-01-07',pos:{x:-298, y:-93, z:50}},{name:'ZL-ZC-01-08',pos:{x:-445, y:-59, z:50}},
        {name:'ZL-ZC-01-09',pos:{x:-439, y:-169, z:50}},
        {name:'ZL-ZC-02-01',pos:{x:34, y:88, z:25}},{name:'ZL-ZC-02-02',pos:{x:-96, y:-90, z:25}},
        {name:'ZL-ZC-02-03',pos:{x:-140, y:-97, z:25}},{name:'ZL-ZC-02-04',pos:{x:-202, y:70, z:25}},
        {name:'ZL-ZC-02-05',pos:{x:-194, y:-224, z:25}},{name:'ZL-ZC-02-06',pos:{x:-255, y:-87, z:25}},
        {name:'ZL-ZC-02-07',pos:{x:-298, y:-93, z:25}},{name:'ZL-ZC-02-08',pos:{x:-445, y:-59, z:25}},
        {name:'ZL-ZC-02-09',pos:{x:-439, y:-169, z:25}}
    ]
    //车道临时支撑轴力监测共8个点
    let sensor8 = [{name:'ZL-LSZC-01',pos:{x:-5, y:154, z:0}},{name:'ZL-LSZC-02',pos:{x:-45, y:141, z:0}},
        {name:'ZL-LSZC-03',pos:{x:-82, y:127, z:0}},{name:'ZL-LSZC-04',pos:{x:-130, y:100, z:0}},
        {name:'ZL-LSZC-05',pos:{x:-221, y:81, z:0}},{name:'ZL-LSZC-06',pos:{x:-287, y:61, z:0}},
        {name:'ZL-LSZC-07',pos:{x:-350, y:40, z:0}},{name:'ZL-LSZC-08',pos:{x:-410, y:20, z:0}}
    ];
    //主体结构变形监测,从地下室负二层顶板起，每3层布设8个点，共16个点
    let sensor9 = [{name:'WY-ZT-01-01',pos:{x:120, y:-185, z:50}},{name:'WY-ZT-01-02',pos:{x:28, y:138, z:50}},
        {name:'WY-ZT-01-03',pos:{x:25, y:-216, z:50}},{name:'WY-ZT-01-04',pos:{x:-144, y:-42, z:50}},
        {name:'WY-ZT-01-05',pos:{x:-175, y:70, z:50}},{name:'WY-ZT-01-06',pos:{x:-298, y:-200, z:50}},
        {name:'WY-ZT-01-07',pos:{x:-298, y:-100, z:50}},{name:'WY-ZT-01-08',pos:{x:-340, y:-25, z:50}},

        {name:'WY-ZT-02-01',pos:{x:120, y:-185, z:0}},{name:'WY-ZT-02-02',pos:{x:28, y:138, z:0}},
        {name:'WY-ZT-02-03',pos:{x:25, y:-216, z:0}},{name:'WY-ZT-02-04',pos:{x:-144, y:-42, z:0}},
        {name:'WY-ZT-02-05',pos:{x:-175, y:70, z:0}},{name:'WY-ZT-02-06',pos:{x:-298, y:-200, z:0}},
        {name:'WY-ZT-02-07',pos:{x:-298, y:-100, z:0}},{name:'WY-ZT-02-08',pos:{x:-340, y:-25, z:0}}, 
    ]
    //主体板结构应力监测共18个点
    let sensor10 = [{name:'YL-ZT-01',pos:{x:40, y:38, z:0}},{name:'YL-ZT-02',pos:{x:27, y:80, z:0}},
        {name:'YL-ZT-03',pos:{x:20, y:117, z:0}},{name:'YL-ZT-04',pos:{x:-22, y:16, z:0}},
        {name:'YL-ZT-05',pos:{x:-35, y:58, z:0}},{name:'YL-ZT-06',pos:{x:-45, y:95, z:0}},
        {name:'YL-ZT-07',pos:{x:-90, y:-5, z:0}},{name:'YL-ZT-08',pos:{x:-100, y:35, z:0}},
        {name:'YL-ZT-09',pos:{x:-113, y:72, z:0}},{name:'YL-ZT-10',pos:{x:-422, y:-203, z:0}},
        {name:'YL-ZT-11',pos:{x:-423, y:-122, z:0}},{name:'YL-ZT-12',pos:{x:-422, y:-30, z:0}},
        {name:'YL-ZT-13',pos:{x:-460, y:-204, z:0}},{name:'YL-ZT-14',pos:{x:-460, y:-120, z:0}},
        {name:'YL-ZT-15',pos:{x:-460, y:-28, z:0}},{name:'YL-ZT-16',pos:{x:-485, y:-204, z:0}},
        {name:'YL-ZT-17',pos:{x:-485, y:-120, z:0}},{name:'YL-ZT-18',pos:{x:-485, y:-28, z:0}},
    ]
    sensorArr = [sensor1,sensor2,sensor3,sensor4,sensor5,sensor6,sensor7,sensor8,sensor9,sensor10];
    let chartOption = {
        title: {
            text: '',
            top:  10,
            x: 'center',
            textStyle: {
                color: '#38b0de',
                fontSize: 18,
                fontWeight: 'normal'
            }
        },
        color: ['#FFAE00','#52FFFF','#e36159','#00ff7f','#bc1717',
        '#0088cc','#ff7f00','#db7093','#b87333',
        '#ff2400','#215e21','#ff00ff','#99cc32',
        '#23238e','#5340cc'],
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
            pageIconColor:'orange',
            pageIconSize: 20,
            pageTextStyle: {color:'#fff'},
            left: 15,
            textStyle: {
                fontSize: 14,
                padding: 3,
                backgroundColor: '#41dd9c',
                color: "#fff" //刻度颜色
            }
        },
        toolbox: {
        },
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
            // min: function(value) {
            //     return value.min*20;
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
    }//ecahrt图表对象
    init();
    //入口
    function init() {
        initScene();
        initCamera();
        initRenderer();
        initLight();
        initControl();
        initePage();
        composerPass();
        setSkyBox();
        helper();
        render();
        getNowTime();
        weatherData();
        bulidPoint();
        [1,2,3,4,5,6].forEach(element => {
            loadObj({
                fileName: 'house0'+ element,
                scale: [0.05,0.05,0.05],
                lineShow: true,
                // opacity: 0.4,
                objEvent: true
            })
        });
        loadObj({
            fileName: 'wall',
            scale: [0.05,0.05,0.05],
            bgColor: '#ccc'
        })
        loadObj({
            fileName: 'sensor',
            scale: [0.25,0.2,0.25],
            rotation: [1.57,0,0],
            lineShow: true
        })
        loadGltf({
            fileName: 'draco_hk',
            scale: [5,5,5],
            position: [-76, 0, 60],
        });
        loadGltf({
            fileName: 'draco_road',
            scale: [1.96,1.96,1.96],
        });
        loadGltf({
            fileName: 'draco_grass',
            scale: [1.96,1.96,1.96],
            setMaiterial: true,
        });
        
    } 
    function initScene() {
        scene = new THREE.Scene();
        scene.rotation.set(0, 1.57, 0);
    }
    function initCamera() {
        camera = new THREE.PerspectiveCamera(70,container.clientWidth/container.clientHeight, 1, 12000);
        camera.position.set(0, 250, 300);
        camera.lookAt(0,0,0);
    }
    function initRenderer() {
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(container.clientWidth, container.clientHeight);
        // renderer.shadowMap.enabled = true;
        // renderer.setClearColor(0x212830, 1);
        container.appendChild(renderer.domElement);
        THREE.onEvent(scene, camera, container.clientWidth, container.clientHeight);//事件初始化
    }
    function initLight() {
        AmbientLight = new THREE.AmbientLight(0x888888, 0.8);//环境光
        scene.add(AmbientLight);
        SpotLight = new THREE.SpotLight(0xffffff, 0, 350);//平行光
        SpotLight.position.set(0,100, 0);
        SpotLight.castShadow = true; //开启castShadow生成动态的投影
        scene.add( SpotLight );

        DirectLight = new THREE.DirectionalLight(0xffffff, 0.6);//平行光
        // DirectLight.position.set(-300,200, 0);
        DirectLight.name = 'DirLight';
        scene.add( DirectLight );
    }
    function initControl(){
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.minDistance = 50;//设置相机移动距离
        controls.maxDistance = 600;
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI/2.1;
        // 使动画循环使用时阻尼或自转 意思是否有惯性
        controls.enableDamping = true;
        //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        controls.dampingFactor = 0.5;
    }
    //特效处理通道
    function composerPass() {
        composer = new THREE.EffectComposer(renderer);//通道组合器
        var renderPass = new THREE.RenderPass( scene, camera );//渲染一个新环境
        // 外边框outLine
        outLineColor = new THREE.OutlinePass( 
            new THREE.Vector2( container.clientWidth, container.clientHeight ), scene, camera);
        outLineColor.visibleEdgeColor.set( 'orangered' );
        outLineColor.edgeStrength = 8;

        //场景发光
        bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2( container.clientWidth, container.clientHeight ))
        bloomPass.exposure = 1;
        bloomPass.threshold = 0.5;
        bloomPass.strength = 1;
        bloomPass.radius = 0.8;
        bloomPass.enabled  = false;

        //抗锯齿SMAAShader
        SMAAShader= new THREE.SMAAPass( container.clientWidth, container.clientHeight );
        SMAAShader.renderToScreen = true;
        composer.addPass( renderPass );
        composer.addPass( bloomPass );
        composer.addPass(outLineColor);
        composer.addPass( SMAAShader );

    }
    function helper() {
        // var axesHelper = new THREE.AxesHelper( 500 );
        // scene.add( axesHelper );
        // var helper = new THREE.CameraHelper( camera );
        // scene.add( helper );

        var helper = new THREE.SpotLightHelper( DirectLight, 5 );
        
        scene.add( helper );
    }
    function render() {
        var delta = clock.getDelta();
        controls.update(delta);
        TWEEN.update();
        composer.render(delta);
        composer.autoClear = false; 
        if(!!map3) map3.needsUpdate = true;
        requestAnimationFrame(render);
    }
    function initePage() {
        $('.navBottom').width(window.innerWidth-2*400 + 'px');
        $(window).resize(function () {
            camera.aspect = container.clientWidth/container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            composer.setSize( container.clientWidth, container.clientHeight );
            $('.navBottom').width(window.innerWidth-2*400 + 'px');
            THREE.onEvent(scene, camera, container.clientWidth, container.clientHeight);//事件初始化
        })
        // 点位定位
        // container.addEventListener( 'click', onDocumentMouseDown, false );
        // function onDocumentMouseDown( event ) {
        //     event.preventDefault();
        //     var vector = new THREE.Vector3();//三维坐标对象
        //     vector.set(
        //         ( event.clientX / container.clientWidth ) * 2 - 1,
        //         - ( event.clientY /container.clientHeight ) * 2 + 1,
        //         0.5 );
        //     vector.unproject( camera );
        //     var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        //     var intersects = raycaster.intersectObjects(thing.children);
        //     if (intersects.length > 0) {
        //         var selected = intersects[0];//取第一个物体
        //         $('#posX').text(Math.round(selected.point.x));
        //         $('#posY').text(Math.round(selected.point.y+45));
        //         $('#posZ').text(Math.round(selected.point.z));
        //     }
        // }
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
                        // child.material.color.set(bgColor);
                        
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: bgColor,
                            flatShading: THREE.SmoothShading
                        });
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
                            color: '#00F6FF',
                            depthTest: false,
                            transparent: true,
                            opacity: 0.5
                        }));
                        line.name = 'lines_'+ fileName;
                        line.renderOrder = 5;
                        line.visible = false;
                        obj.add(line); 
                        houseArr.push(obj);
                    }
                }) 
                obj.scale.set(s[0], s[1], s[2]);
                obj.position.set(p[0], p[1], p[2]);
                obj.rotation.set(r[0], r[1], r[2]);
                if(fileName === 'sensor') {
                    sensorModel(obj);
                }else {
                    scene.add(obj);
                }
                if(objEvent) {
                    // 点击事件
                    obj.on('click', () => {
                        let maxOpacity = bloomPass.enabled? 0.3: 0.1;
                        let opacity = obj.children[0].material.opacity > maxOpacity? maxOpacity: 0.3;
                        obj.traverse(child => {
                            if(child.type === 'Mesh') {
                                child.material.transparent = true;
                                thingAnimate(child.material, {opacity}, 500);
                            }else if(child.type === 'LineSegments'){
                                child.visible = !child.visible;
                            }
                        })
                    })
                    obj.on('hover',() => {
                        outLineColor.selectedObjects = [obj];
                    }, () => {
                        outLineColor.selectedObjects = [];
                    })
                }
            })
        })
    }
    //加载Gltf文件模型
    function loadGltf({fileName, scale, position, bgColor, setMaiterial,lineShow}) {
        let s = scale || [1,1,1];
        let p = position || [0,0,0];
        let gltfLoader = new THREE.GLTFLoader().setPath('../source/');
	    //设置gltfloader解压loader
        gltfLoader.setDRACOLoader(new THREE.DRACOLoader());
        gltfLoader.load(fileName + '.gltf', (obj) => {
            gltfLaodCount++;
            if(gltfLaodCount === 3) {
                $('#changeView div').fadeIn();
                $('#loadingMask').fadeOut();
                controls.enableRotate = true;
                controls.enableZoom = true;
                showDayView();
                let A = thingAnimate(camera.position, {x: 0, y: 80, z: 120}, 1500);
            }
            hkPointModule = obj.scene;
            hkPointModule.scale.set(s[0],s[1],s[2]);
            hkPointModule.position.set(p[0], p[1], p[2]);
            hkPointModule.children[0].traverse( child => {
                if(child.type === 'Mesh') {    
                    if(fileName == 'draco_hk') {
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: '#c2c2c2',
                            transparent: true,
                            opacity: 0.8
                        }) 
                        child.renderOrder = -2;
                    }
                }
                if(!!setMaiterial) {
                    let texture = new THREE.TextureLoader().load('../img/grass.png');
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(30,30);
                    child.material = new THREE.MeshPhongMaterial({
                        map: texture,
                        side: THREE.BackSide
                    });
                }  
            })
            hkPointModule.on('click', () =>{
                outLineColor.selectedObjects = [hkPointModule];
            })
            fileName == 'draco_hk'? scene01.add(hkPointModule):scene.add(hkPointModule)
        })
    }
    //动画
    function thingAnimate(start, end, time, num) {
        let tween = new TWEEN.Tween(start)
            .to(end, time)
            .yoyo(true)
            .repeat(num||0)
            // .start('+800')
        tween.start();
        return tween;
    }
    //监测点信息牌
    function sensorInfo(){
        //获取到窗口的一半高度和一半宽度
        let halfWidth = container.clientWidth / 2;
        let halfHeight = container.clientHeight / 2;  
        let point = new THREE.Vector3();
        if(currentSensor == null) return;
        scene.updateMatrixWorld(true);
        currentSensor.getWorldPosition(point);
        let pos = new THREE.Vector3( point.x, point.y+12, point.z);
        let vector = pos.project(camera);
        $('.sensorInfo').css({
            left:vector.x * halfWidth + halfWidth-$('.sensorInfo').width()/2,
            top:-vector.y* halfHeight + halfHeight-$('.sensorInfo').height() - 120
        }) 
        animationId = requestAnimationFrame(sensorInfo);
    }
    //创建连线
    function linkLine() {
        let texture = new THREE.CanvasTexture(new CanvasView().draw({
            type: 4,
            borderColor: ['#41dd9c', '#41dd9c']
        }))
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6,1);
        let tweenA = thingAnimate(texture.offset,{x:-1}, 500);
        let tweenB = thingAnimate(texture.offset,{x:-1}, 500);
        tweenA.chain(tweenB);
        tweenB.chain(tweenA);
        let material = new THREE.MeshBasicMaterial({
            // color: '#6868ff',
            map: texture
        });
        let path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,22),
        ]);
        //通过多段曲线路径创建生成管道，CurvePath：管道路径
        var tube = new THREE.TubeGeometry(path, 100, 0.5, 3, false);
        var tubeMesh = new THREE.Mesh( tube, material );
        return tubeMesh;
    }
    //地板
    function bulidPoint() {
        //底平面
        let texture = loader.load('../img/plane.png');//../img/hkPoint.svg
        let plane = new THREE.BoxGeometry(800,8, 600);
        let material = new THREE.MeshPhysicalMaterial({
            color: 'rgb(255, 189, 101)',
            side: THREE.FrontSide,
        });
        let mesh = new THREE.Mesh(plane, material);
        mesh.name = 'pointPic';
        mesh.position.y = -5;
        scene01.add(mesh);
        //点位图平面
        let bigPlane = new THREE.PlaneGeometry(706, 492);
        map1 = loader.load('../img/hkPoint01.png');
        map2 = loader.load('../img/hkPoint02.png');
        hkPlaneMesh = new THREE.Mesh(bigPlane, new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
            map: map1
        }));
        hkPlaneMesh.name = 'hkP2';
        hkPlaneMesh.position.set(-190, -45, 0)
        //按层级进行先后渲染）
        renderer.sortObjects = true;
        //设置透明物体的渲染层级(默认是0)
        hkPlaneMesh.renderOrder = -1;
        // hkPlaneMesh.rotation.x =  -1.57;
        thing.add(hkPlaneMesh);
        thing.rotation.x = -1.57;
        thing.position.x = 150;
        scene01.add(thing);
        scene01.scale.set(0.35, 0.35, 0.35);
        scene01.position.set(30,0, -25);
        scene.add(scene01);
        //圈平面
        let box = new THREE.PlaneGeometry(1024, 1024, 20, 20);
        let cirTexture = loader.load('../img/lightCircle.png');
        let boxMesh = new THREE.Mesh(box, new THREE.MeshPhongMaterial({
            emissive: '#00F6FF',
            transparent: true, 
            map: cirTexture,
            depthTest: false
        }));
        boxMesh.name = 'circle';
        boxMesh.sortParticles = true;
        boxMesh.position.y = -20;
        boxMesh.rotation.x = -1.57;
        boxMesh.layers.mask = 2;
        let tweenA = thingAnimate(boxMesh.rotation, {
            x: -1.57,
            y: 0,
            z: 2 * Math.PI
        }, 10000);
        let tweenB = thingAnimate(boxMesh.rotation, {
            x: -1.57,
            y: 0,
            z: 2 * Math.PI
        }, 10000);
        tweenA.chain(tweenB);
        tweenB.chain(tweenA);
        scene.add(boxMesh);

        // 数据流线
        map3 = new THREE.Texture(new CanvasView().draw({
            width: 256,
            height: 256,
            type: 7,
            number: 10,
            showY: true
        }))
        map3.wrapS = THREE.RepeatWrapping;
        map3.wrapT = THREE.RepeatWrapping;
        map3.repeat.set(10,1);
        map3.rotation = 3.14;
        let dataLine = new THREE.CylinderGeometry(256,256, 400, 64, 1, true);
        let lineMaterial = new THREE.MeshPhysicalMaterial( {
            emissive: '#00F6FF',
            map: map3,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false,
        } );
        let cylinder = new THREE.Mesh( dataLine, lineMaterial );
        cylinder.name = 'dataLine';
        cylinder.position.y = 200;
        cylinder.layers.mask = 2;
        scene.add(cylinder);
    }
    //监测点模型
    function sensorModel(obj) {
        let geometry = new THREE.CylinderGeometry(6,6,20, 64, 1, true);
        let lightText = loader.load('../img/kehuandimian.png');
        let material = new THREE.MeshPhysicalMaterial({
            map: lightText,
            side: THREE.FrontSide,
            transparent: true,
            depthTest: false,
            emissiveIntensity: 0.8,
            reflectivity: 0.1
        });
        let sensorMesh =  new THREE.Mesh(geometry, material);
        sensorMesh.rotation.x = 1.57;
        //监测点名称
        let SpriteMaterial = new THREE.SpriteMaterial({depthTest: false});
        let SpriteInfo = new THREE.Sprite(SpriteMaterial);
        SpriteInfo.rotateX(Math.PI/2);
        SpriteInfo.scale.set(45,45,45);
        //状态指示灯
        let stateLight = new THREE.SphereGeometry(3,64,64);
        let stateLightM = new THREE.MeshBasicMaterial();
        let stateM = new THREE.Mesh(stateLight,stateLightM);
        sensorArr.forEach( (child, i) => {
            child.forEach( (item, j) => {
                let ptG = ptGroup.clone();
                ptG.scale.set(0.001,0.001,0.001);
                //监测点信息
                let info = SpriteInfo.clone();
                info.material = SpriteInfo.material.clone();
                let texture = new THREE.CanvasTexture(new CanvasView().draw({
                    type: 3,
                    text:{
                        content: item.name,
                        align:'center',
                        color:'#eee',
                        size:'bold 15px Arial'
                    },
                    borderColor:['#38b0de'],
                    lineWidth: '6',
                    background:'rgba(0,0,0, .5)'
                }));
                info.material.map = texture;
                info.position.set(item.pos.x, item.pos.y,item.pos.z + 35);
                //光柱
                let light = sensorMesh.clone();
                light.name = 'lightCylinder';
                light.material = sensorMesh.material.clone();
                light.scale.set(0.001,0.001,0.001);
                light.position.set(item.pos.x, item.pos.y,item.pos.z+ 16);
                //监测点模型
                let sen = obj.clone();
                houseArr.push(sen);
                sen.position.set(item.pos.x + 41.5,item.pos.y-7, item.pos.z+18);
                //状态灯
                let state = stateM.clone();
                state.material = stateM.material.clone();
                state.name = 'sensorLight';
                state.scale.set(0.001,0.001,0.001);
                state.position.set(item.pos.x,item.pos.y, item.pos.z+7);
                ptG.name = item.name;
                ptG.add(light); 
                ptG.add(info);
                ptG.add(sen);  
                ptG.add(state);

                sensorArr[i][j].node = ptG;
                //监测点事件
                ptG.on('hover', () => {
                    outLineColor.selectedObjects = [sen];
                    document.body.style.cursor = 'pointer';
                }, () => {
                    outLineColor.selectedObjects = [];
                    document.body.style.cursor = '';
                })
                if(i === 0 && j === 0) currentSensor = state;
                ptG.on('click', () => {
                    ptIdArr.forEach(item => {
                        if(item.ptName === sen.parent.name) {
                            getEchartData([item.ptId], item.ptName);
                        }
                    })
                    $('#info').html('');
                    new CanvasView('#info').draw({
                        type: 1,
                        width: 256,
                        height: 128,
                        // title: {
                        //     content: '监测点信息',
                        //     size: 'normal 22px Microsoft Yahei',
                        //     color: '#38b0de',
                        // },
                        lineWidth: '5',
                        borderColor:['#37D9FC', 'rgba(0,0,0,0.8)'], 
                        background: 'rgba(0,0,0,0.8)',
                        text: {
                            content:`监测点名称：${item.name}/n监测点状态：${item.status||'离线'}/n状态说明：${item.statusText||'无'}/n监测点数据：${!!item.value?item.value+currentType.unit:'无数据'}`,
                            size: 'normal 16px Microsoft Yahei',
                            left: 10,
                            top: 12,
                            color: 'orange'
                        } 
                    })
                    $('.sensorInfo').fadeIn();
                    sensorInfo();
                    if(currentSensor === state) return;
                    currentSensor = state;
                    let pos = state.getWorldPosition(new THREE.Vector3());
                    let count = camera.position.z - pos.z > 0? 70: -70;
                    var tweenA = thingAnimate(controls.target, new THREE.Vector3(pos.x,pos.y,pos.z), 2000);
                    var tweenA = thingAnimate(camera.position, {x:pos.x,y:pos.y+45,z:pos.z+count}, 2000);
                    camera.lookAt({x:pos.x,y:pos.y,z:pos.z});
                })
                thing.add(ptG);
            })
        })
        lightText.offset.x = -0.8;
        lightText.offset.y = 0;
        var tweenA = thingAnimate(lightText.offset, {x: -0.8,y:1,z:0}, 800, 'Infinity');
        sensorFlash();
        getGroup();
    }
    //天空盒
    function setSkyBox() {
        var skyBox = new THREE.SphereGeometry(8000,100,100);
        var rootPath = '../img/';
        var material = new THREE.MeshBasicMaterial({
            // color: '#888',
            map: loader.load(rootPath+'star1.jpg'),
            side: THREE.BackSide
        })
        let sky = new THREE.Mesh(skyBox, material);
        scene.add(sky);
    }
    //传感器状态灯
    function sensorFlash() {
        let flag = false;
        let flashColor="#fff";
        if(!!sensorFlashTimer) {
            clearInterval(sensorFlashTimer);
            sensorFlashTimer = null;
        }
        sensorFlashTimer = setInterval(() => {
            sensorArr.forEach((item, i) => {
                item.forEach( (child, j) => {
                    child.node.traverse(mesh => {
                        if(mesh.name === 'sensorLight' || mesh.name === 'lightCylinder') {
                            webSocketData.forEach((element, k) => {
                                if(child.node.name === element.ptName) {
                                    sensorArr[i][j].status = element.isOnline*1;
                                    sensorArr[i][j].status = (element.isOnline == 0 && element.ptStatus == 0)?2:element.isOnline;
                                    switch (sensorArr[i][j].status) {
                                        case 0: flashColor = '#fff';
                                            sensorArr[i][j].status = '离线';
                                            sensorArr[i][j].ptName = element.ptName;
                                            sensorArr[i][j].ptId = element.ptId;
                                            sensorArr[i][j].value = element.deflection;
                                            sensorArr[i][j].statusText = element.statusText;
                                            break;
                                        case 1: flashColor = '#7fff00';
                                            sensorArr[i][j].status = '在线';
                                            sensorArr[i][j].ptName = element.ptName;
                                            sensorArr[i][j].ptId = element.ptId;
                                            sensorArr[i][j].value = element.deflection;
                                            sensorArr[i][j].statusText = element.statusText;
                                            break;
                                        case 2: flashColor = '#444';
                                            sensorArr[i][j].status = '禁用';
                                            sensorArr[i][j].ptName = element.ptName;
                                            sensorArr[i][j].ptId = element.ptId;
                                            sensorArr[i][j].value = element.deflection;
                                            sensorArr[i][j].statusText = element.statusText;
                                            break;
                                    }
                                    if(mesh.name === 'lightCylinder') {
                                        mesh.material.emissive.set(flashColor);
                                        mesh.scale.set(1,1,1);
                                        return ;
                                    }
                                    mesh.material.color.set(flashColor);
                                    if(flag) {
                                        mesh.scale.set(1,1,1);
                                    }else{
                                        mesh.scale.set(0.001,0.001,0.001);
                                    }
                                }
                                    
                            })
                        }
                    })
                })
            })
            flag= !flag;
        }, 800);
    }
    //获取群组
    function getGroup() {
        getData("get", "/echart/selectProjectStructure", {pmId}).then((res) => {
            if(res.data.length>0) {
                gpIdArr = res.data;
                gpId = gpIdArr[0].gpId;
                frameControl(gpIdArr);
                allDataMonitoring();
                showCurrentGp();
                getWarnMsg(gpId,5);
                dataCollection(gpId);
                openWebSocket();
            }
        });
    }
    //显示与隐藏
    function showCurrentGp() {
        let stList = [];
        ptIdArr = [];
        //隐藏上次群组
        sensorArr.forEach(child => {
            child.forEach((child2) => {
                child2.node.scale.set(0.001,0.001,0.001);
            })
        })
        //显示当前群组
        gpIdArr.forEach((item) => {
            if(item.gpId === gpId) {
                stList = item.kxSiteList;
            }
        })
        //默认显示第一组监测点
        stList.forEach(item =>{
            item.kxPoints.forEach((item2) => {
                ptIdArr.push(item2);
                sensorArr.forEach(child => {
                    child.forEach((child2) => {
                        if(item2.ptName == child2.name){
                            child2.node.scale.set(1,1,1);
                        }
                    })
                    
                })  
            })
            
        })
        getEchartData([ptIdArr[0].ptId], ptIdArr[0].ptName);
    }
    //项目监测详情
    function allDataMonitoring() {
        getData("get", "/echart/getGPCountByPmId/"+pmId, {}).then((res) => {
            let ulHtml = '';
            $('#allGpNum').text(res.data);
        });
        getData("get", "/echart/getPointCountByPmId", {pmId}).then((res) => {
            let sensorNum = res.data.allCount;
            $('#allSensorNum').text(sensorNum);
        });
        getData("get", "/echart/getPointCountByPmId", {gpId}).then((res) => {
            let sensorNum = res.data.allCount;
            $('#sensorNum').text(sensorNum);
        });
        getData("get", "/echart/getDatasCountByPmId/"+pmId, {}).then((res) => {
            let dataNum = res.data;
            if(res.data > 10000) {
                dataNum = Math.round(res.data/10000) + '万';
            }
            $('#allDataNum').text(dataNum);
        });
        getData("get", "/echart/getWarnCountByPmId/"+pmId, {}).then((res) => {
            let warnNum = res.data;
            $('#allWarnNum').text(warnNum);
        });
    }
    //预警信息 
    function getWarnMsg (gpId, size) {
        let warnDom1 = $('#warnMsg p');
        let warnDom2 = $('#warnMsg table');
        getData("get","/echart/selectLatelyWarnInfo/"+gpId+'/'+ size,{}).then((res) => {
            if(res.data == null||res.data.length==0) {
                warnDom1.text("无预警信息");
                warnDom1.css('opacity', '1');
                warnDom2.css('opacity', '0');
            } else {
                let html = `<thead><tr class="text-bule bg-liver text-center">
                            <th scope="col"><small class="mb-0">采集点</small></th>
                            <th scope="col"><small class="mb-0">预警等级</small></th>
                            <th scope="col"><small class="mb-0">开始时间</small></th>
                            <th scope="col"><small class="mb-0">恢复时间</small></th>
                        </tr></thead><tbody class="text-light">`;
                res.data.forEach((item, i) => {
                    html += `<tr class="${i%2===0?'bg-secondLiver':'bg-liver'} text-center">
                        <td class="d-flex justify-content-around align-items-center pt-2">
                            <img src="../img/redWran.png" width="14" height="14">
                            <small class="mb-0 ellipsis">${item.ptName.substr(0,8)}</small>
                        </td>
                        <td><small class="mb-0 ellipsis ">${item.grade}级预警</small></td>
                        <td><small class="mb-0 ellipsis d-flex flex-column">${item.eventIntime.substr(0,10)}<small>${item.eventIntime.substr(11,8)}</small></small></td>
                        <td><small class="mb-0 ellipsis d-flex flex-column">${item.eventRecovertime != undefined?item.eventRecovertime.substr(0,10): '未恢复'}<small>${item.eventRecovertime != undefined?item.eventRecovertime.substr(11,8): ''}</small></small></td>
                    </tr>`;
                })
                html += '</tbody'
                warnDom1.css('opacity', '0');
                warnDom2.css('opacity', '1');
                warnDom2.html(html);
            };
        })
    }
    //数据采集频率
    function dataCollection(gpId) {
        let unit = currentType.unit;
        getData("get", "/echart/get24HoursMaxMinSpeed/" + gpId, {}).then((res) => {
            if(res.data.data != null) {
                let h24MaxValue = res.data.data.h24MaxValue + unit;
                let h24Speed =  res.data.data.h24Speed  + unit;
                $('#h24MaxValue').text(h24MaxValue);
                $('#h24Speed').text(h24Speed);
            } else {
                $('#h24MaxValue').text(res.data.message);
                $('#h24Speed').text(res.data.message);
            }
        });
        getData("get", "/echart/get15DayMaxMinSpeed/" + gpId , {}).then((res) => {
            if(res.data.data != null) {
                let d15MaxValue = res.data.data.d15MaxValue + unit;
                let d15Speed =  res.data.data.d15Speed  + unit;
                $('#d15MaxValue').text(d15MaxValue);
                $('#d15Speed').text(d15Speed);
            }else {
                $('#d15MaxValue').text(res.data.message);
                $('#d15Speed').text(res.data.message);
            }
        });
    }
    //动态时间加载
    function getNowTime() {
        Date.prototype.Format = timeFormat;
        setInterval(function(){
            let day,week,houer;
            let date = new Date().getTime();
            houer = new Date(date).Format('HH:mm:ss');
            var weeksArr = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
            week = new Date().getDay();
            week = weeksArr[week];
            day = new Date(date).Format('yyyy-MM-dd');
            $('#houer').text(houer);
            $('#week').text(week);
            $('#day').text(day);
        }, 1000)
        //时间格式化函数
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
    }
    //环境因素
    function weatherData() {
        $.ajax({
            type: "GET",
            url: "https://free-api.heweather.com/s6/weather/now",
            async: true,
            xhrFields:{
                withCredentials:false
            },
            data: {
                "location": "CN101250101",
                "key": "eb55782b84b14e439393e2042f90cf75"
            },
            success: function (data) {
                if(!!data.HeWeather6[0].now) {
                    let weather = data.HeWeather6[0].now;
                    $('#cond_txt').text(weather.cond_txt);
                    // $('#wind_dir').text(weather.wind_dir);
                    // $('#wind_sc').text(weather.wind_sc+'级');
                    $('#tmp').text(weather.tmp);
                    $('#wind_spd').text(weather.wind_spd+'km/h');
                    $('#hum').text(weather.hum+'%');
                    $('#pcpn').text(weather.pcpn+'mm');  
                }
               
            }
        });
    }
    //按钮生成和控制
    function frameControl(gpList) {
        let parent = $('.controlList ul')[0];
        let ulHtml = '';
        let num = Math.ceil(12/gpList.length*2);
        gpList.forEach((element, i) => {
            if(element.gpId == gpId) {
                ulHtml += `<li class="col-6 col-md-${num} col-sm-4 text-center selected" data-index="${i}" value=${element.gpId}>${element.gpName}</li>`;
            }else {
                ulHtml += `<li class="col-6 col-md-${num} col-sm-4 text-center" data-index="${i}" value=${element.gpId}>${element.gpName}</li>`;
            }
        });
        $('.controlList>ul').html(ulHtml);
        $('.echartTitle').text(currentType.name+'-时间曲线图');
        parent.addEventListener('click',changeSpType, false); 
    }
    //群组切换
    function changeSpType(e){
        //点击当前桁架不重加载
        let index = parseInt(e.target.dataset.index);
        if(e.target.getAttribute('value')*1 === gpId || isNaN(index)) {
            return false;
        }
        currentType = MonitoringType[index];
        gpId = e.target.getAttribute('value')*1;
        if(gpId !== 55 && gpId !== 56) {
            hkPlaneMesh.material.map = map1;
            hkPlaneMesh.material.color.set('#fff');
        }else{
            hkPlaneMesh.material.map = map2; 
            hkPlaneMesh.material.color.set('#37D9FC')
        }
        let liNode = $('.controlList li.selected')[0];
        liNode.classList.remove('selected');
        e.target.classList.add('selected');
        dataCollection(gpId);
        getWarnMsg(gpId,5);
        initData();
        showCurrentGp();
        if(webSocket) {
            webSocket.close(1000);
        }else{
            openWebSocket();
        }
        e.stopPropagation();
    }
    //切换群组更新数据
    function initData() {
        $('.sensorInfo').css('display', 'none');
        cancelAnimationFrame(animationId);
        webSocketData = [];
        $('.echartTitle').text(currentType.name+'-时间曲线图');
        $('#d15MaxValue').text('···');
        $('#d15Speed').text('···');
        $('#h24MaxValue').text('···');
        $('#h24Speed').text('···');
        $('.echartWarpper > p').css('display', 'none');
        thing.traverse((mesh) => {
            if(mesh.name === 'lightCylinder' || mesh.name === 'sensorLight') {
                mesh.scale.set(0.001,0.001,0.001);
            }
        })
        // 计算动画时间
        let point = new THREE.Vector3(0,80, 120);
        let distance = Math.ceil(point.distanceTo(camera.position));
        let time = distance > 100 ? 1500: 500;
        time = distance < 10 ? 0: time;
        if( time !== 0 ) {
            thingAnimate( controls.target, new THREE.Vector3(0,0,0), time );
            thingAnimate( camera.position, {x:0, y:80, z:120}, 1500 )
            camera.lookAt({x:0,y:0,z:0});
        }
        //清除图表数据
        chartOption.xAxis.data = [];
        chartOption.legend.data = [];
        chartOption.series = [];
        echart.setOption({}, true);
    }
    //获取图表数据
    function getEchartData(ptIdArr, echartTitle) {
        echartDom = document.getElementById('dataEchart');
        echart = echarts.init(echartDom);
        //窗口变化改变图表大小
        let sensorList = [];
        let date = new Date().getTime();
        let lastDate = date-24*60*60*1000;
        let startTime = new Date(lastDate).Format('yyyy-MM-dd HH:mm:ss');
        let endTime = new Date(date).Format('yyyy-MM-dd HH:mm:ss');
        let ptIds = ptIdArr.join(',');
        getData("get", "/echart/selectPointDatasByPtId", {ptIds, startTime, endTime}).then((res)=>{
            if(res.data.length > 0) {
                getEchart(res.data);
            }else{
                $('.echartWarpper > p').css('display', 'block');
                $('.fullEchartWarpper > p').css('display', 'block');
            }
        });
        function getEchart(sensorList) {
            let len = sensorList.length;
            chartOption.title.text= echartTitle;
            chartOption.xAxis.data = [];
            //x刻度
            for(let i=0; i<len; i++){
                if(!!sensorList[i].x) {
                    sensorList[i].x.forEach((item) => {
                        chartOption.xAxis.data.push(item.substr(-6))
                    })  
                    break;
                }
            }
            chartOption.series = [];
            chartOption.legend.data = [];
            //y
            for(let i=0; i<len; i++){
                let lineColor = `rgba(${Math.ceil(Math.random()*225)},${Math.ceil(Math.random()*225)},${Math.ceil(Math.random()*225)})`;
                let seriesRoot = {name: " ", type: "line", showSymbol:false, data:[]};
                let legendRoot = {name: " ", textStyle:{backgroundColor:''}};
                chartOption
                chartOption.series[i] = seriesRoot;
                chartOption.legend.data.push(legendRoot);
                chartOption.legend.data[i].name = sensorList[i].senName;
                chartOption.color.push(lineColor);
                chartOption.legend.data[i].textStyle.backgroundColor = chartOption.color[i];
                chartOption.yAxis.name = currentType.name+`(${currentType.unit})`;
                chartOption.series[i].name = sensorList[i].senName;
                chartOption.series[i].data = sensorList[i].y;
            }
            echart.setOption(chartOption, true);
        }
    }
    //webSocketData实时数据推送
    function openWebSocket () { 
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
                var res =JSON.parse(evt.data);
                let count = -1;
                let stId = [];
                webSocketData.forEach((item ,i) => {
                    if(item.ptId == res.ptId) count = i;
                })
                if(count !== -1) {
                    webSocketData[count] = res;
                    count = -1;
                }else{
                    if(res.gpId == gpId) webSocketData.push(res);
                }
            };
            //关闭服务器时触发
            webSocket.onclose = function(evt){
                // console.log('webSocket关闭成功');
                webSocket = null;
                if(evt.code == 1000) {
                    setTimeout(() => {
                        openWebSocket();
                    }, 200)
                }
            }
        }
    }
    $('.sensorInfo').bind('mouseup', (e) => { e.stopPropagation()});
    $('.sensorInfo img').bind('mouseup', () => {
        $('.sensorInfo').fadeOut();
    })
    //切換模式
    $("#changeView").bind('mouseup', (e) => {e.stopPropagation();})//阻止事件冒泡
    $("#changeView input[type=checkbox]").bind('change', function(e) {
        e.stopPropagation();
        let showView = this.checked ? showNightView : showDayView;
        showView();
    })
    function showNightView() {
        houseArr.forEach(item => {
            item.traverse(child => {
                if(child.type === 'Mesh'){
                    child.material.transparent = true;
                    child.material.opacity = 0.2;
                    child.material.emissive.set('#00F6FF');
                }else if(child.type == 'LineSegments'){
                    child.visible = true;
                }
            })
        })
        scene.getObjectByName('circle').layers.mask = 1;
        scene.getObjectByName('dataLine').layers.mask = 1;
        thingAnimate(DirectLight, {intensity: 0}, 500);
        thingAnimate(AmbientLight, {intensity: 0}, 500);
        thingAnimate(SpotLight, {intensity: 0.85}, 500);
        changeViewTimer = setTimeout(() => {
            bloomPass.enabled  = true; 
        }, 500);
    }

    function showDayView () {
        houseArr.forEach(item => {
            item.traverse(child => {
                if(child.type === 'Mesh'){
                    child.material.transparent = true;
                    child.material.opacity = 0.3;
                    child.material.emissive.set('#000');
                }else if(child.type === 'LineSegments'){
                    child.visible = false;
                }
            })
        })
        if(changeViewTimer) clearTimeout(changeViewTimer);
        bloomPass.enabled  = false;  
        scene.getObjectByName('circle').layers.mask = 2;
        scene.getObjectByName('dataLine').layers.mask = 2;
        thingAnimate(DirectLight, {intensity: 0.6}, 500);
        thingAnimate(AmbientLight, {intensity: 0.8}, 500);
        thingAnimate(SpotLight, {intensity: 0}, 500);
    }
})