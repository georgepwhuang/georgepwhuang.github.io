// Applying Light mode...
const modeToggleBtn = document.getElementById("mode-toggle-btn");
const modeBtn = document.getElementById("mood-btn");
const modeIcon = document.getElementById("mood-icon");
const lightModeKey = "light-mode";

const updateLightMode = (enabled) => {
  // 1. Toggle the class on the body
  document.body.classList.toggle("light-mode", enabled);
  modeBtn.classList.toggle("light-mode", enabled);
  if (enabled) {
    modeIcon.classList.remove("fa-moon");
    modeIcon.classList.add("fa-sun");
  }
  else {
    modeIcon.classList.remove("fa-sun");
    modeIcon.classList.add("fa-moon");
  }

  // 2. Update lightMode in localStorage
  localStorage.setItem(lightModeKey, enabled ? "enabled" : "disabled");
};

if (!localStorage.getItem(lightModeKey)) {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    updateLightMode(true);
  }
}
else {
  updateLightMode(localStorage.getItem(lightModeKey) === "enabled");
}

// Toggle light mode when the button is clicked
modeToggleBtn.addEventListener("click", () => {
  // Toggle the current lightMode setting
  updateLightMode(localStorage.getItem(lightModeKey) !== "enabled");
});

const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("article[data-page]");

function resolvePageFromUrl() {
  const pageName = window.location.hash.slice(1);
  let matchFound = false;

  pages.forEach((page, index) => {
    const isActive = page.dataset.page === pageName;

    page.classList.toggle("active", isActive);
    navigationLinks[index].classList.toggle("active", isActive);

    if (isActive) matchFound = true;
  });

  // No hash OR invalid hash → activate default article
  if (!pageName || !matchFound) {
    pages.forEach((page, index) => {
      const isDefault = index === 0;

      page.classList.toggle("active", isDefault);
      navigationLinks[index].classList.toggle("active", isDefault);
    });
  }

  window.scrollTo(0, 0);
}

// Navigation click handling
navigationLinks.forEach(link => {
  link.addEventListener("click", function () {
    const pageName = this.textContent.trim().toLowerCase();
    location.hash = pageName; // triggers hashchange
  });
});

// Initial load
window.addEventListener("DOMContentLoaded", resolvePageFromUrl);

// URL changes (manual edit, back/forward)
window.addEventListener("hashchange", resolvePageFromUrl);

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });


// testimonials variables
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}


// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);

// Add keyboard support for modal (Escape key)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalContainer.classList.contains("active")) {
    testimonialsModalFunc();
  }
});

function copyToClipboard(text) {
  // Use modern Clipboard API if available
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(err => {
        console.warn("Clipboard API failed, falling back", err);
        return fallbackCopyToClipboard(text);
      });
  } else {
    return fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-999999px";
  textarea.style.top = "-999999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.warn("Fallback copy failed", err);
    document.body.removeChild(textarea);
    return false;
  }
}

function loadModal(testimonial) {
  modalTitle.innerHTML = testimonial.querySelector("[data-testimonials-title]").innerHTML;
  modalText.innerHTML = testimonial.querySelector("[data-testimonials-text]").innerHTML;
  testimonialsModalFunc();
}

function copyText() {
  const copyText = modalText.textContent;
  copyToClipboard(copyText.trim()).then(success => {
    if (success) {
      // Could be replaced with a toast notification
      alert("BibTeX copied!");
    } else {
      alert("Failed to copy BibTeX. Please try manually.");
    }
  });
}

