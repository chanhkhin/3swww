const eraWidget = new EraWidget();
let actionV1, actionV2, actionV3; // Gửi lệnh
let configUID; // Nhận UID từ ESP32

let tempCheckpoints = []; 
let savedCheckpoints = JSON.parse(localStorage.getItem('AGV_Checkpoints')) || [];

const uidInput = document.getElementById('uidInput');
const checkpointListDiv = document.getElementById('checkpointList');
const gotoListDiv = document.getElementById('gotoList');

eraWidget.init({
    onConfiguration: (conf) => {
        if(conf.actions && conf.actions.length >= 3) {
            actionV1 = conf.actions[0]; 
            actionV2 = conf.actions[1]; 
            actionV3 = conf.actions[2]; // Dùng chân này gửi lệnh GOTO và GO LINE
        }
        if (conf.realtime_configs && conf.realtime_configs.length > 0) {
            configUID = conf.realtime_configs[0]; // Chân V4 nhận thẻ
        }
    },
    onValues: (values) => {
        // [QUAN TRỌNG] - NƠI NHẬN UID TỪ XE GỬI LÊN
        if (configUID && values[configUID.id]) {
            const receivedUID = values[configUID.id].value;
            
            if (receivedUID !== undefined && receivedUID !== null && String(receivedUID).trim() !== "") {
                const uidStr = String(receivedUID).trim();
                
                // 1. Luôn điền vào ô textbox (Phục vụ việc thêm điểm mới)
                uidInput.value = uidStr;
                uidInput.style.backgroundColor = "#00ffcc";
                uidInput.style.color = "#000";
                setTimeout(() => {
                    uidInput.style.backgroundColor = "#2a2a2a";
                    uidInput.style.color = "#00ffcc";
                }, 400);

                // 2. [TÍNH NĂNG MỚI] KIỂM TRA ĐÍCH ĐẾN (ĐỔI MÀU NÚT XANH)
                // Khi nhận UID, dò xem UID này có nằm trong danh sách đã lưu không
                savedCheckpoints.forEach((cp, index) => {
                    if (cp.uid === uidStr) {
                        // Tìm nút bấm tương ứng với điểm này
                        const btn = document.getElementById(`gotoBtn_${index}`);
                        if (btn) {
                            // Xóa màu đỏ (đang chạy), thêm màu xanh (đã tới)
                            btn.classList.remove('status-moving');
                            btn.classList.add('status-arrived');
                        }
                    }
                });
            }
        }
    }
});

function renderUI() {
    checkpointListDiv.innerHTML = '';
    let displayList = tempCheckpoints.length > 0 ? tempCheckpoints : savedCheckpoints;
    
    displayList.forEach((cp, index) => {
        const letter = String.fromCharCode(65 + index);
        const card = document.createElement('div');
        card.className = 'point-card';
        card.innerHTML = `<span class="letter">${letter}</span><span class="uid-label">${cp.uid}</span>`;
        checkpointListDiv.appendChild(card);
    });

    gotoListDiv.innerHTML = '';
    if (savedCheckpoints.length === 0) {
        gotoListDiv.innerHTML = '<div class="no-data-msg">Chưa có điểm lưu nào. Hãy bấm GO LINE để dò thẻ.</div>';
    } else {
        savedCheckpoints.forEach((cp, index) => {
            const letter = String.fromCharCode(65 + index);
            const btn = document.createElement('button');
            btn.className = 'btn-goto';
            btn.id = `gotoBtn_${index}`; // Gán ID để lát gọi đổi màu
            btn.innerHTML = `GOTO ĐIỂM ${letter} <span class="uid-txt">[UID: ${cp.uid}]</span>`;
            
            // XỬ LÝ SỰ KIỆN KHI BẤM NÚT GOTO
            btn.addEventListener('click', () => {
                // 1. Reset màu toàn bộ các nút khác về mặc định
                const allGotoBtns = document.querySelectorAll('.btn-goto');
                allGotoBtns.forEach(b => {
                    b.classList.remove('status-moving', 'status-arrived');
                });

                // 2. Chuyển nút vừa bấm sang màu ĐỎ (Đang di chuyển)
                btn.classList.add('status-moving');

                // 3. Gửi lệnh báo cho ESP32 bắt đầu chạy tới điểm này
                // GOTO A = 2001, GOTO B = 2002...
                let cmdNumeric = 2001 + index;
                if (actionV3) eraWidget.triggerAction(actionV3.action, null, { value: cmdNumeric });
            });
            gotoListDiv.appendChild(btn);
        });
    }
}

