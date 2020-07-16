const myLocation = document.querySelector('#myLocation-btn');
const cities = document.querySelector('#cities');
const area = document.querySelector('#area');
const storeList = document.querySelector('#store-list');


// 地圖初始化
const map = L.map('map', {
    center: [25.040065, 121.523235], // 台北市區（地圖中心）
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
    position: "bottomright"
}).addTo(map);


L.control.locate({
        showPopup: false,
        position: "bottomright",
        locateOptions: {
            enableHighAccuracy: true //設置高精準度
        },
        icon: "fas fa-crosshairs"
}).addTo(map).start();

axios.get("https://3000.gov.tw/hpgapi-openmap/api/getPostData")
    .then((res) => {
        function getUserLocation() {
            if (navigator.geolocation) {
                function showPosition(position) {
                    map.setView([position.coords.latitude, position.coords.longitude], 16);
                }
                function showError() {
                    console.log('無法取得你的地理位置。')
                }
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                console.log('你的裝置不支援定位功能。');
            }
        }

        getUserLocation();

        ///處理地圖
        var markers = new L.MarkerClusterGroup({
            polygonOptions: {
                color: '#355C7D',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.5
            }

        }).addTo(map);
        var data = res.data;
        data.forEach((item) => {

            //設定標點顏色
            const iconColor = (() => {
                if (item.total > 0) {
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
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
                }
            })();

            //群組標點,增加圖層(leaflet的標點([座標])).新增popup
            markers.addLayer(
                L.marker([item.latitude, item.longitude], {
                    icon: iconColor
                }).bindPopup(`<div>
                                <h5 class="my-2">${item.storeNm}</h5>
                                <p class="my-2 h5 text-danger"><span>三倍券庫存量：</span>${item.total}</p>
                                <p class="my-2 h6">
                                    <i class="fas fa-map-marked-alt"></i>
                                    <a target="_blank" href="https://www.google.com.tw/maps/place/${item.addr}" class="text-info">${item.addr}</a>
                                </p>                
                                <p class="my-2 h6"><i class="fas fa-phone-alt"></i>${item.tel}</p>
                                <p class="my-2 h6"><i class="far fa-clock"></i>${item.busiTime}</p>
                                <p class="my-2 h6 text-danger"><span>數據更新時間：</span>${item.updateTime}</p>
                            </div>`
                )
            );
        });
        map.addLayer(markers);

        //選取地區後的資料呈現
        cities.addEventListener("change", function () {
            let content = '';
            let str = '';
            data.forEach(item => {
                if (item.hsnNm == cities.value && item.townNm == area.value) {
                    content = `<li> 
                                <div class="card border-info mb-2">
                                    <div class="card-header">
                                        <span class="h5">${item.storeNm}</span>
                                        <i class="fas fa-eye" data-lat="${item.latitude}" data-lng="${item.longitude}"></i>
                                    </div>
                                    <div class="card-body">
                                        <p class="my-1 h5 text-danger"><span>三倍券庫存量：</span>${item.total}</p>
                                        <p class="my-1 h6">
                                            <i class="fas fa-map-marked-alt"></i>
                                            <a target="_blank" href="https://www.google.com.tw/maps/place/${item.addr}" class="text-info">${item.addr}</a>
                                        </p>
                                        <p class="my-1 h6"><i class="fas fa-phone-alt"></i>${item.tel}</p>
                                        <div class="d-flex">
                                            <p class="m-0"><i class="far fa-clock"></i></p>
                                            <p class="m-0">${item.busiTime}</p>
                                        </div>
                                    </div>
                                </div> 
                            </li>`;
                    str += content;
                }
            })
            storeList.innerHTML = str;
        })
        area.addEventListener("change", function () {
            let content = '';
            let str = '';
            data.forEach(item => {
                if (item.hsnNm == cities.value && item.townNm == area.value) {
                    content = `<li>
                                <div class="card border-info mb-2">
                                    <div class="card-header">
                                        <span class="h5">${item.storeNm}</span>
                                        <i class="fas fa-eye" data-lat="${item.latitude}" data-lng="${item.longitude}"></i>
                                    </div>
                                    <div class="card-body">
                                        <p class="my-1 h5 text-danger"><span>三倍券庫存量：</span>${item.total}</p>
                                        <p class="my-1 h6">
                                            <i class="fas fa-map-marked-alt"></i>
                                            <a target="_blank" href="https://www.google.com.tw/maps/place/${item.addr}" class="text-info">${item.addr}</a>
                                        </p>
                                        <p class="my-1 h6"><i class="fas fa-phone-alt"></i>${item.tel}</p>
                                        <div class="d-flex">
                                            <p class="m-0"><i class="far fa-clock"></i></p>
                                            <p class="m-0">${item.busiTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </li>`;
                    str += content;
                }
            })
            storeList.innerHTML = str;
        })

        //點擊Icon移動至郵局位置
        storeList.addEventListener("click", function (e) {
            if (e.target.tagName !== 'I') {
                return;
            }
            let lat = e.target.dataset.lat;
            let lng = e.target.dataset.lng;
            map.setView([lat, lng], 18);

            $(".sidebar").toggleClass("show");

        }, false)
    })
    .catch(function (error) {
        alert(error);
    })


//取得縣市下拉選單
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

$("#hb-btn").on("click", () => {
    $(".sidebar").toggleClass("show");
});

$("#close-btn").on("click", () => {
    $(".sidebar").toggleClass("show");
});