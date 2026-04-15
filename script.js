const eraWidget = new EraWidget();
let actionV1, actionV2, actionV3; // Lệnh đi: Throttle, Steering, Command
let configUID, configWifi, configVolt, configAmp, configPWML, configPWMR; // Nhận về: V4-V9

let savedCheckpoints = JSON.parse(localStorage.getItem('AGV_Checkpoints')) || [];
let systemState = 'stopped';
let controlSource = 'WEB';

// 1. Khởi tạo ERa Widget [cite: 1131-1150]
eraWidget.init({
    onConfiguration: (conf) => {
        // Áp dụng cấu hình Actions (V1, V2, V3)
        if(conf.actions && conf.actions.length >= 3) {
            actionV1 = conf.actions[0]; actionV2 = conf.actions[1]; actionV3 = conf.actions[2];
        }
        // Áp dụng cấu hình Realtime (V4 - V9)
        if(conf.realtime_configs) {
            configUID = conf.realtime_configs[0]; // V4
            configWifi = conf.realtime_configs[1]; // V5
            configVolt = conf.realtime_configs[2]; // V6
            configAmp = conf.realtime_configs[3];  // V7
            configPWML = conf.realtime_configs[4]; // V8 (Feedback Left)
            configPWMR = conf.realtime_configs[5]; // V9 (Feedback Right)
        }
    },
    onValues: (values) => {
        // Cập nhật UID khi quét thẻ [cite: 1142-1145]
        if (configUID && values[configUID.id]) {
            const rfid = String(values[configUID.id].value).trim();
            if (rfid) handleScanRFID(rfid);
        }
        // Cập nhật các thông số Telemetry [cite: 1146-1148]
        if (configWifi && values[configWifi.id]) document.getElementById('valWifi').innerText = values[configWifi.id].value + " %";
        if (configVolt && values[configVolt.id]) document.getElementById('valVolt').innerText = values[configVolt.id].value + " V";
        if (configAmp && values[configAmp.id]) document.getElementById('valAmp').innerText = values[configAmp.id].value + " A";
        
        // Cập nhật tốc độ bánh xe PHẢN HỒI từ ESP32 (V8, V9)
        let pwmL = 0, pwmR = 0;
        if (configPWML && values[configPWML.id]) pwmL = values[configPWML.id].value;
        if (configPWMR && values[configPWMR.id]) pwmR = values[configPWMR.id].value;
        updateGauges(pwmL, pwmR);
    }
});

// 2. Logic điều khiển thủ công (Manual) [cite: 1263-1302]
const sendMove = (v1, v2) => {
    if(controlSource !== 'WEB' || systemState === 'error') return;
    if(actionV1) eraWidget.triggerAction(actionV1.action, null, {value: v1});
    if(actionV2) eraWidget.triggerAction(actionV2.action, null, {value: v2});
};

const keys = { w: false, a: false, s: false, d: false };
document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if(keys.hasOwnProperty(k) && !keys[k]) {
        keys[k] = true;
        document.getElementById('btn' + k.toUpperCase()).classList.add('active');
        if(k==='w') sendMove(2025, 1497);
        if(k==='s') sendMove(1027, 1497);
        if(k==='a') sendMove(1494, 987);
        if(k==='d') sendMove(1494, 1983);
    }
});
document.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if(keys.hasOwnProperty(k)) {
        keys[k] = false;
        document.getElementById('btn' + k.toUpperCase()).classList.remove('active');
        sendMove(1494, 1497); // Dừng lại
    }
});

// 3. Logic xử lý đồng hồ Gauge (Feedback PWM) [cite: 1168-1185]
function updateGauges(pwmL, pwmR) {
    const mapPWM = (val) => -45 + (Math.min(255, Math.abs(val)) / 255) * 180;
    document.getElementById('gaugeL').style.transform = `rotate(${mapPWM(pwmL)}deg)`;
    document.getElementById('valL').innerText = Math.abs(pwmL);
    document.getElementById('gaugeR').style.transform = `rotate(${mapPWM(pwmR)}deg)`;
    document.getElementById('valR').innerText = Math.abs(pwmR);
}

// 4. Chuyển đổi chế độ Web/RC [cite: 1303-1315]
document.getElementById('btnCtrlWeb').onclick = () => {
    controlSource = 'WEB';
    document.getElementById('btnCtrlWeb').classList.add('active');
    document.getElementById('btnCtrlRC').classList.remove('active');
    if(actionV3) eraWidget.triggerAction(actionV3.action, null, {value: 1000});
};

document.getElementById('btnGoLine').onclick = function() {
    const isRun = this.classList.toggle('active');
    if(isRun) {
        this.innerHTML = "⏸ TẠM DỪNG";
        if(actionV3) eraWidget.triggerAction(actionV3.action, null, {value: 2100});
    } else {
        this.innerHTML = "▶ BẮT ĐẦU GO LINE";
        if(actionV3) eraWidget.triggerAction(actionV3.action, null, {value: 2000});
    }
};

// 5. Đồng hồ hệ thống
setInterval(() => {
    document.getElementById('clockTime').innerText = new Date().toLocaleTimeString('vi-VN');
}, 1000);

// Nút dừng khẩn cấp E-STOP [cite: 1329-1335]
document.getElementById('btnEStop').onclick = () => {
    systemState = 'error';
    document.getElementById('sysStatus').className = 'status-badge error';
    document.getElementById('sysStatus').innerText = 'ERROR';
    if(actionV3) eraWidget.triggerAction(actionV3.action, null, {value: 9999});
};
