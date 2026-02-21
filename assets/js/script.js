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

function copyToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData("Text", text);

  }
  else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");  // Security exception may be thrown by some browsers.
    }
    catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }
    finally {
      document.body.removeChild(textarea);
    }
  }
}

function loadModal(testimonial) {
  modalTitle.innerHTML = testimonial.querySelector("[data-testimonials-title]").innerHTML;
  modalText.innerHTML = testimonial.querySelector("[data-testimonials-text]").innerHTML;
  testimonialsModalFunc();
}

function copyText() {
  // Get the text field
  var copyText = modalText.textContent;

  // Copy the text inside the text field
  copyToClipboard(copyText.trim());

  // Alert the copied text
  alert("BibTeX copied!");
}

function download() {
  var text = modalText.textContent.trim();
  var filename = text.split(",")[0].split("{")[1] + ".bib";
  const a = document.createElement('a')
  const blob = new Blob([text], { type: "data:text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob, { oneTimeOnly: true })
  a.setAttribute('href', url)
  a.setAttribute('download', filename)
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toggleBib(item) {
  id = item.getAttribute("key");
  abs = document.getElementById("bib" + id)
  abs.classList.toggle("active");
  if (abs.classList.contains('active')) {
    abs.style.maxHeight = abs.scrollHeight + 'px';
  } else {
    abs.style.maxHeight = "0";
  }
}

const auxData = YAML.load("files/aux.yml")

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

const newsData = YAML.load("files/news.yml")
  .map(item => ({
    ...item,
    date: new Date(item.date)
  }))
  .sort((a, b) => b.date - a.date);

function renderNewsItem(item) {
  return `
    <li class="news-item">
      <span class="badge">${toDateString(item.date)}</span><p>${parseForLinks(item.headline)}</p>
    </li>
  `;
}

const recentNews = newsData.slice(0, MAX_RECENT_NEWS);
const olderNews  = newsData.slice(MAX_RECENT_NEWS);

document.getElementById("news").innerHTML =
  recentNews.map(renderNewsItem).join("");

document.getElementById("olds").innerHTML =
  olderNews.map(renderNewsItem).join("");


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
  "Contributed Talk": "var(--violet)"
};

const TALK_TYPE_PILL = {
  "Invited Talk": "Invited",
  "Seminar": "Seminar",
  "Contributed Talk": "Contrib"
};

const talksData = YAML.load("files/talks.yml")
  .map(talk => ({
    ...talk,
    date: new Date(talk.date)
  }))
  .sort((a, b) => b.date - a.date);

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

/* ---------- Render talks ---------- */
const talksContainer = document.getElementById("talks");

talksContainer.innerHTML = [...groupByTitle(talksData)]
  .map(([title, talks]) => renderTalkGroup(title, talks))
  .join("");

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
for (var i = 0; i < links.length; i++) {
  links[i].target = "_blank";
}