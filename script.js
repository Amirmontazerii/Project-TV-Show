const showsApiUrl = "https://api.tvmaze.com/shows";
let allShows = []; 
let allEpisodes = {}; 

// Fetch and populate show selector
async function fetchShows() {
  const showSelector = document.getElementById("showSelector");
  try {
    const response = await fetch(showsApiUrl);
    if (!response.ok) throw new Error("Failed to fetch shows");
    
    allShows = await response.json();
    allShows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    
    showSelector.innerHTML = allShows.map(show => `<option value="${show.id}">${show.name}</option>`).join("");
    
    fetchEpisodes(allShows[0].id); // Load first show's episodes by default
  } catch (error) {
    console.error("Error fetching shows:", error);
  }
}

// Fetch episodes for selected show
async function fetchEpisodes(showId) {
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

// Populate episode dropdown and display episodes
function createEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = `<option value="all">Show All Episodes</option>` + 
    episodes.map(episode => `<option value="${episode.id}">${formatEpisodeTitle(episode)}</option>`).join("");
}

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

// Format episode title
function formatEpisodeTitle(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;
}

// Handle search functionality
document.getElementById("searchBar").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const selectedShowId = document.getElementById("showSelector").value;
  const filteredEpisodes = allEpisodes[selectedShowId].filter(
    (episode) => episode.name.toLowerCase().includes(query) || (episode.summary && episode.summary.toLowerCase().includes(query))
  );
  makePageForEpisodes(filteredEpisodes);
});

// Handle episode selection
document.getElementById("episodeSelector").addEventListener("change", function () {
  const selectedId = this.value;
  const selectedShowId = document.getElementById("showSelector").value;
  if (selectedId === "all") {
    makePageForEpisodes(allEpisodes[selectedShowId]);
  } else {
    makePageForEpisodes([allEpisodes[selectedShowId].find(ep => ep.id == selectedId)]);
  }
});

// Handle show selection
document.getElementById("showSelector").addEventListener("change", function () {
  fetchEpisodes(this.value);
});

// Initialize application
window.onload = fetchShows;
