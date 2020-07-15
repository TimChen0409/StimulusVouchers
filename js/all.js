const myLocation = document.querySelector('#myLocation-btn');
const cities = document.querySelector('#cities');
const area = document.querySelector('#area');
const storeList = document.querySelector('#store-list');


// 初始化
const map = L.map('map', {
    center: [25.040065, 121.523235], // 台北市區的經緯度（地圖中心）
    zoom: 10, // 地圖預設尺度
    zoomControl: false // 是否顯示預設的縮放按鈕（左上角）

})
// 新增圖資圖層（OSM 圖資）
const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
L.tileLayer(osmUrl, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    minZoom: 8, // 最小縮放尺度
    maxZoom: 18 // 最大縮放尺度
}).addTo(map);


L.control.zoom({
    position: 'bottomright'
}).addTo(map);


L.control
    .locate({
        showPopup: false,
        position: "bottomright",
        locateOptions: {
            enableHighAccuracy: true //設置高精準度
        },
        icon:  "fas fa-crosshairs"
    })
    .addTo(map)
    .start();

axios.get("https://3000.gov.tw/hpgapi-openmap/api/getPostData")
    .then((res) => {
        function getUserLocation() {
            if (navigator.geolocation) {
                function showPosition(position) {
                    map.setView([position.coords.latitude, position.coords.longitude], 16);
                }
                function showError() {
                    console.log('抱歉，現在無法取的您的地理位置。')
                }

                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                console.log('抱歉，您的裝置不支援定位功能。');
            }
        }

        getUserLocation();

        ///處理地圖
        let data = res.data;
        var markers = new L.MarkerClusterGroup().addTo(map);
        data.forEach((item) => {

            //判斷標點顏色
            const iconColor = (() => {
                if (item.total != 0) {
                    return new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
                } else {
                    return new L.Icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
                }
            })();

            //群組標點.增加圖層(leaflet的標點([座標])).增加popup
            markers.addLayer(
                L.marker([item.latitude, item.longitude], {
                    icon: iconColor
                }).bindPopup(`<div>
            <h4 class="m-0 mb-2 bold">${item.storeNm}</h4>
            <p class="m-0 mb-2 h5 text-danger"><span class="bold">三倍券庫存量：</span>${item.total}</p>
            <a target="_blank" href="https://www.google.com.tw/maps/place/${item.addr}" class="m-0 mb-2 h6 text-dark underLine"><span class="bold">地址：</span>${item.addr}</a>                <p class="m-0 mb-2 h6"><span class="bold">電話：</span>${item.tel}</p>
            <p class="m-0 mb-2 h6"><span class="bold">營業時間：</span>${item.busiTime}</p>
            <p class="m-0 mb-2 h6"><span class="bold">數據更新時間：</span>${item.updateTime}</p>
            </div>`)
            );
        });
        map.addLayer(markers);

        //選取地區後的資料顯示
        cities.addEventListener('change', function () {
            let content = '';
            let str = '';
            data.forEach(item => {
                if (item.hsnNm == cities.value && item.townNm == area.value) {
                    content = `<li> <div class="card p-2 mb-2">
                <h4 class="btn btn-primary m-0 mb-2 bold">${item.storeNm}</h4>
                <p class="m-0 mb-2 h5 text-danger"><span class="bold">三倍券庫存量：</span>${item.total}</p>
                <a target="_blank" href="https://www.google.com.tw/maps/place/${item.addr}" class="m-0 mb-2 h6 text-dark underLine"><span class="bold">地址：</span>${item.addr}</a>
                <p class="m-0 mb-2 h6"><span class="bold">電話：</span>${item.tel}</p>
                <p class="m-0 mb-2 h6"><span class="bold">營業時間：</span>${item.busiTime}</p>
                </div> </li>`;
                    str += content;
                }
            })
            storeList.innerHTML = str;
        })
        area.addEventListener('change', function () {
            let content = '';
            let str = '';
            data.forEach(item => {
                if (item.hsnNm == cities.value && item.townNm == area.value) {
                    content = `<li> <div class="card p-1 mb-2">
                <h4 class="btn btn-primary m-0 mb-2 bold">${item.storeNm}</h4>
                <p class="m-0 mb-2 h5 text-danger"><span class="bold">三倍券庫存量：</span>${item.total}</p>
                <a target="_blank" href="https://www.google.com.tw/maps/place/${item.addr}" class="m-0 mb-2 h6 text-dark underLine"><span class="bold">地址：</span>${item.addr}</a>
                <p class="m-0 mb-2 h6"><span class="bold">電話：</span>${item.tel}</p>
                <p class="m-0 mb-2 h6"><span class="bold">營業時間：</span>${item.busiTime}</p>
                </div> </li>`;
                    str += content;
                }
            })
            storeList.innerHTML = str;
        })
        //點擊郵局標題移動位置
        storeList.addEventListener('click', function (e) {
            if (e.target.tagName == 'H4') {
                // console.log(e.target.innerText);
                data.forEach(item => {
                    if (item.storeNm == e.target.innerText) {
                        map.setView([item.latitude, item.longitude], 18);
                    }
                })
                $('.navBar').toggleClass('show');
            }
        }, false)
    })
    .catch(function (error) {
        alert(error);
    })


//製作縣市下拉選單
axios.get('./CityCountyData.json')
    .then((res) => {
        let geoData = res.data;
        let countriesOptions = '';
        let cytiesOptions = '';
        
        countriesOptions = `<option value="" selected disabled>選擇縣市</option>`;
        geoData.forEach((item, index) => {
            countriesOptions += `<option value="${item.CityName}">${item.CityName}</option>`;
            
        })
        cities.innerHTML = `<select name="" id="countries">${countriesOptions}</select>`;

        cities.addEventListener('change', function () {
            cytiesOptions = '';
            cytiesOptions = `<option value="" selected disabled>選擇區域</option>`;
            geoData[cities.selectedIndex - 1].AreaList.forEach(item => {
                cytiesOptions += `<option value="${item.AreaName}">${item.AreaName}</option>`;
            })
            area.innerHTML = `<select name="" id="countries">${cytiesOptions}</select>`;
        })
    })
