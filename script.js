const slider = document.querySelector(".brightness-slider");
const sliderFill = document.querySelector(".slider-fill");
const valueDisplay = document.querySelector(".widget-value");
// eraWidget.triggerAction(actionOn.action, null);
slider.addEventListener("input", function () {
  const value = parseFloat(this.value); // Ép kiểu về float
  sliderFill.style.width = value + "%";
  valueDisplay.textContent = value + "%";
  eraWidget.triggerAction(onKitchenLight.action, null, { value: value });
});

const sliderLivingRoom = document.querySelector(".brightness-sliderLivingRom");
const valueLivingRoom = document.querySelector(".widget-valueLivingRoom");
const sliderFillLivingRoom = document.querySelector(".slider-fill-livingRoom");

sliderLivingRoom.addEventListener("input", function () {
  const value = parseFloat(this.value); // Ép kiểu về float
  sliderFillLivingRoom.style.width = value + "%";
  valueLivingRoom.textContent = value + "%";
  eraWidget.triggerAction(onLivingLight.action, null, { value: value });
});

// Widget Bed Light
const widget = document.querySelector(".light-icon");
const icon = document.querySelector(".light-icon");
const status = document.querySelector(".status");
let isOn = false;

widget.addEventListener("click", () => {
  isOn = !isOn;
  if (isOn) {
    icon.classList.add("active");
    status.textContent = "ON";
    eraWidget.triggerAction(onBedLight.action, null);
  } else {
    icon.classList.remove("active");
    status.textContent = "OFF";
    eraWidget.triggerAction(offBedLight.action, null);
  }
});

status.addEventListener("click", () => {
  isOn = !isOn;
  if (isOn) {
    icon.classList.add("active");
    status.textContent = "ON";
    eraWidget.triggerAction(onBedLight.action, null);
  } else {
    icon.classList.remove("active");
    status.textContent = "OFF";
    eraWidget.triggerAction(offBedLight.action, null);
  }
});
// ============ Power Off Buttons ==============
function handlePowerOff(type) {
  if (type === "temp" || type === "both") {
    isTempActive = false;
    const gaugeTemp = document.querySelector(".temp-widget .gauge.temp.neon");
    gaugeTemp.style.setProperty("--value", 0);
    gaugeTemp.querySelector(".value").textContent = "OFF";
    updateChart(0, NaN);
  }

  if (type === "humidifier" || type === "both") {
    isHumidActive = false;
    const gaugeHumid = document.querySelector(
      ".humidifier-widget .gauge.humidifier.neon"
    );
    gaugeHumid.style.setProperty("--value", 0);
    gaugeHumid.querySelector(".value").textContent = "OFF";
    updateChart(NaN, 0);
  }
}

// Gán sự kiện cho nút tắt
document.querySelectorAll(".controls button:last-child").forEach((btn) => {
  btn.addEventListener("click", function () {
    const isTemp = this.closest(".temp-widget");
    handlePowerOff(isTemp ? "temp" : "humidifier");
  });
});

// ============ Active Buttons ==============
function handleActive(type) {
  if (type === "temp" || type === "both") {
    isTempActive = true;
    if (lastTempValue !== null) {
      updateTempGauge(lastTempValue);
      updateChart(lastTempValue, NaN);
    }
  }

  if (type === "humidifier" || type === "both") {
    isHumidActive = true;
    if (lastHumidValue !== null) {
      updateGauge(lastHumidValue);
      updateChart(NaN, lastHumidValue);
    }
  }
}
document.querySelectorAll(".controls .active").forEach((btn) => {
  btn.addEventListener("click", function () {
    const isTemp = this.closest(".temp-widget");
    handleActive(isTemp ? "temp" : "humidifier");
  });
});

function updateTempGauge(newVal) {
  const gauge = document.querySelector(".temp-widget .gauge.temp.neon");
  gauge.style.setProperty("--value", newVal);
  gauge.querySelector(".value").textContent = newVal + "°C";
}

function updateGauge(newVal) {
  const gauge = document.querySelector(
    ".humidifier-widget .gauge.humidifier.neon"
  );
  gauge.style.setProperty("--value", newVal);
  gauge.querySelector(".value").textContent = newVal + "%";
}
//==============Music Widget============
const audioPlayer = document.getElementById("audioPlayer");
const playButton = document.querySelector(".playButton-musicWidget");
const stopButton = document.querySelector(".stopButton-musicWidget");
const progressBar = document.querySelector(".progress-musicWidget");
const durationDisplay = document.querySelector(".duration-musicWidget");
const albumArt = document.querySelector(".albumArt-musicWidget");
const vinylRecord = document.querySelector(".vinylRecord-musicWidget");
const previousButton = document.querySelector(".previousButton-musicWidget");
const nextButton = document.querySelector(".nextButton-musicWidget");
const songTitleElement = document.querySelector(".songTitle-musicWidget");
const artistNameElement = document.querySelector(".artistName-musicWidget");

