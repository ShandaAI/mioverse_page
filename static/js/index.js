/*  ============================================
    Shanda AI Research Tokyo — Content Loader
    ============================================
    All editable content lives in /content/*.json and /content/*.md.
    This script fetches those files and renders them into the page.
*/

// ---- Page Detection ---- //

const PAGE = (function () {
  const path = window.location.pathname.split("/").pop() || "index.html";
  if (path === "" || path === "index.html") return "home";
  if (path === "research.html") return "research";
  if (path === "platform.html") return "platform";
  if (path === "blog.html") return "blog";
  return "home";
})();

const CONTENT_BASE = "content";

// ---- Helpers ---- //

function fetchJSON(path) {
  return fetch(`${CONTENT_BASE}/${path}`).then((r) => r.json());
}

function fetchText(path) {
  return fetch(`${CONTENT_BASE}/${path}`).then((r) => r.text());
}

function md(text) {
  if (typeof marked !== "undefined") {
    return marked.parse(text);
  }
  return text
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, " ")}</p>`)
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---- Shared: Category Tabs ---- //

function renderTabs(containerId, categories, activeId, onSelect) {
  const html =
    `<button class="research-tab ${activeId === "all" ? "is-active" : ""}" data-cat="all">All</button>` +
    categories
      .map(
        (c) =>
          `<button class="research-tab ${activeId === c.id ? "is-active" : ""}" data-cat="${c.id}">
            <i class="${c.icon}"></i> ${escapeHtml(c.label)}
          </button>`
      )
      .join("");

  const container = document.getElementById(containerId);
  container.innerHTML = html;
  container.querySelectorAll(".research-tab").forEach((btn) => {
    btn.addEventListener("click", function () {
      container.querySelectorAll(".research-tab").forEach((b) => b.classList.remove("is-active"));
      this.classList.add("is-active");
      onSelect(this.dataset.cat);
    });
  });
}

// ---- Render Functions ---- //

function renderAbout(markdown) {
  document.getElementById("about-content").innerHTML = md(markdown);
}

function renderNews(items) {
  const badgeClass = {
    paper: "badge-paper",
    release: "badge-release",
    lab: "badge-announcement",
    announcement: "badge-announcement",
  };

  const html = items
    .map(
      (item) => `
    <div class="news-item">
      <span class="news-date">${escapeHtml(item.date)}</span>
      <span class="news-badge ${badgeClass[item.badge] || "badge-announcement"}">${escapeHtml(item.badge)}</span>
      <span class="news-text">${item.text}</span>
    </div>`
    )
    .join("");

  document.getElementById("news-list").innerHTML = html;
}

// ---- Projects (with category filter) ---- //

let _allProjects = [];
let _categories = [];

function renderProjectsForCategory(catId) {
  const projects = catId === "all" ? _allProjects : _allProjects.filter((p) => p.category === catId);
  const featured = projects.filter((p) => p.featured);
  const regular = projects.filter((p) => !p.featured);

  // Featured projects
  const featuredHtml = featured
    .map((p) => {
      const media = p.video
        ? `<video poster="" loop muted playsinline autoplay><source src="${p.video}" type="video/mp4"></video>`
        : p.image
          ? `<img src="${p.image}" alt="${escapeHtml(p.title)}">`
          : "";

      const catLabel = _categories.find((c) => c.id === p.category);
      const catBadge = catLabel ? `<span class="project-cat-badge">${escapeHtml(catLabel.label)}</span>` : "";

      const links = p.links
        .map(
          (l) => `
        <a href="${l.url}" target="_blank" class="button is-small is-rounded is-dark">
          <span class="icon"><i class="${l.icon}"></i></span><span>${escapeHtml(l.label)}</span>
        </a>`
        )
        .join("");

      return `
      <div class="project-card project-featured">
        <div class="columns is-vcentered">
          <div class="column is-5">
            <div class="project-media">${media}</div>
          </div>
          <div class="column is-7">
            <span class="project-tag">Featured</span> ${catBadge}
            <h3 class="project-title">${escapeHtml(p.title)}</h3>
            ${p.authors ? `<p class="project-authors">${escapeHtml(p.authors)}</p>` : ""}
            <p class="project-desc">${escapeHtml(p.description)}</p>
            <div class="project-links">${links}</div>
          </div>
        </div>
      </div>`;
    })
    .join("");

  document.getElementById("projects-featured").innerHTML = featuredHtml;

  // Regular project cards
  const gridHtml = regular
    .map((p) => {
      let mediaHtml;
      if (p.image) {
        mediaHtml = `<div class="project-media-small"><img src="${p.image}" alt="${escapeHtml(p.title)}"></div>`;
      } else if (p.placeholderIcon) {
        mediaHtml = `<div class="project-media-small placeholder-media"><i class="${p.placeholderIcon}"></i></div>`;
      } else {
        mediaHtml = `<div class="project-media-small placeholder-media"><i class="fas fa-flask"></i></div>`;
      }

      let linksHtml;
      if (p.comingSoon) {
        linksHtml = `<span class="tag is-dark">Coming Soon</span>`;
      } else {
        linksHtml = p.links
          .map(
            (l) => `
          <a href="${l.url}" target="_blank" class="button is-small is-rounded is-dark">
            <span class="icon"><i class="${l.icon}"></i></span><span>${escapeHtml(l.label)}</span>
          </a>`
          )
          .join("");
      }

      const catLabel = _categories.find((c) => c.id === p.category);
      const catBadge = catLabel ? `<span class="project-cat-badge">${escapeHtml(catLabel.label)}</span>` : "";

      return `
      <div class="column is-4">
        <div class="project-card-small">
          ${mediaHtml}
          <div class="project-card-small-header">
            ${catBadge}
            <h4 class="project-title-small">${escapeHtml(p.title)}</h4>
          </div>
          <p class="project-desc-small">${escapeHtml(p.description)}</p>
          <div class="project-links">${linksHtml}</div>
        </div>
      </div>`;
    })
    .join("");

  document.getElementById("projects-grid").innerHTML = gridHtml;
}

function initProjects(categories, projects) {
  _categories = categories;
  _allProjects = projects;
  renderTabs("research-tabs", categories, "all", renderProjectsForCategory);
  renderProjectsForCategory("all");
}

// ---- Publications ---- //

function renderPublications(pubs) {
  if (pubs.length === 0) {
    document.getElementById("pub-list").innerHTML =
      `<p class="has-text-centered" style="color: var(--text-muted); padding: 2rem 0;">No publications yet.</p>`;
    return;
  }

  const html = pubs
    .map((p) => {
      const links = p.links
        .map(
          (l) =>
            `<a href="${l.url}" target="_blank"><i class="${l.icon}"></i> ${escapeHtml(l.label)}</a>`
        )
        .join("");

      const venueBadge = p.venue ? `<span class="pub-cat-badge">${escapeHtml(p.venue)}</span>` : "";

      return `
      <div class="pub-item">
        <div class="pub-venue-year">
          <span class="pub-year">${escapeHtml(p.year)}</span>
        </div>
        <div class="pub-details">
          <h4 class="pub-title"><a href="${p.links[0]?.url || "#"}" target="_blank">${escapeHtml(p.title)}</a> ${venueBadge}</h4>
          <p class="pub-authors">${escapeHtml(p.authors)}</p>
          <div class="pub-links">${links}</div>
        </div>
      </div>`;
    })
    .join("");

  document.getElementById("pub-list").innerHTML = html;
}

// ---- Blog ---- //

async function renderBlog(index) {
  const posts = await Promise.all(
    index.map(async (entry) => {
      try {
        const body = await fetchText(`blog/${entry.file}`);
        const plain = body.replace(/\*\*[^*]+\*\*/g, (m) => m.slice(2, -2)).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
        const firstPara = plain.split(/\n\n/)[0] || plain;
        const excerpt = firstPara.length > 120 ? firstPara.slice(0, 120).replace(/\s+\S*$/, "") + "..." : firstPara;
        return { ...entry, excerpt, body };
      } catch {
        return { ...entry, excerpt: "", body: "" };
      }
    })
  );

  const html = posts
    .map(
      (p) => `
    <div class="column is-6">
      <div class="blog-card" data-slug="${p.slug}">
        ${p.image ? `<div class="blog-card-image"><img src="${p.image}" alt="${escapeHtml(p.title)}"></div>` : ""}
        <div class="blog-card-content">
          <span class="blog-date">${escapeHtml(p.date)}</span>
          <h4 class="blog-title"><a href="#blog-${p.slug}">${escapeHtml(p.title)}</a></h4>
          <p class="blog-excerpt">${escapeHtml(p.excerpt)}</p>
          <a href="#blog-${p.slug}" class="blog-read-more" data-slug="${p.slug}">Read more &rarr;</a>
        </div>
      </div>
    </div>`
    )
    .join("");

  document.getElementById("blog-list").innerHTML = html;
  window.__blogPosts = posts;

  document.querySelectorAll(".blog-read-more").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const slug = this.dataset.slug;
      const post = window.__blogPosts.find((p) => p.slug === slug);
      if (post) showBlogPost(post);
    });
  });
}

function showBlogPost(post) {
  let overlay = document.getElementById("blog-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "blog-overlay";
    overlay.className = "blog-overlay";
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="blog-overlay-content">
      <button class="blog-overlay-close" aria-label="Close">&times;</button>
      <span class="blog-date">${escapeHtml(post.date)}</span>
      <h2 class="blog-overlay-title">${escapeHtml(post.title)}</h2>
      <div class="blog-overlay-body">${md(post.body)}</div>
    </div>`;

  overlay.classList.add("is-active");
  document.body.style.overflow = "hidden";

  overlay.querySelector(".blog-overlay-close").addEventListener("click", closeBlog);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeBlog();
  });
}

