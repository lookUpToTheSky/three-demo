$(window).ready(function () {
	const baseURL = 'http://118.25.55.220:8082/';
	// const baseURL = 'http://192.168.11.151:8082';
	//全局ajax获取后台数据
	function getData(type, api, data) {
		return new Promise((resolve, reject) => {
			$.ajax({
				type: type,
				url: baseURL + api,
				data: data,
				asyc: true,
				dataType: "json", // 返回的数据类型 json currentSensor
				success: function (data) {
					resolve(data)
				},
				error: function (err) {
					reject(err)
				}
			});
		})	
	}
	//时间格式化函数添加到Date原型链上
	Date.prototype.Format = timeFormat;
	let camera, controls, scene, renderer, stats;
	let c = document.getElementById('frameStatusLine');
	let cxt = c.getContext('2d');
	let objArr = [];//桁架数组
	let gpId = 0;//桁架gpId
	let spCode = 0;//区域spCode
	let objLoadNum = 0;//模型加载的算量进度
	let webSocket = null;//webSocket
	let currentSensor = null;//显示信息的传感器
	let currentFrame = null;//当前数据的桁架
	let linkSensorLine = null;//信息牌连线
	let frameList = null; //桁架切换按钮列表
	let getEchartsTimer = null;//定时获取ecahrts数据
	let animationId = null;//3d场景实时渲染
	let echartDom = null;//图表dom
	let echart = null;
	let frame = new THREE.Group();
	let thing = new THREE.Group();
	let flashTimer = null;
	let sensorList0 = [
		[{node:null,data:null},  {node:null,data:null}, {node:null,data:null}]
		]//传感器模型0，12p桁架传感器模型
	let sensorList1 = [
		[{node:null,data:null},  {node:null,data:null}, {node:null,data:null}],
		[{node:null,data: null}, {node:null,data:null}, {node:null,data:null}]
		]//传感器模型2，1p-9p桁架传感器模型
	let sensorList2 = [
		[{node:null,data:null}, {node:null,data:null},{node: null,data:null}, {node:null,data:null},{node:null,data:null}],
		[{node:null,data:null}, {node:null,data:null},{node:null,data:null}, {node:null,data:null},{node:null,data:null}],
		[{node:null,data:null},                              {node:null,data:null},                {node:null,data:null},]
	]//传感器模型1，10p和11p桁架传感器模型
	let sensorList3 = [
		{node:null,data:null,senCode:385409},  {node:null,data:null,senCode:385414}, {node:null,data:null,senCode:386759},{node:null,data:null,senCode:385410},
		{node:null,data: null,senCode:386762}, {node:null,data:null,senCode:386763}, {node:null,data:null,senCode:386761},
		{node:null,data: null,senCode:385418}, {node:null,data:null,senCode:385421}, {node:null,data:null,senCode:385416},{node:null,data:null,senCode:385422}
		]//应力传感器模型3p，6p桁架应力传感器模型
	let sensorList4 = [
		{node:null,data:null,senCode:441072},  {node:null,data:null,senCode:305999}, 
		{node:null,data:null,senCode:441068},{node:null,data:null,senCode:465975}
		]//位移传感器模型3p，6p桁架应力传感器模型
	let senCodeArr3 = [441072,305999,441068,465975];
	let senCodeArr6 = [441069,441067,441070,441066];
	let chartOption = {
		color: ['#e36159','#00ff7f','#bc1717',
		'#0088cc','#ff7f00','#db7093','#b87333',
		'#ff2400','#215e21','#ff00ff','#99cc32',
		'#23238e','#5340cc'],
		tooltip: {
			trigger: "axis"
		},
		legend: {
			data: [],
			x: 'center',
			y: 0,
			textStyle: {
				color: "#fff" //刻度颜色
			}
		},
		toolbox: {
			iconStyle: {
				borderColor: '#e36159',
			},
			y: 0
		},
		grid: {
			top: 85,
			left: 55,
			right: 50,
			bottom: 50
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
			show: true,
			lineStyle: {
				color: "#fff",
				width: 1,
				type: "solid"
				}
			}
		},
		yAxis: {
			//y轴
			type: "value",
			name: "",
			// min: 'dataMin',
			// scale: true,
			axisTick: {
				show: false
			},
			axisLabel: {
				textStyle: {
				color: "#fff", //刻度颜色
				fontSize: 14 //刻度大小
				}
			},
			axisLine: {
				show: true,
				lineStyle: {
				color: "#fff",
				width: 1,
				type: "solid"
				}
			},
			splitLine: {
				show: false
			}
		},
		series: []
	}//ecahrt图表对象
	init3DScene();
	//页面切换1:概括，2：挠度，3：应力，4：位移
	function chargePage() {
		loadAnimation();
		let pageIndex = sessionStorage.getItem('currentPage')*1;
		let lastPageIndex = null;
		let currentPageIndex = pageIndex;
		if(pageIndex == 0) {
			firstPageIn();
		}else{
			switch(pageIndex){
				case 1: secondPageIn();break;
				case 2: thirdPageIn();break;
				case 3: fourthPageIn();break;
			}
		}
		$('.nav ul a').eq(pageIndex).addClass('active');
        $('.nav').on('click', 'a', function(e){
			if(e.target.getAttribute('value')*1 === currentPageIndex) return;
			loadAnimation();
			lastPageIndex = currentPageIndex;
			currentPageIndex = e.target.getAttribute('value')*1;
            $('.nav .active')[0].classList.remove('active');
			e.target.classList.add('active');
			setTimeout(function(){
				switch(lastPageIndex){
					case 0:firstPageOut(currentPageIndex);break;
					case 1:secondPageOut(currentPageIndex);break;
					case 2:thirdPageOut(currentPageIndex);break;
					case 3:fourthPageOut(currentPageIndex);break;
				}
			}, 50)
        })
        function firstPageOut(index) {
			deletePageFirstData();
            $('.pageLeft .detail').css('transform', 'scale(0)');
			$('.pageLeft .dataInfo').css('transform', 'scale(0)');
			$('.pageLeft .environment').css('transform', 'scale(0)');
			$('.pageRight .warnMsg1').css('transform', 'scale(0)');
			$('.pageRight .chargeMan').css('transform', 'scale(0)');
            setTimeout(function (){
				$('.pageLeft .detail').css('display', 'none');
				$('.pageLeft .dataInfo').css('display', 'none');
				$('.pageLeft .environment').css('display', 'none');
				$('.pageRight .warnMsg1').css('display', 'none');
				$('.pageRight .chargeMan').css('display', 'none');
				switch(index){
					case 1:secondPageIn();break;
					case 2:thirdPageIn();break;
					case 3:fourthPageIn();break;
				}
            }, 100)
        }
        function firstPageIn(index) {
			$('.pageLeft .detail').css('display', 'block');
			$('.pageLeft .dataInfo').css('display', 'block');
			$('.pageLeft .environment').css('display', 'block');
			$('.pageRight .warnMsg1').css('display', 'block');
			$('.pageRight .chargeMan').css('display', 'block');
			setTimeout(function (){
				$('.pageLeft .detail').css('transform', 'scale(1)');
				$('.pageLeft .dataInfo').css('transform', 'scale(1)');
				$('.pageLeft .environment').css('transform', 'scale(1)');
				$('.pageRight .warnMsg1').css('transform', 'scale(1)');
				$('.pageRight .chargeMan').css('transform', 'scale(1)');
				pageFirstData();
			}, 100)
        }
        function secondPageOut(index){
			deletePageSecondData();
			pageOut();
			$('.pageRight .frameStatus').css('transform', 'scale(0)');
			setTimeout(function (){
				switch(index){
					case 0:firstPageIn();break;
					case 2:thirdPageIn();break;
					case 3:fourthPageIn();break;
				}
				$('.pageRight .frameStatus').css('display', 'none');
			}, 100)
        }
        function secondPageIn(index){
			pageIn();
			$('.pageRight .frameStatus').css('display', 'block');
			setTimeout(function(){
				$('.pageRight .frameStatus').css('transform', 'scale(1)');
			}, 100)
			setTimeout(function(){
				pageSecondData();
			},200)
		}
		function thirdPageOut(index) {
			deletePageThirdData();
			pageOut();
			setTimeout(function (){
				switch(index){
					case 0:firstPageIn();break;
					case 1:secondPageIn();break;
					case 3:fourthPageIn();break;
				}
			}, 100)
		}
		function thirdPageIn(index) {
			pageIn();
			setTimeout(function(){
				pageThirdData();
			},200)
		}
		function fourthPageOut(index) {
			deletePagefourthData();
			pageOut();
			setTimeout(function (){
				switch(index){
					case 0:firstPageIn();break;
					case 1:secondPageIn();break;
					case 2:thirdPageIn();break;
				}
			}, 100);
		}
		function fourthPageIn(index) {
			pageIn();
			setTimeout(function(){
				pagefourthData();
			},200)
		}
		function pageIn() {
			$('.pageLeft .echartWarpper').css('display', 'block');
			$('.pageLeft .dataInfo').css('display', 'block');
			$('.pageLeft .environment').css('display', 'block');
			$('.pageRight .warnMsg2').css('display', 'block');
			$('.pageRight .sensorInfo').css('display', 'block');
			$('.lightStatus').css('display', 'block');
			$('.framelist').css('display', 'block');
			$('.currentFrame').css('display', 'block');
			setTimeout(function (){
				$('.pageLeft .echartWarpper').css('transform', 'scale(1)');
				$('.pageLeft .dataInfo').css('transform', 'scale(1)');
				$('.pageLeft .environment').css('transform', 'scale(1)');
				$('.pageRight .warnMsg2').css('transform', 'scale(1)');
				$('.pageRight .sensorInfo').css('transform', 'scale(1)');
				$('.lightStatus').css('transform', 'scale(1)');
				$('.currentFrame').css('transform', 'scale(1)');
			}, 100)
		}
		function pageOut() {
			$('.pageLeft .echartWarpper').css('transform', 'scale(0)');
			$('.pageLeft .dataInfo').css('transform', 'scale(0)');
			$('.pageLeft .environment').css('transform', 'scale(0)');
			$('.pageRight .warnMsg2').css('transform', 'scale(0)');
			$('.pageRight .sensorInfo').css('transform', 'scale(0)');
			$('.lightStatus').css('transform', 'scale(0)');
			$('.currentFrame').css('transform', 'scale(0)');
			$('.framelist').css('display', 'none');
			setTimeout(function (){
				$('.pageLeft .echartWarpper').css('display', 'none');
				$('.pageLeft .dataInfo').css('display', 'none');
				$('.pageLeft .environment').css('display', 'none');
				$('.pageRight .warnMsg2').css('display', 'none');
				$('.pageRight .sensorInfo').css('display', 'none');
				$('.lightStatus').css('display', 'none');
				$('.currentFrame').css('display', 'none');
			}, 100);
		}
	}
	// 概括页面加载数据
	function pageFirstData(){
		dataMonitoring (0);
		getWarnMsg (0, 5);
		weatherData();
		monitoringDetail(90);
		$('.detail-button').on('click','li',function(e){
			let liNode = $('.detail-button .selected')[0];
			liNode.classList.remove('selected');
			e.target.classList.add('selected');
			switch(e.target.getAttribute('value')*1){
				case 0: monitoringDetail(90);break;
				case 1: monitoringDetail(101);break;
				case 2: monitoringDetail(7);break;
			}
		})
	}
	// 概括页面清除数据
	function deletePageFirstData() {
		let liNode = $('.detail-button .selected')[0];
		liNode.classList.remove('selected');
		$('.detail-button li')[0].classList.add('selected');
		$('.detail-button').unbind("click");
		$('#allSensorNum').text('···');
		$('#allFrameNum').text('···');
		$('#allWarnNum').text('···');
		$('#allDataNum').text('···');
	}
	//挠度页面加载数据
	function pageSecondData(){
		gpId = 23;
		spCode = 90;
		sessionStorage.setItem('currentPage', 1)
		chartOption.yAxis.name = "挠度（mm）";
		$('.echartTitle').text('挠度-时间曲线图');
		getWarnMsg (gpId, 3);
		weatherData();
		getEchartData();
		dataMonitoring (spCode);
		dataCollection(gpId);
		currentFrame = objArr[8];
		buildLight1(currentFrame);
		pageEvent();
	}
	//挠度页面清除数据
	function deletePageSecondData(){
		//清除传感器
		sensorList0.forEach(item => {
			item.forEach(ele => {
				scene.remove(ele.node);
			})
		})
		sensorList1.forEach(item => {
			item.forEach(ele => {
				scene.remove(ele.node);
			})
		})
		sensorList2.forEach(item => {
			item.forEach(ele => {
				scene.remove(ele.node);
			})
		})
		pageDataDelete();
	}
	//应力页面加载数据
	function pageThirdData(){
		gpId = 40;
		spCode = 101;
		sessionStorage.setItem('currentPage', 2)
		chartOption.yAxis.name = "应力（kN）";
		chartOption.grid.top = "110";
		chartOption.grid.bottom = "20";
		$('.echartTitle').text('应力-时间曲线图');
		weatherData();
		getWarnMsg (gpId, 3);
		getEchartData();
		dataMonitoring(spCode);
		dataCollection(gpId);
		currentFrame = objArr[2];
		buildLight3(currentFrame);
		pageEvent();
	}
	//应力页面清除数据
	function deletePageThirdData(){
		//清除传感器
		sensorList3.forEach(item => {
			scene.remove(item.node);
		})
		chartOption.grid.top = "85";
		chartOption.grid.bottom = "50";
		pageDataDelete();
	}
	//位移页面加载数据
	function pagefourthData(){
		gpId = 42;
		spCode = 7;
		sessionStorage.setItem('currentPage', 3);
	    chartOption.yAxis.name = "位移（mm）";
		$('.echartTitle').text('位移-时间曲线图');
		weatherData();
		getWarnMsg (gpId, 3);
		getEchartData();
		dataMonitoring(spCode);
		dataCollection(gpId);
		currentFrame = objArr[2];
		buildLight4(currentFrame);
		pageEvent();
		
	}
	//位移页面清除数据
	function deletePagefourthData(){
		//清除传感器
		sensorList4.forEach(item => {
			scene.remove(item.node);
		})
		pageDataDelete();
	}
	function pageDataDelete() {
		if(webSocket){
			webSocket.close(3000);
		}
		// 信息牌清除
		scene.remove(linkSensorLine);
		$('.sensorData').css('display', 'none');
		cxt.clearRect(0,0,c.width,c.height);  
		//清除传感器
		sensorList3.forEach(item => {
			scene.remove(item.node);
		})
		sessionStorage.setItem('currentPage', 0);
		let parent = $('.framelist')[0];
		parent.removeEventListener('click', changeFrame, false);
		$('.framelist>ul').html('');
		$('.warnMsg2 p').html('');
		$('.warnMsg2 table').html('');
		$('#d15MaxValue').text('···');
		$('#d15Speed').text('···');
		$('#h24MaxValue').text('···');
		$('#h24Speed').text('···');
		$('.echartTitle').text('···-时间曲线图');
		$('.frameCircle').text('···');
		$('.frameCircle+p').text(`中南大学体育馆第···榀桁架`);
		$('#allSensorNum').text('···');
		$('#allFrameNum').text('···');
		$('#allWarnNum').text('···');
		$('#allDataNum').text('···');
		window.removeEventListener('mousemove',mousemove);
		window.removeEventListener('mousedown',mousedown);
		//清除10分钟一次获取图表数据定时器
		chartOption.xAxis.data = [];
		chartOption.series = [];
		chartOption.yAxis.name = "";
		echart.setOption(chartOption, true);
		clearInterval(flashTimer);
		flashTimer = null;
		clearInterval(getEchartsTimer);
		frameList = [];
		animationId = null;
		getEchartsTimer = null;
		currentSensor = null;//显示信息的传感器
		currentFrame = null;//当前数据的桁架
		linkSensorLine = null;//信息牌连线
	}
	/**概括页面加载一次模型 */
	// 加载进度
    var onProgress = function onProgress(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            var percent = $("#loading");
			//percent.text('正在加载 ' + Math.round(percentComplete, 2) + '%');
			if( Math.round(percentComplete, 2) == 100) {
				objLoadNum++;
				if(objLoadNum == 9) {
					buildModel(frame);
					chargePage();
					console.log(scene.toJSON())
					localStorage.setItem('frame', scene.toJSON())
					console.log(localStorage.getItem('frame'))
					return true;
				}
			}
        }
	};
	function frameSetColor(group) {
		group.children.forEach((item) => {
			if(item.type == 'Group') {
				item.children.forEach((element) => {
					element.material = new THREE.MeshPhongMaterial({
						emissive: 'orange',
						transparent: true,
						opacity: 0.5
					})
				})
			}
		})
	}
	//加载obj模型
    var onError = function(xhr) {};
	var objLoader = new THREE.OBJLoader();
    loadModel('f0.obj',onProgress).then(group =>{
		frameSetColor(group);
		let head =  new THREE.Group();
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
            head.add(f);
        }
		thing.add(head);
    }) 
    loadModel('f2.obj',onProgress).then(group =>{
		frameSetColor(group);
        for(let i = 0; i < 18; i++){
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
        thing.add(left);
        let right = left.clone()
        right.position.z = -150;
        right.position.x = 65;
		thing.add(right);
		
        for(let j=0; j < 10; j++) {
            let a = group.clone();
            a.position.x = -90 + 16.2*j
            a.position.z = -112;
            a.scale.set(0.002,0.00165,0.002);
            behind.add(a);
        }
		thing.add(behind);
		
        for(let j=0; j < 12; j++) {
            if(j !=1&&j!=2) {
                let a = group.clone();
                a.position.x = 65 - 15*j
                a.position.z = 85;
                head.add(a);
            };
        }
		thing.add(head);
		
        for(let k=0; k < 2; k++) {
            let a = group.clone();
            a.position.x = 64;
            a.position.y = 35.5;
            a.position.z = -112  +3.8*k;
            a.rotation.z = 1.57;
            a.scale.set(0.001,0.0073,0.001);
            head.add(a);
        }
		thing.add(head);
		
        for(let k=0; k < 10; k++) {
            let a = group.clone();
            a.position.x = 56.5 - 16.2*k;
            a.position.y = 36;
            a.position.z = -112;
            a.rotation.x = 1.57;
            a.scale.set(0.0005,0.00032,0.002);
            head.add(a);
        }
		thing.add(head);
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
        thing.add(left);

        let right = left.clone()
        right.position.z = -146.2;
        right.position.x = 55;
        thing.add(right);
    });
    loadModel('c.obj',onProgress).then(group =>{
        let left = new THREE.Group();
        for(let i = 0; i < 3; i++){
            let c = group.clone();
            c.position.x = -44.5;
            c.position.y = 44.6 - 1.8*i;
			c.position.z = 87.5 - 15.3*i;
            left.add(c);
            thing.add(left);
        }
        left.position.z = -146.5;
        left.position.x = -55;

        let right = left.clone()
        right.position.z = -146.5;
        right.position.x = 110.6;
        thing.add(right);
    })
    loadModel('d.obj',onProgress).then(group =>{
        let head = new THREE.Group();
        for(let i = 0; i < 20; i++){
            let d = group.clone();
            d.position.x = 59.5 - 8*i;
            d.position.y = 31.65;
			d.position.z = -104;
			d.scale.set(0.002,0.0022,0.002);
            head.add(d);
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
            head.add(d);
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
        thing.add(head);
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
        thing.add(behind);
    })
    function loadModel(fileName, progress) {
        return new Promise((reslove, reject) => {
            objLoader.load('../resource/'+ fileName, function(object) {
                let group = new THREE.Group();
                group.add(object);
                var texture = new THREE.TextureLoader().load( "../img/map1.png" );
                texture.wrapS = THREE.MirroredRepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(100, 100);
                object.children.forEach(function(element) { 
                    element.material =  new THREE.MeshPhongMaterial( { color: '#e6e6e6', map:texture, transparent: true, opacity: 1} )
                    var edges = new THREE.EdgesGeometry(element.geometry);
                    var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: '#eee' } ) );
		            //自行调整模型比例
					line.visible = false;
                    group.add(line);
                });
                reslove(group);
                group.scale.set(0.002,0.002, 0.002);
           },progress, onError);
        }); 
	}
	// 加入到场景中
	function buildModel(obj) {
        obj.position.z = 65.35;
		for(let i = 0; i < 12;i++) {
			objArr[i] = obj.clone(true);
			if(i <= 8) {
				objArr[i].position.z = 65.35- 15.35*i;
			}else{
				objArr[i].position.y = - 1.8*(i-8);
				objArr[i].position.z = 65.35 - 15.34*i;
			}
			objArr[i].name = (i+1)+'P';
			thing.add(objArr[i]);
		}
		objArr.forEach((item, i) => {
			let pos = item.position.clone();
			pos.y = pos.y + 45;
			pos.z = pos.z + 10;
			pos.x = pos.x - 110;  
			pos.y = pos.y;
			pos.z = pos.z;
			pos.x = pos.x;  
			var material = new THREE.SpriteMaterial({map: createTextTexture({
				text:`${i+1}P`,
				color: '#fff',
				bgColor: 'rgba(65,221,156,0.6)',
				borderColor: 'orange'
				})
			});
			var sprite = new THREE.Sprite(material);
			sprite.position.y =pos.y;
			sprite.position.z =pos.z;
			sprite.position.x =pos.x;
			sprite.scale.set(8,8,8);
			scene.add( sprite );
			//创建canvas贴图
			function createTextTexture(obj) {
				let canvas = document.createElement("canvas");
				canvas.width=obj.width||512;
				canvas.height=obj.height||256;
				let ctx = canvas.getContext("2d");
				ctx.textAlign= "center";
				canvas.border='none'
				ctx.lineWidth = '4';
				ctx.fillStyle = obj.bgColor||"rgba(225,225,225,0.5)";
				ctx.strokeStyle =obj.borderColor||"red";
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(0,256);
				ctx.lineTo(512,256);
				ctx.lineTo(512,0);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				
				ctx.beginPath();
				ctx.font = obj.font||"Bold 200px Arial";
				ctx.fillStyle = obj.color||"#000";
				ctx.fillText(obj.text, 250, 200);
				ctx.closePath();
				ctx.fill();
				let texture = new THREE.Texture(canvas);
				texture.needsUpdate = true;
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				return texture;
			}
		})
		//把模型thing加入场景
		scene.add(thing);
	}
    //3D场景初始化
    function init3DScene() {
		    //创建一个透视相机，设置相机视角60度，最远能看1000，最近能看1
		    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
			//camera.position.set( 0, 150, 280 );    //设置相机位置
			camera.position.set( -230, 150, 0 ); 
		    //创建场景
		    scene = new THREE.Scene();
		    //场景中添加网格辅助
			// var polarGridHelper = new THREE.PolarGridHelper( 300, 64, 20, 64, '#41dd9c', '#3299cc' );
			// polarGridHelper.position.y = -30;
			// scene.add( polarGridHelper );
			let grid = new THREE.GridHelper( 800, 50, 0x38b0de, 0x38b0de);
			grid.position.x = -30;
			scene.add( grid );
			// 给场景添加一个环境光
		    let ambientLight = new THREE.AmbientLight( 0x888888);
		    scene.add( ambientLight );
			// 给场景添加一个平行光出来
		    let dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
			//  dirLight.color.setHSL( 0.1, 1, 0.95 );
		    dirLight.position.set( -1, 1.75, 1 );
		    dirLight.position.multiplyScalar( 30 );
		//     scene.add( dirLight );
		    //实例化一个渲染器s
		    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		    renderer.setPixelRatio( window.devicePixelRatio );
		    renderer.setSize( window.innerWidth, window.innerHeight);
			// renderer.setClearColor( 0xffffff, 0.1);   
		    document.body.appendChild( renderer.domElement );
		    //控制相机
		    controls = new THREE.OrbitControls( camera, renderer.domElement);
			controls.enableZoom = true;
			//设置相机移动距离
		    controls.minDistance = 100;
		    controls.maxDistance = 1000;
			// 使动画循环使用时阻尼或自转 意思是否有惯性
			controls.enableDamping = true;
			//动态阻尼系数 就是鼠标拖拽旋转灵敏度
			controls.dampingFactor = 0.4;
		    window.addEventListener( 'resize', onWindowResize, false );
			// bulidPlane();
			function bulidPlane() {
				let plane = new THREE.PlaneGeometry(400,350);
				let material = new THREE.MeshPhongMaterial({color: "#eee", side: THREE.DoubleSide,transparent: true,opacity: 0.1});
				let mesh = new THREE.Mesh(plane, material);
				mesh.rotation.x = -1.57;
				scene.add(mesh);
			}
			composerPass(renderer);
	}
	//后期通道
	function composerPass(renderer) {
        composer = new THREE.EffectComposer(renderer);//通道组合器
        var renderPass = new THREE.RenderPass( scene, camera );//渲染一个新环境
        // 外边框outLine
        outLineColor = new THREE.OutlinePass( 
            new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera);
        outLineColor.visibleEdgeColor.set( 'orangered' );
        outLineColor.edgeStrength = 8;

        //场景发光
        bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ))
        bloomPass.exposure =1;
        bloomPass.threshold = 0;
        bloomPass.strength = 0.3;
        bloomPass.radius = 1;
        // bloomPass.enabled  = false;
            
        //抗锯齿SMAAShader
        SMAAShader= new THREE.SMAAPass( window.innerWidth,  window.innerHeight );
        SMAAShader.renderToScreen = true;

        composer.addPass( renderPass );
        composer.addPass( bloomPass );
        composer.addPass(outLineColor);
        composer.addPass( SMAAShader );

	}
	//初始化性能插件
	initStats();
    function initStats() {
        stats = new Stats();
        document.body.appendChild(stats.dom);
    }
	//渲染
	animate();
    function animate() {
        //每帧额外的运算
		//更新性能插件
		stats.update(); 
        controls.update();
		// renderer.render(scene, camera);
		composer.render();
		composer.autoClear = false; 
        requestAnimationFrame(animate);
	}
	//天空盒设置参数：'dark','sky','star'
	setSkyBox('dark');
	function setSkyBox(type) {
		var loader = new THREE.TextureLoader();
		var skyBox = new THREE.BoxGeometry(15000,15000,15000);
		var rootPath = '../img/';
		var imgNameArr = ['_posx','_negx','_posy','_negy','_posz','_negz'];
		var format = '.jpg';
		var materialArr = [];
		for(let i=0; i< imgNameArr.length;i++) {
			materialArr.push(new THREE.MeshBasicMaterial({map:loader.load(rootPath+type+imgNameArr[i]+format),side: THREE.DoubleSide}));
		}
		sky = new THREE.Mesh(skyBox, materialArr);
		scene.add(sky);
	}
	//根据屏幕高度等比例缩放
	initPage();
	function initPage(){
		let scaling = window.innerHeight/1041;
		if(scaling < 1.5&& scaling > 0.5){
			$('.pageLeft').css('transform','scale('+scaling+')');
			$('.pageRight').css('transform','scale('+scaling+')');
			$('.pageRight').css('right',scaling*398+'px');
			$('.header').css('transform', 'scale('+scaling+')');
			$('.nav').css({
				'transform': 'scale('+scaling+')',
				'top': scaling*33+'px',
				'right': scaling*60 + 'px'
			});
			$('.bottomLine').css('top', scaling*100 + 'px')
		}
	}
    function onWindowResize() {
		    camera.aspect = window.innerWidth / window.innerHeight;
		    camera.updateProjectionMatrix();
		    renderer.setSize( window.innerWidth, window.innerHeight );
			initPage();
    }
    //每帧额外的运算 传感器信息牌位置变化
    function render() {
        //获取到窗口的一半高度和一半宽度
        let halfWidth = window.innerWidth / 2;
		let halfHeight = window.innerHeight / 2;  
		let point = {};
		if(currentSensor == null) return;
		point.x = currentSensor.position.clone().x;
		point.z = currentSensor.position.clone().z;
		let pos = new THREE.Vector3( point.x, 70, point.z+30);
		let vector = pos.project(camera);
		$(".sensorData").css({
			left:vector.x * halfWidth + halfWidth,
			top:-vector.y* halfHeight + halfHeight-100
		}) 
		stats.update(); 
		animationId = requestAnimationFrame(render);
	} 
	//创建连线
	function linkLine() {
		var material = new THREE.LineBasicMaterial({color: 0x7fff00});
		var geometry = new THREE.Geometry();
		let point = {};
		point.x = currentSensor.position.clone().x;
		point.z = currentSensor.position.clone().z;
		geometry.vertices.push(
			currentSensor.position,
			new THREE.Vector3( point.x, 70, point.z+15),
			new THREE.Vector3( point.x, 70, point.z+30))
		scene.remove(linkSensorLine);
		linkSensorLine = new THREE.Line( geometry, material );
		scene.add( linkSensorLine );
	}
	//双击信息牌隐藏
	$('.sensorData')[0].addEventListener('dblclick', function () {
		$('.sensorData').css('display', 'none');
		scene.remove(linkSensorLine);
	},false);
	//获取事件操作对象
	function getSelsectOBj(mouse,raycaster, e) {
		//将html坐标系转化为webgl坐标系，并确定鼠标点击位置
		mouse.x =  e.clientX / renderer.domElement.clientWidth*2-1;
		mouse.y =  -(e.clientY / renderer.domElement.clientHeight*2)+1;
		//以camera为z坐标，确定所点击物体的3D空间位置
		raycaster.setFromCamera(mouse,camera);
		//确定所点击位置上的物体数量
		let intersects = raycaster.intersectObjects(scene.children, true);
		return intersects;
	}
	//动态时间加载
	setInterval(function(){
		let nowTime = new Date().getTime();
		nowTime = new Date(nowTime).Format('yyyy-MM-dd HH:mm:ss');
		$('.header .time').text(nowTime);
	}, 1000)
