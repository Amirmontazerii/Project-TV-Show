
// URLs and data
const showsApiUrl = "https://api.tvmaze.com/shows";
let allShows = [];
let allEpisodes = {};
let isShowingEpisodes = false;

// Fetch and populate shows
async function fetchShows() {
  const showSelector = document.getElementById("showSelector");
  try {
    const response = await fetch(showsApiUrl);
    if (!response.ok) throw new Error("Failed to fetch shows");

    allShows = await response.json();
    allShows.sort((a, b) => a.name.localeCompare(b.name));

    renderShowsList(allShows);
    showSelector.innerHTML = allShows.map(show => `<option value="${show.id}">${show.name}</option>`).join("");
  } catch (error) {
    console.error("Error fetching shows:", error);
  }
}

// Render Shows List
function renderShowsList(shows) {
  isShowingEpisodes = false;
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = shows.map(show => `
    <div class="show-card" onclick="fetchEpisodes(${show.id})">
      <h3>${show.name}</h3>
      <img src="${show.image ? show.image.medium : 'https://via.placeholder.com/210'}" alt="${show.name}">
      <p>${show.summary || "No description available."}</p>
      <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${show.rating.average || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime || "N/A"} min</p>
    </div>
  `).join("");
}

// Fetch and display episodes
async function fetchEpisodes(showId) {
  isShowingEpisodes = true;
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading episodes...</p>";

  if (allEpisodes[showId]) {
    makePageForEpisodes(allEpisodes[showId]);
    return;
  }

  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) throw new Error("Failed to fetch episodes");

    allEpisodes[showId] = await response.json();
    makePageForEpisodes(allEpisodes[showId]);
    createEpisodeSelector(allEpisodes[showId]);
  } catch (error) {
    rootElem.innerHTML = `<p style="color: red;">Failed to load episodes.</p>`;
    console.error("Error fetching episodes:", error);
  }
}

// Display Episodes
function makePageForEpisodes(episodes) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = episodes.map(episode => `
    <div class="episode-card">
      <h3>${formatEpisodeTitle(episode)}</h3>
      <img src="${episode.image ? episode.image.medium : 'https://via.placeholder.com/210'}" alt="${episode.name}">
      <p>${episode.summary || "No description available."}</p>
    </div>
  `).join("");
}

// Format Episode Title
function formatEpisodeTitle(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;
}

// Go Back to Shows Listing
function goBackToShows() {
  renderShowsList(allShows);
}

// Handle Search
function handleSearch() {
  const query = document.getElementById("searchBar").value.toLowerCase();
  if (isShowingEpisodes) {
    const selectedShowId = document.getElementById("showSelector").value;
    const filteredEpisodes = allEpisodes[selectedShowId].filter(
      episode => episode.name.toLowerCase().includes(query) || (episode.summary && episode.summary.toLowerCase().includes(query))
    );
    makePageForEpisodes(filteredEpisodes);
  } else {
    const filteredShows = allShows.filter(
      show => show.name.toLowerCase().includes(query) || show.genres.some(g => g.toLowerCase().includes(query)) || (show.summary && show.summary.toLowerCase().includes(query))
    );
    renderShowsList(filteredShows);
  }
}

// Initialize
window.onload = fetchShows;
document.getElementById("searchBar").addEventListener("input", handleSearch);
document.getElementById("backToShows").addEventListener("click", goBackToShows);