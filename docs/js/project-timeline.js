async function loadProjectTimeline() {
  const container = document.getElementById("project-timeline");
  if (!container) return;

  const projectName = container.dataset.project;

  const res = await fetch("/data/project-updates.json");
  const updates = await res.json();

  const filtered = updates
    .filter(u => u.project === projectName)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="terminal-timeline">
        <div class="terminal-header">
          <span class="terminal-prompt">$</span>
          <span>tail -f research-log/${projectName}</span>
        </div>
        <div class="terminal-empty">No updates found.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="terminal-timeline">
      <div class="terminal-header">
        <span class="terminal-prompt">$</span>
        <span>tail -f research-log/${projectName}</span>
      </div>

      <div class="terminal-body">
        ${filtered.map((u, i) => {
          const hoursTag =
            u.hours_to_date !== null &&
            u.hours_to_date !== undefined &&
            u.hours_to_date !== ""
              ? `<span class="terminal-tag"># ${u.hours_to_date} hours logged to date</span>`
              : "";

          return `
            <article class="terminal-item">
              <div class="terminal-marker">
                <div class="terminal-dot"></div>
                ${i < filtered.length - 1 ? `<div class="terminal-line"></div>` : ""}
              </div>

              <div class="terminal-content">
                <div class="terminal-date">${u.date_pretty ?? u.date ?? ""}</div>
                <div class="terminal-summary">${u.summary ?? ""}</div>

                <div class="terminal-tags">
                  <span class="terminal-tag">${u.project ?? ""}</span>
                  ${hoursTag}
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

loadProjectTimeline();