playButton.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    albumArt.classList.add("playing");
    vinylRecord.classList.add("rotate");
  } else {
    audioPlayer.pause();
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    albumArt.classList.remove("playing");
    vinylRecord.classList.remove("rotate");
  }
});

// Stop functionality
stopButton.addEventListener("click", () => {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  playButton.innerHTML = '<i class="fas fa-play"></i>';
  progressBar.style.width = "0%";
  albumArt.classList.remove("playing");
  vinylRecord.classList.remove("rotate");
  updateDurationDisplay();
});

// Update progress bar and duration
audioPlayer.addEventListener("timeupdate", () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.style.width = `${progress}%`;
  updateDurationDisplay();
});
// Previous button functionality
previousButton.addEventListener("click", () => {
  let newIndex = currentSongIndex - 1;
  if (newIndex < 0) {
    newIndex = songs.length - 1; // Loop back to the last song
  }
  loadSong(newIndex);
});

// Next button functionality
nextButton.addEventListener("click", () => {
  let newIndex = currentSongIndex + 1;
  if (newIndex >= songs.length) {
    newIndex = 0; // Loop back to the first song
  }
  loadSong(newIndex);
});

// Add this to auto-play next song when current song ends
audioPlayer.addEventListener("ended", () => {
  let newIndex = currentSongIndex + 1;
  if (newIndex >= songs.length) {
    newIndex = 0;
  }
  loadSong(newIndex);
  audioPlayer.play();
  playButton.innerHTML = '<i class="fas fa-pause"></i>';
  albumArt.classList.add("playing");
  vinylRecord.classList.add("rotate");
});

// Helper function to format time (MM:SS)
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Update duration display
function updateDurationDisplay() {
  const currentTime = formatTime(audioPlayer.currentTime);
  const duration = formatTime(audioPlayer.duration);
  durationDisplay.textContent = `${currentTime} / ${duration}`;
}

// Add this at the beginning of your JS file
const songs = [
  {
    src: "assets/audio/1000_anhmat.mp3",
    title: "1000 Ánh Mắt",
    artist: "Shiki",
  },
  {
    src: "assets/audio/reeves.mp3",
    title: "Reeves",
    artist: "HIEUTHUHAI-Manbo",
  },
  {
    src: "assets/audio/thienlyoi.mp3",
    title: "Thiên Lý Ơi",
    artist: "Jack J97",
  },
];

let currentSongIndex = 0;

// Function to load and play a song
function loadSong(index) {
  if (index >= 0 && index < songs.length) {
    currentSongIndex = index;
    audioPlayer.src = songs[currentSongIndex].src;

    // Update song info
    songTitleElement.textContent = songs[currentSongIndex].title;
    artistNameElement.textContent = songs[currentSongIndex].artist;

    // Reset UI elements
    progressBar.style.width = "0%";
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    albumArt.classList.remove("playing");
    vinylRecord.classList.remove("rotate");

    // If you want to auto-play when switching songs, uncomment these lines:
    // audioPlayer.play();
    // playButton.innerHTML = '<i class="fas fa-pause"></i>';
    // albumArt.classList.add("playing");
    // vinylRecord.classList.add("rotate");
    // updateDurationDisplay();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  loadSong(0);
});