/** 公用函数 */
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
			   let weather = data.HeWeather6[0].now;
			   $('#cond_txt').text(weather.cond_txt);
			   $('#wind_dir').text(weather.wind_dir);
			   $('#wind_sc').text(weather.wind_sc+'级');
			   $('#tmp').text(weather.tmp+'°C');
			   $('#wind_spd').text(weather.wind_spd+'km/h');
			   $('#hum').text(weather.hum+'%');
			   $('#pcpn').text(weather.pcpn);
		   }
	   });
   }
	//监测信息getGPCountByPmId
	function dataMonitoring(spCode) {
		if(spCode != null) {
			getData("get", "/echart/selectCsuProjectGp/4/"+spCode, {}).then((res) => {
				frameList = res.data;
				if(spCode != 0) {
					frameControl(frameList);
					gpId = frameList[0].gp_id;
					webSocketData();
				}
			});
			getData("get", "/echart/getGPCountByPmId/4/"+spCode, {}).then((res) => {
				let ulHtml = '';
				$('#allFrameNum').text(res.data);
			});
			getData("get", "/echart/getSensorCountByPmId/4/"+spCode, {}).then((res) => {
				let sensorNum = res.data;
				$('#allSensorNum').text(sensorNum);
			});
			getData("get", "/echart/getDatasCountByPmId/4/"+spCode, {}).then((res) => {
				let dataNum = res.data;
				if(res.data > 10000) {
					dataNum = Math.round(res.data/10000) + '万';
				}
				$('#allDataNum').text(dataNum);
			});
			getData("get", "/echart/getWarnCountByPmId/4/"+spCode, {}).then((res) => {
				let warnNum = res.data;
				$('#allWarnNum').text(warnNum);
				loadClose('load4');
			});
		}
		
	}
	//监测详情
	function monitoringDetail(spCode) {
		getData("get", "/echart/getGPCountByPmId/4/"+spCode, {}).then((res) => {
			let ulHtml = '';
			$('#frameNum').text(res.data);
		});
		getData("get", "/echart/getSensorCountByPmId/4/"+spCode, {}).then((res) => {
			let sensorNum = res.data;
			$('#sensorNum').text(sensorNum);
		});
		getData("get", "/echart/getDatasCountByPmId/4/"+spCode, {}).then((res) => {
			let dataNum = res.data;
			if(res.data > 10000) {
				dataNum = Math.round(res.data/10000) + '万';
			}
			$('#dataNum').text(dataNum);
		});
		getData("get", "/echart/getWarnCountByPmId/4/"+spCode, {}).then((res) => {
			let warnNum = res.data;
			$('#warnNum').text(warnNum);
		});
	}
	//预警信息 
	function getWarnMsg (gpId, size) {
		let warnDom1 = gpId == 0?$('.warnMsg1 p'):$('.warnMsg2 p');
		let warnDom2 = gpId == 0?$('.warnMsg1 table'):$('.warnMsg2 table');
		getData("get","/echart/selectLatelyWarnInfo/"+gpId+'/'+ size,{}).then((res) => {
			loadClose('load1');
			loadClose('load2');
			if(res.data == null) {
				warnDom1.text(res.message);
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
					html += `<tr><td>${item.pt_name.substr(0,8)}</td>
							<td>${item.grade}级</td>
							<td>${item.event_intime.substr(0,10)} ${item.event_intime.substr(11,8)}</td>
							<td>${item.event_recovertime != undefined?item.event_recovertime.substr(0,10)+' '+item.event_recovertime.substr(11,8):'未恢复'}</td></tr>`
				})
				warnDom1.css('display', 'none');
				warnDom2.css('display', 'block');
				warnDom2.html(html);
			};
		})
	}
