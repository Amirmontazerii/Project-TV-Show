const showsApiUrl = "https://api.tvmaze.com/shows";
let showCache = {}; // Store show details
let episodeCache = {}; // Store episode lists

// DOM Elements
const rootElem = document.getElementById("root");
const backToShowsBtn = document.getElementById("backToShows");
const showSelector = document.getElementById("showSelector");
const episodeSearchBar = document.getElementById("episodeSearchBar");
const episodeSelector = document.getElementById("episodeSelector");

// Fetch and display all shows
async function fetchShows() {
  try {
    const response = await fetch(showsApiUrl);
    if (!response.ok) throw new Error("Failed to fetch shows");
    
    const shows = await response.json();
    shows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    
    shows.forEach(show => showCache[show.id] = show);
    populateShowSelector(shows);
    displayShowsListing(shows);
    backToShowsBtn.style.display = "none";
  } catch (error) {
    console.error("Error fetching shows:", error);
    rootElem.innerHTML = `<p style="color: red;">Failed to load shows.</p>`;
  }
}

// Populate the Show Selector dropdown
function populateShowSelector(shows) {
  showSelector.innerHTML = `<option value="">Select a Show</option>`;
  shows.forEach(show => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelector.appendChild(option);
  });
}

// Fetch and display episodes for a selected show
async function fetchAndDisplayShowEpisodes(showId) {
  rootElem.innerHTML = "<p>Loading episodes...</p>";
  backToShowsBtn.style.display = "block";

  if (episodeCache[showId]) {
    displayEpisodes(episodeCache[showId]);
    return;
  }

  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) throw new Error("Failed to fetch episodes");
    
    episodeCache[showId] = await response.json();
    populateEpisodeSelector(episodeCache[showId]);
    displayEpisodes(episodeCache[showId]);
  } catch (error) {
    rootElem.innerHTML = `<p style="color: red;">Failed to load episodes.</p>`;
    console.error("Error fetching episodes:", error);
  }
}

// Populate the Episode Selector dropdown
function populateEpisodeSelector(episodes) {
  episodeSelector.innerHTML = `<option value="all">Show All Episodes</option>`;
  episodes.forEach(episode => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = formatEpisodeTitle(episode);
    episodeSelector.appendChild(option);
  });
}

// Display all shows
function displayShowsListing(shows) {
  rootElem.innerHTML = shows.map(show => `
    <div class="show-card" onclick="fetchAndDisplayShowEpisodes(${show.id})">
      <h2>${show.name}</h2>
      <img src="${show.image ? show.image.medium : 'https://via.placeholder.com/210'}" alt="${show.name}">
      <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
      <p><strong>Status:</strong> ${show.status} | <strong>Rating:</strong> ${show.rating.average || 'N/A'} | <strong>Runtime:</strong> ${show.runtime || 'Unknown'} min</p>
      <p>${show.summary}</p>
    </div>
  `).join("");
}

// Display episodes
function displayEpisodes(episodes) {
  rootElem.innerHTML = episodes.map(episode => `
    <div class="episode-card">
      <h3>${formatEpisodeTitle(episode)}</h3>
      <img src="${episode.image ? episode.image.medium : 'https://via.placeholder.com/210'}" alt="${episode.name}">
      <p>${episode.summary || "No description available."}</p>
    </div>
  `).join("");
}

// Format episode title
function formatEpisodeTitle(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;
}

// Filter episodes by search query
episodeSearchBar.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const selectedShowId = showSelector.value;
  
  const filteredEpisodes = episodeCache[selectedShowId].filter(episode =>
    episode.name.toLowerCase().includes(query) ||
    (episode.summary && episode.summary.toLowerCase().includes(query))
  );
  displayEpisodes(filteredEpisodes);
});

// Show selected episodes
episodeSelector.addEventListener("change", function () {
  const selectedShowId = showSelector.value;
  const selectedEpisodeId = this.value;

  if (selectedEpisodeId === "all") {
    displayEpisodes(episodeCache[selectedShowId]);
  } else {
    const selectedEpisode = episodeCache[selectedShowId].find(episode => episode.id == selectedEpisodeId);
    displayEpisodes([selectedEpisode]);
  }
});

// Initialize application
window.onload = fetchShows;
