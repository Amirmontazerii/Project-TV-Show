function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

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
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous content

  document.getElementById(
    "episodeCount"
  ).textContent = `Showing ${episodeList.length} episode(s)`;

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";

    // Create episode code
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;

    // Title with episode code
    const title = document.createElement("h2");
    title.textContent = `${episode.name} (${episodeCode})`;

    // Image
    const img = document.createElement("img");
    img.src = episode.image
      ? episode.image.medium
      : "https://via.placeholder.com/300";
    img.alt = episode.name;

    // Summary
    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    // Create link to TVMaze for each episode
    const link = document.createElement("a");
    link.href = episode._links.self.href;
    link.target = "_blank";
    link.textContent = "More info on TVMaze";

    // Append elements to the card
    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);
    card.appendChild(link);

    // Append the card to the root
    rootElem.appendChild(card);
  });
}

window.onload = setup;