function download() {
  const text = modalText.textContent.trim();
  const filename = text.split(",")[0].split("{")[1] + ".bib";
  const a = document.createElement('a');
  const blob = new Blob([text], { type: "data:text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toggleBib(item) {
  const id = item.getAttribute("key");
  const abs = document.getElementById("bib" + id);
  abs.classList.toggle("active");
  if (abs.classList.contains('active')) {
    abs.style.maxHeight = abs.scrollHeight + 'px';
  } else {
    abs.style.maxHeight = "0";
  }
}

const auxData = YAML.load("files/aux.yml") || {};

function insertAbstract(entry, id, absText) {
  entry.querySelector(".clickables")?.insertAdjacentHTML(
    "afterbegin",
    `<span>
       <a role="button" key="${id}" onclick="toggleBib(this)">abs</a>
     </span> `
  );

  entry.querySelector(".abs")?.insertAdjacentHTML(
    "afterbegin",
    `<pre>${absText}</pre>`
  );
}

function insertNote(entry, noteText) {
  entry.querySelector(".note")?.insertAdjacentHTML(
    "afterbegin",
    `<br><i>— ${noteText} —</i>`
  );
}

function insertLink(entry, label, url) {
  entry.querySelector(".clickables")?.insertAdjacentHTML(
    "beforeend",
    `<span>
       <a target="_blank" href="${url}" role="button">${label}</a>
     </span> `
  );
}

function findAux(container) {
  container.querySelectorAll(".bibitem").forEach(entry => {
    const id = entry.querySelector(".entry")?.getAttribute("key");
    if (!id || !auxData[id]) return;

    const itemData = auxData[id];

    Object.entries(itemData).forEach(([key, value]) => {
      if (!value) return;

      switch (key) {
        case "abs":
          insertAbstract(entry, id, value);
          break;

        case "note":
          insertNote(entry, value);
          break;

        default:
          insertLink(entry, key, value);
      }
    });
  });
}

const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDateString(date) {
  let yyyy = date.getFullYear();
  let mm = date.getMonth();
  let dd = date.getDate();

  if (dd < 10) dd = '0' + dd;

  return dd + " " + month[mm] + " " + yyyy;
}

function parseForLinks(markdown) {
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const html = markdown.replace(markdownLinkRegex, '<a href="$2">$1</a>');
  return html;
}

const MAX_RECENT_NEWS = 7;

// Load and process news data efficiently
function loadNewsData() {
  const newsData = (YAML.load("files/news.yml") || [])
    .map(item => ({
      ...item,
      date: new Date(item.date)
    }))
    .sort((a, b) => b.date - a.date);
  
  const recentNews = newsData.slice(0, MAX_RECENT_NEWS);
  const olderNews = newsData.slice(MAX_RECENT_NEWS);
  
  return { recentNews, olderNews };
}

function renderNewsItem(item) {
  return `
    <li class="news-item">
      <span class="badge">${toDateString(item.date)}</span><p>${parseForLinks(item.headline)}</p>
    </li>
  `;
}

// Batch render news items
function renderNews() {
  const { recentNews, olderNews } = loadNewsData();
  
  const newsContainer = document.getElementById("news");
  const oldsContainer = document.getElementById("olds");
  
  if (newsContainer) {
    newsContainer.innerHTML = recentNews.map(renderNewsItem).join("");
  }
  
  if (oldsContainer) {
    oldsContainer.innerHTML = olderNews.map(renderNewsItem).join("");
  }
}

// Call once on load
renderNews();


function toggleNews() {
  const olds = document.getElementById("olds");
  const btn  = document.getElementById("news-btn");
  const icon = btn.querySelector("i");
  const text = btn.querySelector("span");

  const isOpen = btn.classList.toggle("active");
  olds.classList.toggle("active", isOpen);

  icon.classList.toggle("fa-angles-down", !isOpen);
  icon.classList.toggle("fa-angles-up", isOpen);

  olds.style.maxHeight = isOpen ? olds.scrollHeight + "px" : "0";
  text.textContent = isOpen ? "Less News" : "More News";
}

const TALK_TYPE_BADGES = {
  "Invited Talk": "var(--red)",
  "Seminar": "var(--azure)",
  "Contributed Talk": "var(--violet)",
  "Poster": "var(--orange-yellow-crayola)"
};

const TALK_TYPE_PILL = {
  "Invited Talk": "Invited",
  "Seminar": "Seminar",
  "Contributed Talk": "Contrib",
  "Poster": "Poster"
};

const SCHOOL_TYPE_BADGES = {
  "NUS": "var(--nus-orange)",
  "Oxford": "var(--oxford-navy)"
};

const TEACH_TYPE_BADGES = {
  "Tutor": "var(--teal)",
  "TA": "var(--brown)"
};

// Load and process talks data efficiently
function loadTalksData() {
  const talksData = (YAML.load("files/talks.yml") || [])
    .map(talk => ({
      ...talk,
      date: new Date(talk.date)
    }))
    .sort((a, b) => b.date - a.date);
  
  const talks = talksData.filter(item => item.type !== "Poster");
  const posters = talksData.filter(item => item.type === "Poster");
  
  return { talks, posters };
}

function groupByTitle(talks) {
  const groups = new Map();
  talks.forEach(talk => {
    if (!groups.has(talk.title)) {
      groups.set(talk.title, []);
    }
    groups.get(talk.title).push(talk);
  });
  return groups;
}

function renderTalkOccurrence(talk) {
  const pill = TALK_TYPE_PILL[talk.type];
  const color = TALK_TYPE_BADGES[talk.type] ?? "var(--light-gray)";
  return `
    <li class="talk-occurrence">
      <span class="badge" style="background-color:${color};">${pill}</span>
      ${talk.venue}
      · ${toDateString(talk.date)}</span>
    </li>
  `;
}

function renderTalkGroup(title, talks) {
  return `
    <li class="service-item">
      <div class="service-content-box">
        <h4 class="h4 service-item-title">${title}</h4>
        <ul class="talk-occurrences" style="margin-top:6px; padding-left:0; list-style:none;">
          ${talks.map(renderTalkOccurrence).join("")}
        </ul>
      </div>
    </li>
  `;
}

function renderPosterGroup(title, posters) {
  return `
    <li style="margin-bottom:12px;">
      <b>${title}</b><br>
      ${posters.map(p => `${p.venue} · ${toDateString(p.date)}`).join("<br>\n      ")}
    </li>
  `;
}

/* ---------- Render talks ---------- */
function renderTalks() {
  const { talks, posters } = loadTalksData();
  
  const talksContainer = document.getElementById("talks");
  if (talksContainer) {
    talksContainer.innerHTML = [...groupByTitle(talks)]
      .map(([title, talks]) => renderTalkGroup(title, talks))
      .join("");
  }
  
  /* ---------- Render posters ---------- */
  const postersContainer = document.getElementById("posters");
  if (postersContainer) {
    postersContainer.innerHTML = [...groupByTitle(posters)]
      .map(([title, posters]) => renderPosterGroup(title, posters))
      .join("");
  }
}

// Call once on load
renderTalks();

/* ---------- Render Education ---------- */
function renderEducation() {
  const educationData = YAML.load("files/education.yml") || [];
  const container = document.getElementById("education-list");
  
  if (!container) return;
  
  container.innerHTML = educationData.map(edu => `
    <li class="timeline-item">
      <h4 class="timeline-item-title">${edu.institution}</h4>
      <span>${edu.degree}</span>
      <p><i>${edu.period}</i></p>
      ${edu.details && edu.details.length > 0 ? `
        <ul class="timeline-text list" style="list-style: none; padding-left: 0;">
          ${edu.details.map(detail => `<li>${detail}</li>`).join('')}
        </ul>
      ` : ''}
    </li>
  `).join('');
}

/* ---------- Render Experiences ---------- */
function renderExperiences() {
  const experiencesData = YAML.load("files/experiences.yml") || { research: [], industry: [] };
  
  // Render research
  const researchContainer = document.getElementById("research-list");
  if (researchContainer) {
    researchContainer.innerHTML = experiencesData.research.map(exp => `
      <li class="timeline-item">
        <h4 class="timeline-item-title">${exp.title}</h4>
        <span>${exp.organization}</span>
        <p><i>${exp.period}</i></p>
        ${exp.details && exp.details.length > 0 ? `
          <ul class="timeline-text list" style="list-style: none; padding-left: 0;">
            ${exp.details.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        ` : ''}
      </li>
    `).join('');
  }
  
  // Render industry
  const industryContainer = document.getElementById("industry-list");
  if (industryContainer) {
    industryContainer.innerHTML = experiencesData.industry.map(exp => `
      <li class="timeline-item">
        <h4 class="timeline-item-title">${exp.title}</h4>
        <span>${exp.organization}</span>
        <p><i>${exp.period}</i></p>
        ${exp.details && exp.details.length > 0 ? `
          <ul class="timeline-text list" style="list-style: none; padding-left: 0;">
            ${exp.details.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        ` : ''}
      </li>
    `).join('');
  }
}

/* ---------- Render Awards ---------- */
function renderAwards() {
  const awardsData = YAML.load("files/awards.yml") || [];
  const container = document.getElementById("awards-list");
  
  if (!container) return;
  
  container.innerHTML = awardsData.map(award => `
    <li class="service-item">
      <div class="service-content-box">
        <h4 class="h4 service-item-title">${award.title}</h4>
        <span class="badge" style="background-color:${SCHOOL_TYPE_BADGES[award.institution]};">${award.institution}</span>
        ${award.period ? `<span class="badge">${award.period}</span>` : ''}
        ${award.periods ? award.periods.map(p => `<span class="badge">${p}</span>`).join(' ') : ''}
      </div>
    </li>
  `).join('');
}

/* ---------- Render Teaching ---------- */
function renderTeaching() {
  const teachingData = YAML.load("files/teaching.yml") || [];
  const container = document.getElementById("teaching-list");
  
  if (!container) return;
  
  container.innerHTML = teachingData.map(course => `
    <li class="service-item">
      <div class="service-content-box">
        <h4 class="h4 service-item-title">${course.course}</h4>
        <span class="badge" style="background-color:${SCHOOL_TYPE_BADGES[course.institution]};">${course.institution}</span>
        <span class="badge" style="background-color:${TEACH_TYPE_BADGES[course.role]};">${course.role}</span>
        ${course.period ? `<span class="badge">${course.period}</span>` : ''}
        ${course.periods ? course.periods.map(p => `<span class="badge">${p}</span>`).join(' ') : ''}
      </div>
    </li>
  `).join('');
}

/* ---------- Render Academic Services ---------- */
function renderServices() {
  const servicesData = YAML.load("files/services.yml") || { journalReviewer: [], conferenceReviewer: [], conferenceVolunteer: [] };
  const container = document.getElementById("services-list");
  
  if (!container) return;
  
  container.innerHTML = `
    <p>
      <b>Journal Reviewer</b><br>
      ${servicesData.journalReviewer.join(' · ')}
    </p>
    
    <p style="margin-top:10px;">
      <b>Conference Reviewer</b><br>
      ${servicesData.conferenceReviewer.join(' · ')}
    </p>
    
    <p style="margin-top:10px;">
      <b>Conference Volunteer</b><br>
      ${servicesData.conferenceVolunteer.join(' · ')}
    </p>
  `;
}

// Call render functions on load
renderEducation();
renderExperiences();
renderAwards();
renderTeaching();
renderServices();

/* ---------- Last modified dates ---------- */
const lastModifiedText = new Date(document.lastModified).toLocaleString("en-US", {
  month: "short",
  year: "numeric",
});

document
  .querySelectorAll(".last-modified")
  .forEach(el => (el.textContent = lastModifiedText));

/* ---------- Email encoding / decoding ---------- */
const to2Hex = value => value.toString(16).padStart(2, "0");

function encodeEmail(email, key) {
  let result = "";

  for (let i = 0; i < email.length; i++) {
    result += to2Hex(email.charCodeAt(i) ^ key);
  }

  return result + to2Hex(key);
}

function decodeEmail(encoded) {
  const key = parseInt(encoded.slice(-2), 16);
  let email = "";

  for (let i = 0; i < encoded.length - 2; i += 2) {
    email += String.fromCharCode(
      parseInt(encoded.slice(i, i + 2), 16) ^ key
    );
  }

  return email;
}

/* ---------- Apply decoded emails ---------- */
document.querySelectorAll(".protected").forEach(el => {
  const encoded = el.getAttribute("eml");
  if (!encoded) return;

  el.href = `mailto:${decodeEmail(encoded)}`;
});

const links = document.getElementsByTagName("a");
for (let i = 0; i < links.length; i++) {
  links[i].target = "_blank";
}