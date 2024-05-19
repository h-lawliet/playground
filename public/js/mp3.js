// 요소 변수 생성
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

// 전역변수
let track_index = 0;
let isPlaying = false;
let updateTimer;

// 플레이할 오디오 요소를 생성
let curr_track = document.createElement('audio');

// 저장된 트랙 리스트
// 효율적 관리 업데이트
let track_list = [
{
  name: "Reminiscence",
  artist: "Nauts(남구민)",
  path: "/css/audio/Reminiscence.mp3"
},
{
  name: "Second Run",
  artist: "Nauts(남구민)",
  path: "/css/audio/Second Run.mp3"
},
{
  name: "月流 - Getsuryu",
  artist: "Hallo",
  path: "/css/audio/月流Getsuryu.mp3"
},
{
  name: "You're Gonna Be Ok",
  artist: "Iwamizu",
  path: "/css/audio/You're Gonna Be Ok.mp3"
},
{
  name: "Aruarian Dance",
  artist: "Nujabes",
  path: "/css/audio/Aruarian Dance.mp3"
},
{
  name: "Tsurugi No Mai",
  artist: "Nujabes",
  path: "/css/audio/Tsurugi No Mai.mp3"
},

{
  name: "soul nights",
  artist: "music shower",
  path: "/css/audio/soul nights.mp3"
},
{
  name: "2:23 AM",
  artist: "しゃろう",
  path: "/css/audio/223AM.mp3"
},
{
  name: "HOME",
  artist: "有形ランペイジ",
  path: "/css/audio/HOME.mp3"
},
{
  name: "Flower Dance",
  artist: "DJ Okawari",
  path: "/css/audio/Flower Dance.mp3"
},
{
  name: "LOVE L.A",
  artist: "Ruben Wilmer Band",
  path: "/css/audio/Love L.A.mp3"
},
{
  name: "Ji-Eun's Sunset",
  artist: "City Girl",
  path: "/css/audio/Ji-Eun's Sunset.mp3"
},
{
  name: "Days Like These",
  artist: "LAKEY INSPIRED",
  path: "/css/audio/Days Like These.mp3"
},
{
  name: "take me there",
  artist: "potsu",
  path: "/css/audio/take me there.mp3"
},
{
  name: "letting go",
  artist: "potsu",
  path: "/css/audio/letting go.mp3"
},
{
  name: "just friends",
  artist: "potsu",
  path: "/css/audio/just friends.mp3"
},
{
  name: "food court",
  artist: "potsu",
  path: "/css/audio/food court.mp3"
},
{
  name: "A Neon Glow Lights the Way",
  artist: "Garoad",
  path: "/css/audio/A Neon Glow Lights the Way.mp3"
},
{
  name: "Welcome to VA-11 Hall-A",
  artist: "Garoad",
  path: "/css/audio/Welcome to VA11 HallA.mp3"
},
{
  name: "Neon District",
  artist: "Garoad",
  path: "/css/audio/Neon District.mp3"
},
{
  name: "Karmotrine Dream",
  artist: "Garoad",
  path: "/css/audio/Karmotrine Dream.mp3"
},
{
  name: "Dreamscaping",
  artist: "Fearofdark",
  path: "/css/audio/Dreamscaping.mp3"
},
{
  name: "Rolling Down The Street In My Katamari",
  artist: "Fearofdark",
  path: "/css/audio/Rolling Down The Street In My Katamari.mp3"
},
{
  name: "Moon",
  artist: "FreeTEMPO",
  path: "/css/audio/Moon.mp3"
},
{
  name: "Resonance",
  artist: "HOME",
  path: "/css/audio/Resonance.mp3"
},
];

function loadTrack(track_index) {
  // 이전 트랙의 time, duration, 이동바 초기화
  clearInterval(updateTimer);
  resetValues();

  // 새 음악 로딩
  curr_track.src = track_list[track_index].path;
  curr_track.load();

  // 이름, 아티스트 업데이트
  track_name.textContent = track_list[track_index].name;
  track_artist.textContent = track_list[track_index].artist;

  // seekUpdate함수는 현재의 시간 정보를 받아서 업데이트한다
  updateTimer = setInterval(seekUpdate, 1000);

  curr_track.addEventListener("ended", nextTrack);
}

// 페이지를 열자마자 첫번째 곡을 로딩한다
window.onload=function() {
  loadTrack(track_index)
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;

  playpause_btn.innerHTML = '<img src="/css/images/media-pause-48.png">';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;

  playpause_btn.innerHTML = '<img src="/css/images/media-play-48.png">';
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;

  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length - 1;
  
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

// audio 요소의 volume property를 volume_slider의 value로 설정한다
function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;

    // Math변수 내의 메서드 floor을 이용하여 가우스기호로 사용한다
    // currentTime, duration은 audio요소의 property이다(초단위로 반환한다)
    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    // 만약 한자리수라면 부족한 0을 채워준다
    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    // html페이지에 표시되는 curr_time요소의 텍스트를 업데이트한다
    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}