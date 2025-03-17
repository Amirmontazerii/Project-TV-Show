const apiUrl = "https://api.tvmaze.com/shows/82/episodes";
let allEpisodes = []; // Store episodes globally after fetching

async function fetchEpisodes() {
  const rootElem = document.getElementById("root");

  try {
    // Show loading message
    rootElem.innerHTML = "<p>Loading episodes...</p>";

    // Fetch episodes from API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse JSON response
    allEpisodes = await response.json();

    // Render episodes & episode selector
    makePageForEpisodes(allEpisodes);
    createEpisodeSelector(allEpisodes);
  } catch (error) {
    // Show error message in UI
    rootElem.innerHTML = `<p style="color: red;">Failed to load episodes. Please try again later.</p>`;
    console.error("Error fetching episodes:", error);
  }
}

// Function to display episodes
function makePageForEpisodes(episodes) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous content

  if (episodes.length === 0) {
    rootElem.innerHTML = "<p>No episodes found.</p>";
    return;
  }

  episodes.forEach((episode) => {
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";

    episodeCard.innerHTML = `
      <h3>${formatEpisodeTitle(episode)}</h3>
      <img src="${
        episode.image ? episode.image.medium : "https://via.placeholder.com/210"
      }" alt="${episode.name}">
      <p>${episode.summary || "No description available."}</p>
    `;

    rootElem.appendChild(episodeCard);
  });
}

// Function to format episode title
function formatEpisodeTitle(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")} - ${episode.name}`;
}

// Function to create episode dropdown
function createEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = `<option value="all">Show All Episodes</option>`; // Reset options

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = formatEpisodeTitle(episode);
    selector.appendChild(option);
  });
}

// Search functionality
document.getElementById("searchBar").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const filteredEpisodes = allEpisodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(query) ||
      (episode.summary && episode.summary.toLowerCase().includes(query))
  );
  makePageForEpisodes(filteredEpisodes);
});

// Episode selector functionality
document
  .getElementById("episodeSelector")
  .addEventListener("change", function () {
    const selectedId = this.value;
    if (selectedId === "all") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.find((ep) => ep.id == selectedId);
      makePageForEpisodes([selectedEpisode]);
    }
  });

// Initialize application on page load
window.onload = fetchEpisodes;

//window.onload = setup;