/** 挠度页面函数 */
	//传感器模型0
	function buildLight0(frame) {
		sensorList0[0].forEach((item, j) => {
            let pos = frame.position.clone();
            pos.x = pos.x -94 + j*78;
            pos.y = pos.y + 39.4;
            pos.z = pos.z + 9.5;
            positionSensor(item, pos.x, pos.y, pos.z);
        })
	} 
	//传感器模型1
	function buildLight1(frame) {
        sensorList1[0].forEach((item, j) => {
            let pos = frame.position.clone();
            pos.x = pos.x - 100 + j*83;
            pos.y = pos.y + 46.7;
            pos.z = pos.z + 5.5;
            positionSensor(item, pos.x, pos.y, pos.z);
        })
        sensorList1[1].forEach((item, j) => {
            let pos = frame.position.clone();
            pos.x = pos.x -94 + j*78;
            pos.y = pos.y + 39.4;
            pos.z = pos.z + 9.5;
            positionSensor(item, pos.x, pos.y, pos.z);
        })
	} 
    //传感器模型2
    function buildLight2(frame) {
        sensorList2[0].forEach((item, j) => {
            let pos = frame.position.clone();
            pos.x = pos.x - 100 + j*41.5;
            pos.y = pos.y + 46.7;
            pos.z = pos.z  + 5.5;
            positionSensor(item, pos.x, pos.y, pos.z);
        })
        sensorList2[1].forEach((item, j) => {
            let pos = frame.position.clone();
            pos.x = pos.x - 100 + j*41.5;
            pos.y = pos.y + 46.7;
            pos.z = pos.z + 13;
            positionSensor(item, pos.x, pos.y, pos.z);
        })
        sensorList2[2].forEach((item, j) => {
            let pos = frame.position.clone();
            pos.x = pos.x - 94 + j*78;
            pos.y = pos.y + 39.4;
            pos.z = pos.z + 9.5;
            positionSensor(item, pos.x, pos.y, pos.z);
        })
	} 
	//应力监测传感器模型3
	function buildLight3(frame) {
        sensorList3.forEach((item, j) => {
            let pos = frame.position.clone();
			if(j < 2) {
				pos.x = pos.x - 100;
				pos.y = pos.y + 46.7;
				pos.z = pos.z + 5.5+ j*8;
				positionSensor(item, pos.x, pos.y, pos.z);
			}else if(j>=2&&j<4){
				pos.x = pos.x - 97.5;
				pos.y = pos.y + 43;
				pos.z = pos.z + 7.5+ (j-2)*4;
				positionSensor(item, pos.x, pos.y, pos.z);
			}else if(j>=4&&j<6){
				pos.x = pos.x - 15.75;
				pos.y = pos.y + 46.7;
				pos.z = pos.z + 5.5+ (j-4)*8;
				positionSensor(item, pos.x, pos.y, pos.z);
			}else if(j>=6&&j<7) {
				pos.x = pos.x - 15.75;
				pos.y = pos.y + 39.5;
				pos.z = pos.z + 9.5;
				positionSensor(item, pos.x, pos.y, pos.z);
			}else if(j>=7&&j<9) {
				pos.x = pos.x + 66;
				pos.y = pos.y + 46.7;
				pos.z = pos.z + 5.5+ (j-7)*8;
				positionSensor(item, pos.x, pos.y, pos.z);
			}else if(j>=9&&j<11){
				pos.x = pos.x + 64.5;
				pos.y = pos.y + 43;
				pos.z = pos.z + 7.5+ (j-9)*4;
				positionSensor(item, pos.x, pos.y, pos.z);
			}
		})
	} 
	//位移监测传感器模型4
	function buildLight4(frame) {
        sensorList4.forEach((item, j) => {
            let pos = frame.position.clone();
			if(j < 2) {
				pos.x = pos.x - 100;
				pos.y = pos.y + 46.7;
				pos.z = pos.z + 5.5+ j*8;
				positionSensor(item, pos.x, pos.y, pos.z);
			}else{
				pos.x = pos.x + 66;
				pos.y = pos.y + 46.7;
				pos.z = pos.z + 5.5+ (j-2)*8;
				positionSensor(item, pos.x, pos.y, pos.z);
			}
		})
	} 
    //clone传感器
    function positionSensor(sensor, x, y, z) {  
        var sphere = new THREE.SphereGeometry(1,110,140);
        var MeshPhongMaterial = new THREE.MeshBasicMaterial({color: '#fff', transparent: true, opacity: 0.5});
        mesh = new THREE.Mesh(sphere, MeshPhongMaterial);
		sensor.node = mesh.clone(true);
        sensor.node.position.x = x;
        sensor.node.position.y = y;
        sensor.node.position.z = z;
		sensor.node.scale.set(0.1,0.1,0.1);
		sensor.node.name = 'sensor';
        scene.add(sensor.node);
    }
	 //球体闪灯
	function sensorFlashLight(sensorList) {
		let flashColor = "#fff";
		let flag = false;
		if(flashTimer !== null) {
			clearInterval(flashTimer);
			flashTimer = null;
		}
		flashTimer = setInterval(() => {	
			flag = !flag;
			if(spCode == 90&& sensorList[0] instanceof Array) {
				sensorList.forEach( item => {
					item.forEach((child) => {
						if(flag){
							child.node.scale.set(1.5,1.5,1.5);
							child.node.material = new THREE.MeshBasicMaterial({color: child.color});
						}else{
							child.node.scale.set(0.5,0.5,0.5);
							child.node.material = new THREE.MeshBasicMaterial({color: '#eee',transparent: true, opacity: 0.1});
						}
					})
				})
			}else if(spCode != 90&&!(sensorList[0] instanceof Array)){
				sensorList.forEach( item => {
					if(flag){
						item.node.scale.set(1.5,1.5,1.5);
						item.node.material = new THREE.MeshBasicMaterial({color: item.color});
					}else{
						item.node.scale.set(0.5,0.5,0.5);
						item.node.material = new THREE.MeshBasicMaterial({color: '#eee',transparent: true, opacity: 0.1});
					}
				})
			}else{
				clearInterval(flashTimer);
				if(webSocket){
					webSocket.close(1000);
				}//切换过快导致webScoket连接失败后重连webScoket
				console.log('已重连webScoket');
			}
		 }, 500)
	}
	function pageEvent() {
		window.addEventListener("mousemove",mousemove, false);//页面绑定鼠标点击事件
		window.addEventListener("mousedown",mousedown, false);//页面绑定鼠标点击事件
	}
	//移动事件执行函数
	function mousemove(e){
		let raycaster = new THREE.Raycaster();//光线投射，用于确定鼠标点击位置
		let mouse = new THREE.Vector2();//创建二维平面
		let intersects = getSelsectOBj(mouse,raycaster, e);
		//选中后进行的操作
		if(intersects.length > 0){
			if(intersects[0].object.name == 'sensor') {
				let frameNum = currentFrame.name.length == 2? currentFrame.name.substr(0,1):currentFrame.name.substr(0,2);
				let list = null;
				if(frameNum < 10) {
					if(spCode == 90){
						list = sensorList1;
					}
					if(spCode== 101) {
						list = sensorList3;
					}
					if(spCode== 7) {
						list = sensorList4;
					}
				}else if(frameNum >= 10&& frameNum < 12){
					list = sensorList2;
				}else if(frameNum == 12){
					list = sensorList0;
				}
				if(spCode != 90) {
					list.forEach(item => {
						if(intersects[0].object.uuid == item.node.uuid) {
							if(intersects[0].object.uuid == item.node.uuid) {
								selectedSensor(item);
							}
						}
					})
				}else{
					list.forEach(item => {
						item.forEach(element => {
							if(intersects[0].object.uuid == element.node.uuid) {
								if(intersects[0].object.uuid == element.node.uuid) {
									selectedSensor(element);
								}
							}
						})
					})
				}
				function selectedSensor(selected) {
					let unit = spCode == 101?'kN':'mm';
					$('.sensorData').css('display', 'block');
					$('#sensorName').text(selected.name);
					$('#sensorStatus').text(selected.status);
					if(selected.data != null){
						$('#sensorValue').text(selected.data + unit);
						$('.sensorData ul li').eq(3).css('display', 'block');
					}else {
						$('.sensorData ul li').eq(3).css('display', 'none');
					}
					currentSensor = selected.node;
					linkLine();
					cancelAnimationFrame(animationId);
					animationId = requestAnimationFrame(render);
					return true;
				}
			}
		}
	}
	//点击事件执行函数framelist
	function mousedown(e) {
		let raycaster = new THREE.Raycaster();//光线投射，用于确定鼠标点击位置
		let mouse = new THREE.Vector2();//创建二维平面
		let intersects = getSelsectOBj(mouse,raycaster, e);
		if(intersects.length > 0){
			SELECTED = intersects[0].object.parent;
			let intersected = intersects[0].object.parent;
		}
	}
	//桁架按钮生成和控制
	function frameControl(frameList) {
		let parent = $('.framelist ul')[0];
		let ulHtml = '';
		frameList.forEach((element, i) => {
			if(element.gp_id == gpId) {
				ulHtml += `<li class="selected">${element.gp_text}</li>`;
				$('.frameCircle').text(element.gp_text);
				$('.frameCircle+p').text(`中南大学体育馆第${element.gp_text.substr(0,1)}榀桁架`);
				loadClose('load6');
			}else {
				ulHtml += `<li>${element.gp_text}</li>`;
			}
		});
		$('.framelist>ul').html(ulHtml);
		parent.addEventListener('click',changeFrame, false); 
	}
	function changeFrame(e){
		//点击当前桁架不重加载
		if(e.target.innerText == currentFrame.name||e.target.children.length > 0) {
			return false;
		}
		loadClose('load');
		loadClose('load3');
		loadClose('load5');
		loadClose('load6');
		loadOpen('load', $('.echartWarpper'));
		loadOpen('load3', $('.sensorInfo'));
		loadOpen('load5', $('.frameStatus'));
		let liNode = $('.framelist ul .selected')[0];
		liNode.classList.remove('selected');
		e.target.classList.add('selected');
		$('.frameCircle').text(e.target.innerText);
		$('.frameCircle+p').text(`中南大学体育馆第${e.target.innerText.substr(0,1)}榀桁架`);
		frameList.forEach((item) => {
			if(item.gp_text == e.target.innerText) {
				gpId = item.gp_id
			}
		})
		sensorList4.forEach((item, i) => {
			if(gpId == 42&&spCode == 7) {
				sensorList4[i].senCode = senCodeArr3[i];
			}else{
				sensorList4[i].senCode = senCodeArr6[i];
			}
		})
		setTimeout(()=> {
			getWarnMsg (gpId, 3);
			initData(e.target.innerText, linkSensorLine);
			getEchartData();
			dataCollection(gpId);
			setTimeout(()=> {
				if(webSocket){
					webSocket.close(1000);
				}
			}, 100)
		}, 100)
		e.stopPropagation();
	}
	//切换桁架更新数据
	function initData(frameName, linkSensorLine) {
		scene.remove(linkSensorLine);
		$('.sensorData').css('display', 'none');
		cxt.clearRect(0,0,c.width,c.height); 
		clearInterval(flashTimer);
		flashTimer = null;
		//清除传感器
		sensorList0.forEach(item => {
			item.forEach(ele => {
				scene.remove(ele.node);
			})
		})
		sensorList1.forEach(item => {
			item.forEach(ele => {
				scene.remove(ele.node);
			})
		})
		sensorList2.forEach(item => {
			item.forEach(ele => {
				scene.remove(ele.node);
			})
		})
		sensorList3.forEach(item => {
			scene.remove(item.node);
		})
		sensorList4.forEach(item => {
			scene.remove(item.node);
		})
		//重新生成传感器
		if(frameName.length == 2) {
			frameId = frameName.substr(0,1)*1-1;
		} else {
			frameId = frameName.substr(0,2)*1-1;
		}
		//重新生成传感器
		let len = frameName.length == 2? 2:3;
		if(len == 3&&frameId != 11) {
			currentFrame = objArr[frameId];
			buildLight2(currentFrame);
		}else if(len == 2){
			if(spCode == 7) {
				currentFrame = objArr[frameId];
				buildLight4(currentFrame);
			}else{
				currentFrame = objArr[frameId];
				buildLight1(currentFrame);
			}
		}else if(frameId == 11) {
			currentFrame = objArr[frameId];
			buildLight0(currentFrame);
		}
		//相机看向该桁架
		let pos = currentFrame.position.clone();
		// camera.position.set(pos.x-200,pos.y+100,pos.z-50);
	}
	//10分钟获取一次图表数据
	function getEchartData() {
		echartDom = document.getElementById('dataEchart');
		echart = echarts.init(echartDom);
		let echartStartTime = null;
		echart.setOption(chartOption, true);
		//窗口变化改变图表大小
		window.addEventListener('resize', function (e) {
			echart.resize();
		}, false); 
		let echartEndTime = new Date().getTime();
		echartEndTime = new Date(echartEndTime).Format('yyyy-MM-dd HH:mm:ss');
		//第一次加载
		getData("post", "/echart/getEchartData", {"gpId": gpId, end: echartEndTime}).then((res) => {
			loadClose('load', $('.echartWarpper'));
			let len = res.list.length;
			// chartOption.yAxis.name = res.senType.spOrdinate;
			// document.getElementsByClassName("echartTitle")[0].innerText = res.senType.spTitle;
			chartOption.xAxis.data = res.xdata;
			chartOption.series = [];
			chartOption.legend.data = [];
			for(let i=0; i<len; i++){
				let seriesRoot = {name: " ", type: "line", data:[]};
				chartOption.series[i] = seriesRoot;
				chartOption.legend.data[i] = res.list[i].sensorName;
				chartOption.series[i].name = res.list[i].sensorName;
				for(let j=0; j<res.list[i].data.length; j++){
					chartOption.series[i].data[j] = res.list[i].data[j].deflection;
				}
			}
			echartStartTime = res.nextStart;
			echart.setOption(chartOption, true);
			if(getEchartsTimer) {
				clearInterval(getEchartsTimer);
				getEchartsTimer = null;
			}
			//第n次加载
			getEchartsTimer = setInterval(function () {
				echartEndTime = new Date(echartStartTime).getTime();
				echartEndTime = new Date(echartEndTime + 10*60*1000).Format('yyyy-MM-dd HH:mm:ss');
				getData("post", "/echart/getEchartData", {"gpId": gpId, start: echartStartTime, end: echartEndTime}).then((res) => {
					for (var i in res.list) {
						chartOption.xAxis.data.splice(0, 1);
						chartOption.xAxis.data.push(res.list[i].data[0].daUnixtime);
						chartOption.series[i].data.splice(0, 1);
						chartOption.series[i].data.push(res.list[i].data[0].deflection);
					}
					echartStartTime = res.nextStart;
					echart.setOption(chartOption, true);
				});
			}, 60000*10)
		});		
	}
	//数据采集频率
	function dataCollection(gpId) {
		let unit = "";
		if(spCode == 101) {
			unit = "kN";
		}else{
			unit = "mm";
		}
		getData("get", "/echart/get24HoursMaxMinSpeed/" + gpId, {}).then((res) => {
			if(res.data) {
				let h24MaxValue = res.data.h24MaxValue + unit;
				let h24Speed =  res.data.h24Speed  + unit;
				$('#h24MaxValue').text(h24MaxValue);
				$('#h24Speed').text(h24Speed);
			} else {
				$('#h24MaxValue').text(res.message);
				$('#h24Speed').text(res.message);
			}
		});
		getData("get", "/echart/get15DayMaxMinSpeed/" + gpId , {}).then((res) => {
			if(res.data) {
				let d15MaxValue = res.data.d15MaxValue + unit;
				let d15Speed =  res.data.d15Speed  + unit;
				$('#d15MaxValue').text(d15MaxValue);
				$('#d15Speed').text(d15Speed);
			}else {
				$('#d15MaxValue').text(res.message);
				$('#d15Speed').text(res.message);
			}
			loadClose('load3');
		});
	}
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
	//实时桁架状态
	function drawLine(data) {
		cxt.clearRect(0,0,c.width,c.height);  
		let warnValue = 0;
		data.forEach(item =>{
			item.data.forEach(element =>{
				if(element.deflection != undefined&&element.deflection != null&&spCode ==90){
					let warnValue = element.deflection*1;
					if(warnValue < 300 && warnValue > -300) {
						let warnPoint = 60 - warnValue/30;
						cxt.lineWidth = 1;
						cxt.strokeStyle = '#41dd9c';
						cxt.beginPath();
						cxt.moveTo(0,60);
						cxt.quadraticCurveTo(60,warnPoint,120,60);
						cxt.stroke();
						cxt.closePath();
					} else {
						if(warnValue > 600 || warnValue <-600){
							warnValue = warnValue > 0?500:-500;
						}
						let warnPoint = 120 - warnValue/10;
						cxt.lineWidth = 1;
						cxt.strokeStyle = 'orangered';
						cxt.beginPath();
						cxt.moveTo(0,60);
						cxt.quadraticCurveTo(60,warnPoint,120,60);
						cxt.stroke();
						cxt.closePath();
					}
				}
			})
		})
		loadClose('load5');
	}
	//webSocketData实时数据推送
	function webSocketData () { 
		if (!webSocket) {
			// 如果网站是 https 则对应 wss
			// 如果网站是 http 则对应 ws 即可
			// webSocket = new WebSocket('ws://118.25.55.220:9001/websocket/'+ gpId);
			webSocket = new WebSocket('ws://118.25.55.220:8082/websocket/'+ gpId);
			// 建立 websocket 连接成功触发事件
			webSocket.onopen = function () {
				// console.log("websoket服务器连接成功...");
			};
			// 接收服务端数据时触发事件
			webSocket.onmessage = function (evt) {
				var res =JSON.parse(evt.data);
				drawLine(res);
				switch(res.length) {
					case 1:if(spCode == 101) {
								lightStatus(res, sensorList3);
							}else if(spCode == 7){
								lightStatus(res, sensorList4);
							}else{
								lightStatus(res, sensorList0);	
							};
						break;
					case 2:lightStatus(res, sensorList1);;break;
					case 3:lightStatus(res, sensorList2);;break;
				}
				//传感器闪灯和当前数据
				function lightStatus(res, sensorList) {
					let count = 0;
					if(spCode !=90) {
						res[0].data.forEach(function(item, i){
							sensorList.forEach((element, j) => {
								if(item.senCode == element.senCode) {
									saveInfo(sensorList[j], item);
								}
							})
						})	
						sensorFlashLight(sensorList);	
					}else {
						res.forEach(function(item, i){
							item.data.forEach(function (value, j){
								saveInfo(sensorList[i][j], value);
							})
						})
						sensorFlashLight(sensorList);		
					}
					function saveInfo(sensor, sensorData) {
						switch(sensorData.status){
							case 1:
								sensor.status = '在线';
								sensor.color = '#7fff00';
								break;
							case 2: 
								sensor.status = '故障';
								sensor.color = '#666';
								break;
							case 3: 
								sensor.status = '预警';
								sensor.color = 'orange';
								break;
							case 4: 
								sensor.status = '告警';
								sensor.color = 'red';
								break;
							case 5: 
								sensor.status = '离线';
								sensor.color = '#fff';
								break;
						}
						sensor.name = sensorData.senName;
						if(sensorData.deflection) {
							sensor.data = sensorData.deflection;
						}
					}
				}
			};
			//关闭服务器时触发
			webSocket.onclose = function(evt){
				// console.log('webSocket关闭成功');
				webSocket = null;
				if(evt.code == 1000) {
					webSocketData();
				}
			}
		}
	}
	// 加载提示
	function loadOpen(className, parentDom,imgPath) {
		if(parentDom !=undefined) {
			parentDom.css('position', 'relative');
			let loadDom = document.createElement('div');
			parentDom.append(loadDom);
			loadDom.style.cssText = `
			width: ${parentDom.outerWidth()}px;background: rgba(225,225,225,0.1);
			height: ${parentDom.outerHeight()}px;text-align: center;
			position: absolute;top:0;left:0;z-index: 999`
			html = `<img src="${imgPath||'../img/load.gif'}" style="width: 30px; height: 30px;
			margin-top:${parentDom.outerHeight()/2-20}px" />`
			loadDom.innerHTML = html;
			loadDom.classList.add(className);
		}
		
	}
	function loadClose(className) {
		let child = document.getElementsByClassName(className)[0];
		if(child != undefined) {
			child.remove();
		}
	}
	function loadAnimation() {
		//切换时删除加载
		loadClose('load');
		loadClose('load1');
		loadClose('load2');
		loadClose('load3');
		loadClose('load4');
		loadClose('load5');
		loadClose('load6');
		setTimeout(() => {
			loadOpen('load', $('.echartWarpper'));
			loadOpen('load1', $('.warnMsg1'));
			loadOpen('load2', $('.warnMsg2'));
			loadOpen('load3',$('.sensorInfo'));
			loadOpen('load4', $('.dataInfo'));
			loadOpen('load5', $('.frameStatus'));
			loadOpen('load6', $('.currentFrame'));
		}, 300)
	}
})