//============Air Conditioner Widget==============
document.addEventListener("DOMContentLoaded", () => {
  const temperatureValue = document.querySelector(".temperature-value");
  const gaugeFill = document.querySelector(".gauge-fill");
  const gaugeDot = document.querySelector(".gauge-dot");
  const decreaseButton = document.querySelector(".temp-button.decrease");
  const increaseButton = document.querySelector(".temp-button.increase");

  let temperature = 15;

  const updateDisplay = (temp) => {
    const minTemp = 14;
    const maxTemp = 30;
    const percentage = (temp - minTemp) / (maxTemp - minTemp);
    const rotation = percentage * 360;

    temperatureValue.textContent = temp;
    gaugeFill.style.setProperty("--fill-percentage", `${rotation}deg`); // Chỉ cập nhật fill
    gaugeDot.style.setProperty("--rotation", `${rotation}deg`); // Xoay dot
  };

  // Temperature adjustment function
  const adjustTemperature = (increment) => {
    const newTemp = temperature + increment;
    if (newTemp >= 14 && newTemp <= 30) {
      temperature = newTemp;
      updateDisplay(temperature);
      eraWidget.triggerAction(onAirConditioner.action, null, {
        value: temperature,
      });
    }
  };

  // Event listeners for temperature buttons
  decreaseButton.addEventListener("click", () => adjustTemperature(-1));
  increaseButton.addEventListener("click", () => adjustTemperature(1));
  // Initial display update
  updateDisplay(temperature);
});
//===========Realtime Chart===========
let myChart; // Biến lưu trữ đối tượng chart
let chartData = []; // Mảng lưu trữ dữ liệu theo thời gian
const maxDataPoints = 20;
const maxLiveDataPoints = 30; // 60 điểm = 1 phút nếu cập nhật mỗi giây
let allChartData = []; // Lưu toàn bộ dữ liệu
let currentTimeRange = 0; // 0 = live
// Hàm khởi tạo chart
function initChart() {
  const ctx = document.getElementById("dataChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Humidity",
          data: [],
          borderColor: "#FF5500",
          backgroundColor: "rgba(255,85,0,0.1)",
          tension: 0.4,
          borderWidth: 2,
          spanGaps: true, // Bỏ qua khoảng trống do NaN
        },
        {
          label: "Temp",
          data: [],
          borderColor: "#2196F3",
          backgroundColor: "rgba(33,150,243,0.1)",
          tension: 0.4,
          borderWidth: 2,
          spanGaps: true, // Bỏ qua khoảng trống do NaN
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#fff",
            size: 12,
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
          ticks: {
            color: "#fff",
            size: 10,
          },
        },
        y: {
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
          ticks: {
            color: "#fff",
            font: {
              size: 11, // Tăng nhẹ kích thước chữ
              family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            },
          },
        },
      },
    },
  });

  // Đặt kích thước lớn hơn cho chart khi khởi động
  const chartContainer = document.getElementById("chartContainer");
}

// Hàm cập nhật dữ liệu chart
function updateChart(humidifierVal, tempVal) {
  const now = new Date();
  const timestamp = now.getTime();

  const timeLabel = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  // Thay thế null bằng NaN
  const newData = {
    time: timeLabel,
    humidifier: typeof humidifierVal === "number" ? humidifierVal : NaN,
    temp: typeof tempVal === "number" ? tempVal : NaN,
    timestamp: timestamp,
  };

  chartData.push(newData);
  allChartData.push(newData);

  if (chartData.length > maxDataPoints) {
    chartData.shift();
  }

  myChart.data.labels = chartData.map((item) => item.time);
  myChart.data.datasets[0].data = chartData.map((item) => item.humidifier);
  myChart.data.datasets[1].data = chartData.map((item) => item.temp);
  myChart.update();
}

// Hàm thu nhỏ chart dần dần
function resizeChart() {
  const chartContainer = document.getElementById("chartContainer");
  let width = 80; // Kích thước ban đầu
  let height = 400;

  const resizeInterval = setInterval(() => {
    if (width > 30) {
      width -= 0.5;
      height -= 2.5;
      // chartContainer.style.width = `${width}%`;
      // chartContainer.style.height = `${height}px`;
    } else {
      clearInterval(resizeInterval);
    }
  }, 1000); // Thay đổi kích thước mỗi giây
}

// Hàm reset chart
function resetChart() {
  chartData = [];
  myChart.data.labels = [];
  myChart.data.datasets[0].data = [];
  myChart.data.datasets[1].data = [];
  myChart.update();
}

// Khởi tạo chart và bắt đầu thu nhỏ
initChart();
resizeChart();

// Reset chart sau 30 phút
setTimeout(resetChart, 30 * 60 * 1000);

// ============ XỬ LÝ NÚT TIME RANGE ============
document.querySelectorAll(".time-range").forEach((button) => {
  button.addEventListener("click", function () {
    // Xóa class active của tất cả các nút
    document.querySelectorAll(".time-range").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Thêm class active cho nút được chọn
    this.classList.add("active");

    // Cập nhật time range
    const minutes = parseInt(this.dataset.minutes);
    currentTimeRange = minutes;
    // showStatsModal(minutes);
    // Nếu không phải chế độ live, dừng cập nhật realtime
    if (minutes !== 0) {
      clearInterval(intervalId);
      showStatsModal(minutes);
    } else {
      // Nếu quay lại chế độ live, khởi động lại interval
      intervalId = setInterval(() => updateRandom("both"), 1000);
    }

    refreshChartDisplay();
  });
});
// Hàm làm mới hiển thị chart
function refreshChartDisplay() {
  let filteredData = [];

  if (currentTimeRange === 0) {
    filteredData = [...allChartData];
  } else {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - currentTimeRange);
    filteredData = allChartData.filter((item) => item.timestamp > cutoffTime);
  }

  myChart.data.labels = filteredData.map((item) => item.timestamp);
  myChart.data.datasets[0].data = filteredData.map((item) => item.humidifier);
  myChart.data.datasets[1].data = filteredData.map((item) => item.temp);
  myChart.update();
}