// ================= CÁC NÚT TÍNH NĂNG =================

// [NÚT MỚI] Gửi lệnh GO LINE (Mã quy ước: 2100)
document.getElementById('btnGoLine').addEventListener('click', () => {
    if (actionV3) {
        eraWidget.triggerAction(actionV3.action, null, { value: 2100 });
        alert("Lệnh GO LINE đã được gửi. Xe bắt đầu dò vạch!");
    }
});

// Thêm điểm vào danh sách tạm
document.getElementById('btnAdd').addEventListener('click', () => {
    const uid = uidInput.value.trim();
    if (uid === "") return alert("Vui lòng đợi quét hoặc nhập thủ công UID!");
    
    let currentList = tempCheckpoints.length > 0 ? tempCheckpoints : [...savedCheckpoints];
    currentList.push({ uid: uid });
    tempCheckpoints = currentList;
    
    uidInput.value = "";
    renderUI();
});

// Lưu vào Local Storage
document.getElementById('btnSave').addEventListener('click', () => {
    if (tempCheckpoints.length > 0) {
        savedCheckpoints = [...tempCheckpoints];
        localStorage.setItem('AGV_Checkpoints', JSON.stringify(savedCheckpoints));
        tempCheckpoints = []; 
        alert("Đã lưu lộ trình thành công!");
        renderUI();
    }
});

// Reset xóa trắng
document.getElementById('btnReset').addEventListener('click', () => {
    if(confirm("Bạn có chắc muốn xóa toàn bộ điểm đã thiết lập?")) {
        tempCheckpoints = [];
        savedCheckpoints = [];
        localStorage.removeItem('AGV_Checkpoints');
        renderUI();
    }
});

// Chuyển Mode Auto/Manual
const btnManual = document.getElementById('btnManual');
const btnAuto = document.getElementById('btnAuto');
const autoPanel = document.getElementById('autoPanel');
const manualPanel = document.getElementById('manualPanel');

btnManual.addEventListener('click', () => {
    btnManual.classList.add('active-manual'); btnAuto.classList.remove('active-auto');
    autoPanel.classList.remove('show'); manualPanel.classList.remove('hidden');
    if (actionV3) eraWidget.triggerAction(actionV3.action, null, { value: 1000 }); // ESP32: Manual Mode
});

btnAuto.addEventListener('click', () => {
    btnAuto.classList.add('active-auto'); btnManual.classList.remove('active-manual');
    autoPanel.classList.add('show'); manualPanel.classList.add('hidden');
    renderUI();
    if (actionV3) eraWidget.triggerAction(actionV3.action, null, { value: 2000 }); // ESP32: Auto Mode
});

// Joystick Manual
function sendV1(v) { document.getElementById('labelRight').textContent = v; if(actionV1) eraWidget.triggerAction(actionV1.action, null, {value: v}); }
function sendV2(v) { document.getElementById('labelLeft').textContent = v; if(actionV2) eraWidget.triggerAction(actionV2.action, null, {value: v}); }
const bindBtn = (id, vDown, vUp, func) => {
    const b = document.getElementById(id);
    b.addEventListener('pointerdown', () => func(vDown));
    b.addEventListener('pointerup', () => func(vUp));
    b.addEventListener('pointerleave', () => func(vUp));
};
bindBtn('btnUp', 2025, 1494, sendV1); bindBtn('btnDown', 1027, 1494, sendV1);
bindBtn('btnLeft', 987, 1497, sendV2); bindBtn('btnRight', 1983, 1497, sendV2);

// Khởi tạo hiển thị lần đầu
renderUI();
