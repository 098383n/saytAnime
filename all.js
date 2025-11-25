// --- Главный список аниме ---
const animeList = [
  { 
    id: 1, 
    title: "Naruto", 
    image: "https://www.chromethemer.com/download/hd-wallpapers/naruto-and-sasuke-3840x2160.jpg", 
    genres: ["Action","Adventure"], 
    description: "Наруто — история о ниндзя, который мечтает стать Хокаге.", 
    rating: 9.2
  },
  { 
    id: 2, 
    title: "One Piece", 
    image: "https://one-piece.com/op/links_eng/assets/img/PC_OP_XRAMS_LP_animeKV.jpg", 
    genres: ["Action","Comedy"], 
    description: "Путешествие Луффи за сокровищем One Piece.", 
    rating: 9.5
  }
];

// --- Рендер аниме на главной ---
function renderAnime(list){
  const container = document.getElementById('anime-list');
  if(!container) return;
  container.innerHTML = '';
  list.forEach(anime => {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <img src="${anime.image}" alt="${anime.title}">
      <div class="anime-info">
        <h3>${anime.title}</h3>
        <p>${anime.genres.join(", ")}</p>
        <p>Рейтинг: ⭐ ${anime.rating}</p>
        <p class="desc-preview">${anime.description.substring(0, 50)}...</p>
      </div>
    `;
    card.addEventListener('click', () => {
      localStorage.setItem('selectedAnime', JSON.stringify(anime));
      window.location.href = 'anime.html';
    });
    container.appendChild(card);
  });
}

// --- Поиск ---
const searchInput = document.getElementById('search');
if(searchInput){
  searchInput.addEventListener('input', (e) => {
    const filtered = animeList.filter(a => a.title.toLowerCase().includes(e.target.value.toLowerCase()));
    renderAnime(filtered);
  });
}

// --- Фильтр жанров ---
const genreFilter = document.getElementById('genre-filter');
if(genreFilter){
  const allGenres = [...new Set(animeList.flatMap(a => a.genres))];
  allGenres.forEach(genre => {
    const btn = document.createElement('button');
    btn.textContent = genre;
    btn.addEventListener('click', () => {
      const filtered = animeList.filter(a => a.genres.includes(genre));
      renderAnime(filtered);
    });
    genreFilter.appendChild(btn);
  });
}

// --- Naruto S1 ---
const narutoSeason1 = [
  { arc: "Страна Волн", episodes: Array.from({length:19}, (_,i)=>i+1) },
];

// --- One Piece S1 (10 серий) ---
const onePieceSeason1 = [
  { arc: "Роман Дауна", episodes: Array.from({length:10}, (_,i)=>i+1) },
];

// --- История просмотра ---
function saveWatchedEpisode(animeTitle, episodeNumber) {
  const watched = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
  if (!watched[animeTitle]) watched[animeTitle] = [];
  if (!watched[animeTitle].includes(episodeNumber)) watched[animeTitle].push(episodeNumber);
  localStorage.setItem('watchedEpisodes', JSON.stringify(watched));
}

// --- Переменные ---
const episodeList = document.getElementById('episode-list');
let currentEpisode = null;
let currentQuality = '720';

const videoPlayer = document.getElementById('anime-video');
const qualityButtons = document.querySelectorAll('#quality-selector button');

// --- Кнопка Назад ---
const backBtn = document.getElementById('back-btn');
if(backBtn){
  backBtn.addEventListener('click', ()=> window.history.back());
}

// --- Перемотка ---
document.getElementById('back-10')?.addEventListener('click', ()=> {
  if(videoPlayer) videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 10);
});
document.getElementById('forward-10')?.addEventListener('click', ()=> {
  if(videoPlayer) videoPlayer.currentTime += 10;
});

// --- Выбор качества ---
qualityButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentQuality = btn.dataset.quality;
    if(currentEpisode && videoPlayer.src){
      const currentTime = videoPlayer.currentTime;
      playVideo(currentEpisode, currentTime);
    }
  });
});

// --- Проигрывание видео ---
function playVideo(epNum, restoreTime = 0){
  const selectedAnime = JSON.parse(localStorage.getItem('selectedAnime'));
  if(!selectedAnime || !videoPlayer) return;
  currentEpisode = epNum;

  let folder =
    selectedAnime.title === "Naruto" ? "naruto_s1" :
    selectedAnime.title === "One Piece" ? "onepiece_s1" : "";

  videoPlayer.src = `img/${folder}_e${epNum}_${currentQuality}.mp4`;

  const watchedPositions = JSON.parse(localStorage.getItem('watchedPositions')) || {};
  const animePositions = watchedPositions[selectedAnime.title] || {};
  videoPlayer.currentTime = animePositions[epNum] || restoreTime;

  document.getElementById('video-modal')?.classList.remove('hidden');
  saveWatchedEpisode(selectedAnime.title, epNum);
  renderEpisodes();
  videoPlayer.play();
}

// --- Сохраняем позицию ---
videoPlayer?.addEventListener('timeupdate', () => {
  if(currentEpisode === null) return;
  const selectedAnime = JSON.parse(localStorage.getItem('selectedAnime'));
  const watchedPositions = JSON.parse(localStorage.getItem('watchedPositions')) || {};
  if(!watchedPositions[selectedAnime.title]) watchedPositions[selectedAnime.title] = {};
  watchedPositions[selectedAnime.title][currentEpisode] = videoPlayer.currentTime;
  localStorage.setItem('watchedPositions', JSON.stringify(watchedPositions));
});

// --- Рендер главной ---
renderAnime(animeList);

// --- Серии ---
function renderEpisodes(){
  if(!episodeList) return;
  const selectedAnime = JSON.parse(localStorage.getItem('selectedAnime'));
  if(!selectedAnime) return;
  episodeList.innerHTML = '';

  const watched = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
  const watchedEpisodes = watched[selectedAnime.title] || [];

  const watchedPositions = JSON.parse(localStorage.getItem('watchedPositions')) || {};
  const animePositions = watchedPositions[selectedAnime.title] || {};

  let allEpisodes = [];

  if(selectedAnime.title === "Naruto"){
    allEpisodes = narutoSeason1.flatMap(a => a.episodes);
  }

  if(selectedAnime.title === "One Piece"){
    allEpisodes = onePieceSeason1.flatMap(a => a.episodes);
  }

  const episodesToShow = allEpisodes.slice(0, 10);

  episodesToShow.forEach(epNum => {
    const ep = document.createElement('div');
    ep.className = 'anime-card';
    const time = animePositions[epNum] || 0;
    const timeText = time > 0 ? `(до ${Math.floor(time/60)}:${Math.floor(time%60).toString().padStart(2,'0')})` : '';
    ep.innerHTML = `Серия ${epNum} ${watchedEpisodes.includes(epNum)?'✅':''} ${timeText}`;
    ep.addEventListener('click', ()=> playVideo(epNum));
    episodeList.appendChild(ep);
  });
}

// --- Автозагрузка ---
if(episodeList){
  const selectedAnime = JSON.parse(localStorage.getItem('selectedAnime'));
  if(!selectedAnime) window.location.href = 'index.html';
  else renderEpisodes();
}

// --- Закрытие модалки (кнопка + фон) ---
document.addEventListener('DOMContentLoaded', () => {
  const videoModal = document.getElementById('video-modal');
  const videoPlayer = document.getElementById('anime-video');
  const closeBtn = document.getElementById('close-btn');

  if(!videoModal || !videoPlayer || !closeBtn) return;

  function closeModal() {
    videoPlayer.pause();
    videoModal.classList.add('hidden');
  }

  // Крестик
  closeBtn.addEventListener('click', closeModal);

  // Клик по фону
  videoModal.addEventListener('click', (e) => {
    if(e.target === videoModal) closeModal();
  });

  // ESC убран
});