function showStatsModal(minutes) {
  console.log("Acess to showStatsModal");
  const modal = document.getElementById("statsModal");
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);

  // Lọc dữ liệu
  const filteredData = allChartData.filter(
    (item) => new Date(item.timestamp) >= cutoffTime
  );

  // Tạo nội dung bảng
  const tableBody = document.getElementById("statsTableBody");
  tableBody.innerHTML = filteredData
    .map(
      (item) => `
    <tr>
      <td>${item.time}</td>
      <td>${item.humidifier}</td>
      <td>${item.temp}</td>
    </tr>
  `
    )
    .join("");

  // Hiển thị modal
  modal.style.display = "block";

  // Xử lý đóng modal
  document.querySelector(".close").onclick = () =>
    (modal.style.display = "none");
  window.onclick = (event) => {
    if (event.target === modal) modal.style.display = "none";
  };
}

//==============Add E-Ra Services============
const eraWidget = new EraWidget();
const temp = document.getElementById("temp-widget");
const humi = document.getElementById("humidifier-widget");
let isTempActive = true;
let isHumidActive = true;
let lastTempValue = null;
let lastHumidValue = null;
let configTemp = null,
  configHumi = null,
  onBedLight = null,
  offBedLight = null,
  onKitchenLight = null,
  onLivingLight = null,
  onAirConditioner = null;

eraWidget.init({
  onConfiguration: (configuration) => {
    configTemp = configuration.realtime_configs[0];
    configHumi = configuration.realtime_configs[1];
    onBedLight = configuration.actions[0];
    offBedLight = configuration.actions[1];
    onKitchenLight = configuration.actions[2];
    onLivingLight = configuration.actions[3];
    onAirConditioner = configuration.actions[4];
  },
  onValues: (values) => {
    if (configTemp && values[configTemp.id]) {
      const tempValue = values[configTemp.id].value;
      lastTempValue = tempValue;
      if (isTempActive) {
        updateTempGauge(tempValue);
        updateChart(tempValue, NaN);
      }
    }

    if (configHumi && values[configHumi.id]) {
      const humidValue = values[configHumi.id].value;
      lastHumidValue = humidValue;
      if (isHumidActive) {
        updateGauge(humidValue);
        updateChart(NaN, humidValue);
      }
    }
  },
});
//===========Full Screen Feature==========
// Add fullscreen button HTML to your document first
const fullscreenButton = document.createElement("button");
fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
fullscreenButton.className = "fullscreen-button";
document.body.appendChild(fullscreenButton);

// Add fullscreen functionality
let isFullscreen = false;

function toggleFullscreen() {
  if (!isFullscreen) {
    // Enter fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
    fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
  }
  isFullscreen = !isFullscreen;
}

// Event listener for fullscreen button
fullscreenButton.addEventListener("click", toggleFullscreen);

// Update button icon when fullscreen changes through other means (like Esc key)
document.addEventListener("fullscreenchange", function () {
  isFullscreen = !!document.fullscreenElement;
  fullscreenButton.innerHTML = isFullscreen
    ? '<i class="fas fa-compress"></i>'
    : '<i class="fas fa-expand"></i>';
});

// Handle fullscreen change for different browsers
document.addEventListener("webkitfullscreenchange", function () {
  isFullscreen = !!document.webkitFullscreenElement;
  fullscreenButton.innerHTML = isFullscreen
    ? '<i class="fas fa-compress"></i>'
    : '<i class="fas fa-expand"></i>';
});

document.addEventListener("mozfullscreenchange", function () {
  isFullscreen = !!document.mozFullScreenElement;
  fullscreenButton.innerHTML = isFullscreen
    ? '<i class="fas fa-compress"></i>'
    : '<i class="fas fa-expand"></i>';
});

document.addEventListener("MSFullscreenChange", function () {
  isFullscreen = !!document.msFullscreenElement;
  fullscreenButton.innerHTML = isFullscreen
    ? '<i class="fas fa-compress"></i>'
    : '<i class="fas fa-expand"></i>';
});
