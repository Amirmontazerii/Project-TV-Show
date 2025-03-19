const showsApiUrl = "https://api.tvmaze.com/shows";
let showCache = {}; // Store show details
let episodeCache = {}; // Store episode lists

// DOM Elements
const rootElem = document.getElementById("root");
const showSelector = document.getElementById("showSelector");
const episodeSelector = document.getElementById("episodeSelector");
const searchBar = document.getElementById("searchBar");

// Fetch and display all shows
async function fetchShows() {
  try {
    const response = await fetch(showsApiUrl);
    if (!response.ok) throw new Error("Failed to fetch shows");
    
    const shows = await response.json();
    shows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    
    shows.forEach(show => showCache[show.id] = show);
    displayShowsListing(shows);
  } catch (error) {
    console.error("Error fetching shows:", error);
    rootElem.innerHTML = `<p style="color: red;">Failed to load shows.</p>`;
  }
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

// Fetch and display episodes for a selected show
async function fetchAndDisplayShowEpisodes(showId) {
  rootElem.innerHTML = "<p>Loading episodes...</p>";

  if (episodeCache[showId]) {
    displayEpisodes(episodeCache[showId]);
    return;
  }

  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) throw new Error("Failed to fetch episodes");
    
    episodeCache[showId] = await response.json();
    displayEpisodes(episodeCache[showId]);
  } catch (error) {
    rootElem.innerHTML = `<p style="color: red;">Failed to load episodes.</p>`;
    console.error("Error fetching episodes:", error);
  }
}

// Display episodes
function displayEpisodes(episodes) {
  rootElem.innerHTML = `
    <button onclick="fetchShows()">Back to Shows</button>
    ${episodes.map(episode => `
      <div class="episode-card">
        <h3>${formatEpisodeTitle(episode)}</h3>
        <img src="${episode.image ? episode.image.medium : 'https://via.placeholder.com/210'}" alt="${episode.name}">
        <p>${episode.summary || "No description available."}</p>
      </div>
    `).join("")}
  `;
}

// Format episode title
function formatEpisodeTitle(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;
}

// Search functionality for shows
searchBar.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const filteredShows = Object.values(showCache).filter(show =>
    show.name.toLowerCase().includes(query) ||
    show.genres.some(genre => genre.toLowerCase().includes(query)) ||
    (show.summary && show.summary.toLowerCase().includes(query))
  );
  displayShowsListing(filteredShows);
});

// Initialize application
window.onload = fetchShows;