function closeBlog() {
  const overlay = document.getElementById("blog-overlay");
  if (overlay) {
    overlay.classList.remove("is-active");
    document.body.style.overflow = "";
  }
}

// ---- Active Nav Highlight ---- //

function highlightActiveNav() {
  const navLinks = document.querySelectorAll(".navbar-end .navbar-item:not(.contact-btn)");
  const pageMap = { home: "index.html", research: "research.html", platform: "platform.html", blog: "blog.html" };
  const target = pageMap[PAGE];

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === target) {
      link.classList.add("is-active-page");
    }
  });
}

// ---- Init ---- //

$(document).ready(function () {
  // Navbar burger toggle (mobile)
  $(".navbar-burger").click(function () {
    $(".navbar-burger").toggleClass("is-active");
    $("#mainNavbar").toggleClass("is-active");
  });

  // Close mobile menu on link click
  $(".navbar-menu .navbar-item").click(function () {
    $(".navbar-burger").removeClass("is-active");
    $("#mainNavbar").removeClass("is-active");
  });

  // Highlight active page in navbar
  highlightActiveNav();

  // Platform page — load products from JSON, render tabs & panels
  if (PAGE === "platform") {
    var productFiles = ["digital-human.json", "tts.json", "world-model.json", "audio2motion.json"];
    var defaultProduct = "audio2motion";

    Promise.all(productFiles.map(function (f) {
      return fetch(CONTENT_BASE + "/platform/" + f).then(function (r) { return r.json(); });
    })).then(function (products) {
      // Render tabs
      var tabsHtml = products.map(function (p, i) {
        return '<button class="platform-tab' + (p.id === defaultProduct ? ' is-active' : '') + '" data-demo="' + p.id + '">' +
          '<span class="platform-tab-icon"><i class="' + p.tab.icon + '"></i></span>' +
          '<div class="platform-tab-text">' +
            '<span class="platform-tab-label">' + escapeHtml(p.tab.label) + '</span>' +
            '<span class="platform-tab-bold">' + escapeHtml(p.tab.bold) + '</span>' +
            '<span class="platform-tab-desc">' + escapeHtml(p.tab.desc) + '</span>' +
          '</div>' +
        '</button>';
      }).join("");
      document.getElementById("platform-tabs-row").innerHTML = tabsHtml;

      // Render panels
      var panelsHtml = products.map(function (p, i) {
        var bgHtml;
        if (p.panel.background.type === "video") {
          bgHtml = '<video loop muted playsinline autoplay>' +
            '<source src="' + p.panel.background.src + '" type="video/mp4">' +
          '</video>';
        } else if (p.panel.background.type === "hls") {
          bgHtml = '<video id="hls-video-' + p.id + '" loop muted playsinline autoplay></video>';
        } else if (p.panel.background.type === "image") {
          bgHtml = '<img src="' + p.panel.background.src + '" alt="">';
        } else if (p.panel.background.type === "audio-samples" && p.panel.background.samples) {
          bgHtml = '<div class="tts-samples-grid">' +
            p.panel.background.samples.map(function (s, si) {
              return '<div class="tts-sample-card">' +
                '<div class="tts-sample-text">' + escapeHtml(s.text) + '</div>' +
                '<div class="tts-sample-footer">' +
                  '<span class="tts-emotion-badge tts-emotion-' + s.emotion.toLowerCase() + '">' + escapeHtml(s.emotion) + '</span>' +
                  '<button class="tts-play-btn" data-audio="' + s.audio + '" aria-label="Play">' +
                    '<i class="fas fa-play"></i>' +
                  '</button>' +
                '</div>' +
                '<audio src="' + s.audio + '" preload="none"></audio>' +
              '</div>';
            }).join("") +
          '</div>';
        } else if (p.panel.background.type === "video-grid" && p.panel.background.videos) {
          bgHtml = '<div class="video-grid">' +
            p.panel.background.videos.map(function (v) {
              return '<div class="video-grid-item">' +
                '<video loop muted playsinline autoplay>' +
                  '<source src="' + v.src + '" type="video/mp4">' +
                '</video>' +
                (v.caption ? '<span class="video-grid-caption">' + escapeHtml(v.caption) + '</span>' : '') +
              '</div>';
            }).join("") +
          '</div>';
        } else if (p.panel.background.type === "video-grid-grouped" && p.panel.background.groups) {
          bgHtml = '<div class="video-grid-grouped">' +
            p.panel.background.groups.map(function (g) {
              return '<div class="video-grid-group">' +
                '<h3 class="video-grid-group-title">' + escapeHtml(g.title) + '</h3>' +
                '<div class="video-grid' + (g.columns ? ' video-grid-cols-' + g.columns : '') + '">' +
                  g.videos.map(function (v) {
                    return '<div class="video-grid-item">' +
                      '<video loop muted playsinline autoplay>' +
                        '<source src="' + v.src + '" type="video/mp4">' +
                      '</video>' +
                    '</div>';
                  }).join("") +
                '</div>' +
              '</div>';
            }).join("") +
          '</div>';
        } else {
          bgHtml = '<div class="platform-panel-placeholder"><i class="' + (p.panel.background.icon || "fas fa-flask") + '"></i></div>';
        }

        return '<div class="platform-panel' + (p.id === defaultProduct ? ' is-active' : '') + '" id="panel-' + p.id + '">' +
          '<div class="platform-panel-bg">' + bgHtml + '</div>' +
          '<div class="platform-panel-overlay">' +
            '<div class="platform-panel-content">' +
              '<span class="platform-panel-badge">' + escapeHtml(p.panel.badge) + '</span>' +
              '<h2 class="platform-panel-headline">' + p.panel.headline + '</h2>' +
              '<p class="platform-panel-desc">' + escapeHtml(p.panel.description) + '</p>' +
              (p.panel.buttons
                ? '<div class="platform-panel-buttons">' + p.panel.buttons.map(function (b) {
                    var iconHtml = b.iconSvg ? b.iconSvg : '<i class="' + (b.icon || 'fas fa-arrow-right') + '"></i>';
                    return '<a href="' + b.link + '" class="button is-medium is-rounded home-btn-secondary" target="_blank" rel="noopener">' +
                      iconHtml + '&ensp;' + escapeHtml(b.text) + '</a>';
                  }).join("") + '</div>'
                : '<a href="' + p.panel.buttonLink + '" class="button is-medium is-rounded home-btn-secondary">' +
                    escapeHtml(p.panel.buttonText) + '&ensp;<i class="fas fa-arrow-right"></i></a>'
              ) +
            '</div>' +
          '</div>' +
        '</div>';
      }).join("");
      document.getElementById("platform-panels").innerHTML = panelsHtml;

      // Bind tab clicks
      $(".platform-tab").click(function () {
        var demoId = $(this).data("demo");
        $(".platform-tab").removeClass("is-active");
        $(this).addClass("is-active");
        $(".platform-panel").removeClass("is-active");
        $("#panel-" + demoId).addClass("is-active");
      });

      // Bind TTS play/pause buttons
      $(".tts-play-btn").click(function () {
        var btn = $(this);
        var card = btn.closest(".tts-sample-card");
        var audio = card.find("audio")[0];
        // Pause any other playing sample
        $(".tts-play-btn").not(btn).each(function () {
          var otherAudio = $(this).closest(".tts-sample-card").find("audio")[0];
          if (otherAudio && !otherAudio.paused) {
            otherAudio.pause();
            otherAudio.currentTime = 0;
            $(this).removeClass("is-playing").find("i").attr("class", "fas fa-play");
          }
        });
        if (audio.paused) {
          audio.play();
          btn.addClass("is-playing").find("i").attr("class", "fas fa-pause");
        } else {
          audio.pause();
          audio.currentTime = 0;
          btn.removeClass("is-playing").find("i").attr("class", "fas fa-play");
        }
        audio.onended = function () {
          btn.removeClass("is-playing").find("i").attr("class", "fas fa-play");
        };
      });

      // Init HLS videos
      products.forEach(function (p) {
        if (p.panel.background.type === "hls") {
          var vid = document.getElementById("hls-video-" + p.id);
          if (vid && typeof Hls !== "undefined" && Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(p.panel.background.src);
            hls.attachMedia(vid);
            hls.on(Hls.Events.MANIFEST_PARSED, function () { vid.play(); });
          } else if (vid && vid.canPlayType("application/vnd.apple.mpegurl")) {
            vid.src = p.panel.background.src;
            vid.addEventListener("loadedmetadata", function () { vid.play(); });
          }
        }
      });
    }).catch(function (err) { console.error("Failed to load platform:", err); });
  }

  // Home page — load hero text + about from homepage.md
  if (PAGE === "home") {
    fetchText("homepage.md").then(function (text) {
      // Parse YAML-like frontmatter
      var match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (match) {
        var frontmatter = match[1];
        var body = match[2].trim();

        // Extract title and subtitle from frontmatter
        var titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
        var subtitleMatch = frontmatter.match(/^subtitle:\s*(.+)$/m);

        if (titleMatch) {
          var raw = titleMatch[1];
          // Apply gradient to "Interactive Intelligence"
          var formatted = raw
            .replace("Interactive Intelligence", '<span class="gradient-headline">Interactive Intelligence</span>')
            .replace(" through ", "<br>through ")
            .replace(" & ", "<br>&amp; ");
          document.getElementById("home-title").innerHTML = formatted;
        }
        if (subtitleMatch) {
          document.getElementById("home-subtitle").textContent = subtitleMatch[1];
        }

        // Render body as About Us
        renderAbout(body);
      } else {
        // No frontmatter, treat entire file as about content
        renderAbout(text);
      }
    }).catch(function (err) { console.error("Failed to load homepage:", err); });
  }

  // Research page — load news, projects, publications
  if (PAGE === "research") {
    fetchJSON("categories.json").then((categories) => {
      Promise.all([
        fetchJSON("projects.json").then((projects) => initProjects(categories, projects)),
        fetchJSON("publications.json").then(renderPublications),
      ]);
    });

    fetchJSON("news.json").then(renderNews).catch((err) => console.error("Failed to load news:", err));
  }

  // Blog page — load blog posts
  if (PAGE === "blog") {
    fetchJSON("blog/index.json").then(renderBlog).catch((err) => console.error("Failed to load blog:", err));

    $(document).on("keydown", function (e) {
      if (e.key === "Escape") closeBlog();
    });
  }
});
