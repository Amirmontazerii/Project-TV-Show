function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  createEpisodeSelector(allEpisodes);

  // Event listener for search
  document.getElementById("searchBar").addEventListener("input", function () {
    const searchQuery = this.value.toLowerCase();
    const filteredEpisodes = allEpisodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(searchQuery) ||
        episode.summary.toLowerCase().includes(searchQuery)
    );
    makePageForEpisodes(filteredEpisodes);
  });

  // Event listener for episode selector
  document.getElementById("episodeSelector").addEventListener("change", function () {
    const selectedId = this.value;
    if (selectedId === "all") {
      makePageForEpisodes(allEpisodes); // Show all episodes
    } else {
      const selectedEpisode = allEpisodes.find(ep => ep.id == selectedId);
      makePageForEpisodes([selectedEpisode]); // Show only selected episode
    }
  });
}

function createEpisodeSelector(episodeList) {
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = ""; // Clear previous options

  // Add "Show All" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Show All Episodes";
  selector.appendChild(allOption);

  // Add episodes to dropdown
  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    option.textContent = `${episodeCode} - ${episode.name}`;
    selector.appendChild(option);
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous content

  document.getElementById("episodeCount").textContent = `Showing ${episodeList.length} episode(s)`;

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";
    card.id = `episode-${episode.id}`; // Assign an ID for scrolling

    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    const title = document.createElement("h2");
    title.textContent = `${episode.name} (${episodeCode})`;

    const img = document.createElement("img");
    img.src = episode.image ? episode.image.medium : "https://via.placeholder.com/300";
    img.alt = episode.name;

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    const link = document.createElement("a");
    link.href = episode._links.self.href;
    link.target = "_blank";
    link.textContent = "More info on TVMaze";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);
    card.appendChild(link);

    rootElem.appendChild(card);
  });
}

window.onload = setup;
