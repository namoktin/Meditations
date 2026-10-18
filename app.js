/**
 * SUY TƯỞNG (MEDITATIONS) — BOOK READER LOGIC & INTERACTION ENGINE
 * Standalone offline reader with zero external dependencies
 */

(function () {
  "use strict";

  // --- State Management ---
  const STORAGE_KEYS = {
    THEME: "st_reader_theme",
    FONT_FAMILY: "st_reader_font_family",
    FONT_SIZE: "st_reader_font_size",
    LINE_HEIGHT: "st_reader_line_height",
    MAX_WIDTH: "st_reader_max_width",
    CURRENT_CHAPTER: "st_reader_active_ch",
    COMPLETED_CHAPTERS: "st_reader_completed_chs",
    BOOKMARKS: "st_reader_bookmarks",
    CHAPTER_NOTES: "st_reader_notes",
    SCROLL_POSITIONS: "st_reader_scroll_pos",
    FLASHCARD_STATUS: "st_reader_flashcard_status"
  };

  const state = {
    bookData: window.BOOK_DATA || null,
    currentChapterId: "readme",
    currentViewMode: "analysis", // "analysis" | "english"
    completedChapters: new Set(),
    bookmarks: new Set(),
    chapterNotes: {},
    scrollPositions: {},
    flashcardStatus: {}, // cardNum: "mastered" | "review"
    currentFlashcardIndex: 0,
    filteredFlashcards: [],
    theme: "sepia",
    fontFamily: "serif",
    fontSize: 18,
    lineHeight: 1.75,
    maxWidth: 780,
    isSidebarOpen: true,
    isFocusMode: false
  };

  // --- DOM Elements Cache ---
  const dom = {};

  function initElements() {
    dom.app = document.querySelector(".app-container");
    dom.sidebar = document.getElementById("sidebar");
    dom.sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    dom.tocList = document.getElementById("tocList");
    dom.readerWorkspace = document.getElementById("readerWorkspace");
    dom.readerContainer = document.getElementById("readerContainer");
    dom.readingProgressFill = document.getElementById("readingProgressFill");
    dom.currentChTitleHeader = document.getElementById("currentChTitleHeader");
    dom.progressStatText = document.getElementById("progressStatText");
    dom.progressStatPercent = document.getElementById("progressStatPercent");
    dom.progressBarInner = document.getElementById("progressBarInner");
    dom.sidebarSearchInput = document.getElementById("sidebarSearchInput");

    // Modal elements
    dom.searchModal = document.getElementById("searchModal");
    dom.searchModalInput = document.getElementById("searchModalInput");
    dom.searchResultsList = document.getElementById("searchResultsList");
    dom.openSearchBtn = document.getElementById("openSearchBtn");
    dom.closeSearchBtn = document.getElementById("closeSearchBtn");

    dom.settingsModal = document.getElementById("settingsModal");
    dom.openSettingsBtn = document.getElementById("openSettingsBtn");
    dom.closeSettingsBtn = document.getElementById("closeSettingsBtn");

    dom.flashcardModal = document.getElementById("flashcardModal");
    dom.openFlashcardsBtn = document.getElementById("openFlashcardsBtn");
    dom.closeFlashcardBtn = document.getElementById("closeFlashcardBtn");

    dom.focusModeBtn = document.getElementById("focusModeBtn");
    dom.exitFocusBtn = document.getElementById("exitFocusBtn");
    dom.bookmarkChBtn = document.getElementById("bookmarkChBtn");
    dom.quickThemeToggleBtn = document.getElementById("quickThemeToggleBtn");
    dom.quickThemeIcon = document.getElementById("quickThemeIcon");
    dom.sidebarBackdrop = document.getElementById("sidebarBackdrop");

    // Right page outline & notes
    dom.pageOutlineAside = document.getElementById("pageOutlineAside");
    dom.outlineList = document.getElementById("outlineList");
    dom.chapterNoteTextarea = document.getElementById("chapterNoteTextarea");
    dom.noteSavedStatus = document.getElementById("noteSavedStatus");
  }

  // --- Load and Save State ---
  function loadSavedState() {
    try {
      state.theme = localStorage.getItem(STORAGE_KEYS.THEME) || "sepia";
      state.fontFamily = localStorage.getItem(STORAGE_KEYS.FONT_FAMILY) || "serif";
      state.fontSize = parseInt(localStorage.getItem(STORAGE_KEYS.FONT_SIZE), 10) || 18;
      state.lineHeight = parseFloat(localStorage.getItem(STORAGE_KEYS.LINE_HEIGHT)) || 1.75;
      state.maxWidth = parseInt(localStorage.getItem(STORAGE_KEYS.MAX_WIDTH), 10) || 780;

      // On mobile screens, default sidebar to closed so reader sees the chapter content
      state.isSidebarOpen = window.innerWidth > 768;

      const savedCh = localStorage.getItem(STORAGE_KEYS.CURRENT_CHAPTER);
      if (savedCh && state.bookData && state.bookData.chapters.some(c => c.id === savedCh)) {
        state.currentChapterId = savedCh;
      }

      const completed = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHAPTERS) || "[]");
      state.completedChapters = new Set(completed);

      const bmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || "[]");
      state.bookmarks = new Set(bmarks);

      state.chapterNotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAPTER_NOTES) || "{}");
      state.scrollPositions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCROLL_POSITIONS) || "{}");
      state.flashcardStatus = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLASHCARD_STATUS) || "{}");
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }

  function saveState(key, value) {
    try {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  // --- Apply Reading Preferences ---
  function applyPreferences() {
    document.documentElement.setAttribute("data-theme", state.theme);

    const fontMap = {
      serif: 'var(--font-serif)',
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)'
    };
    document.documentElement.style.setProperty("--reader-font-family", fontMap[state.fontFamily] || fontMap.serif);
    document.documentElement.style.setProperty("--reader-font-size", state.fontSize + "px");
    document.documentElement.style.setProperty("--reader-line-height", state.lineHeight);
    document.documentElement.style.setProperty("--reader-max-width", state.maxWidth + "px");

    // Update settings dialog buttons UI
    document.querySelectorAll(".theme-option-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.theme === state.theme);
    });
    document.querySelectorAll(".font-option-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.font === state.fontFamily);
    });
    const fsEl = document.getElementById("fontSizeDisplay");
    if (fsEl) fsEl.textContent = state.fontSize + "px";

    // Update Quick Theme Toggle icon in header
    if (dom.quickThemeIcon) {
      const isDark = state.theme === "dark" || state.theme === "oled";
      dom.quickThemeIcon.textContent = isDark ? "☀️" : "🌙";
      if (dom.quickThemeToggleBtn) {
        dom.quickThemeToggleBtn.title = isDark ? "Chuyển sang chế độ Sáng (Sepia)" : "Chuyển sang chế độ Tối (Dark)";
      }
    }
  }

  // --- Render Sidebar TOC ---
  function renderSidebarTOC(filterText = "") {
    if (!state.bookData) return;
    const chapters = state.bookData.chapters;
    const q = filterText.toLowerCase().trim();

    let html = "";
    let currentGroup = "";

    chapters.forEach(ch => {
      if (q && !ch.title.toLowerCase().includes(q) && !ch.content.toLowerCase().includes(q)) {
        return;
      }

      if (ch.group !== currentGroup) {
        currentGroup = ch.group;
        html += `<div class="toc-group-title">
          <span>${currentGroup}</span>
        </div>`;
      }

      const isActive = ch.id === state.currentChapterId;
      const isCompleted = state.completedChapters.has(ch.id);

      html += `
        <div class="toc-item ${isActive ? "active" : ""}" data-ch-id="${ch.id}">
          <div class="toc-checkbox ${isCompleted ? "completed" : ""}" title="${isCompleted ? "Đã đọc (bấm để bỏ)" : "Đánh dấu đã đọc"}" data-toggle-read="${ch.id}">
            ${isCompleted ? "☑" : "☐"}
          </div>
          <div class="toc-item-content">
            <div class="toc-item-title">${ch.icon || "📄"} ${ch.title}</div>
            <div class="toc-item-meta">
              <span class="toc-badge">${ch.badge || "Chương"}</span>
              <span>⏳ ~${ch.estMinutes} phút</span>
            </div>
          </div>
        </div>
      `;
    });

    dom.tocList.innerHTML = html;
    updateProgressStats();
  }

  function updateProgressStats() {
    if (!state.bookData) return;
    const total = state.bookData.chapters.length;
    const completed = state.completedChapters.size;
    const pct = Math.round((completed / total) * 100);

    if (dom.progressStatText) {
      dom.progressStatText.textContent = `${completed}/${total} chương`;
    }
    if (dom.progressStatPercent) {
      dom.progressStatPercent.textContent = `${pct}%`;
    }
    if (dom.progressBarInner) {
      dom.progressBarInner.style.width = `${pct}%`;
    }
  }

  // --- Decorate Markdown Content with Custom Stoic Elements ---
  function formatMarkdownContent(rawText) {
    if (!window.marked) return rawText;

    // Pre-processing special tags for Marcus Aurelius analysis
    let formatted = rawText
      .replace(/\[TỪ SÁCH\]/g, '<span class="badge-quote-source">🏛️ TỪ SÁCH</span>')
      .replace(/\[DIỄN GIẢI\]/g, '<span class="badge-quote-analysis">💡 DIỄN GIẢI</span>')
      .replace(/\[KIỂM CHỨNG\/BỔ SUNG\]/g, '<span class="badge-quote-external">🔍 KIỂM CHỨNG</span>');

    // Parse with marked
    let html = marked.parse(formatted);

    // Wrap tables for responsive horizontal scrolling
    html = html.replace(/<table>/g, '<div class="table-wrapper"><table>');
    html = html.replace(/<\/table>/g, '</table></div>');

    return html;
  }

  // --- Render Active Chapter Content ---
  function renderChapter(chapterId, restoreScroll = true) {
    if (!state.bookData) return;
    const ch = state.bookData.chapters.find(c => c.id === chapterId);
    if (!ch) return;

    state.currentChapterId = ch.id;
    saveState(STORAGE_KEYS.CURRENT_CHAPTER, ch.id);

    // Update Top Header Info
    if (dom.currentChTitleHeader) {
      dom.currentChTitleHeader.textContent = ch.shortTitle || ch.title;
    }

    // Bookmark button status
    if (dom.bookmarkChBtn) {
      dom.bookmarkChBtn.classList.toggle("active", state.bookmarks.has(ch.id));
      dom.bookmarkChBtn.title = state.bookmarks.has(ch.id) ? "Đã lưu dấu trang" : "Lưu dấu trang chương này";
    }

    // Find Previous & Next Chapters
    const currentIndex = state.bookData.chapters.findIndex(c => c.id === ch.id);
    const prevCh = currentIndex > 0 ? state.bookData.chapters[currentIndex - 1] : null;
    const nextCh = currentIndex < state.bookData.chapters.length - 1 ? state.bookData.chapters[currentIndex + 1] : null;
    const isCompleted = state.completedChapters.has(ch.id);

    // Determine what to display based on viewMode (Analysis or English Original)
    let bodyHtml = "";
    if (state.currentViewMode === "english" && ch.hasEnglish && ch.englishContent) {
      bodyHtml = `
        <div class="english-reading-pane" style="font-family: var(--reader-font-family); white-space: pre-line; line-height: 1.8;">
          <div style="background: var(--bg-card); padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid var(--accent-gold); font-size: 0.9rem;">
            <strong>🏛️ Meditations — Original English Translation (Gregory Hays, 2002)</strong><br>
            <span style="color: var(--text-muted);">Văn bản dịch trực tiếp từ nguyên bản Hy Lạp <em>Eis heauton</em>.</span>
          </div>
          ${ch.englishContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </div>
      `;
    } else {
      bodyHtml = formatMarkdownContent(ch.content);
    }

    // Build Chapter Header & Dual-View Tabs if available
    let tabsHtml = "";
    if (ch.hasEnglish) {
      tabsHtml = `
        <div class="view-switch-tabs">
          <button class="view-tab-btn ${state.currentViewMode === 'analysis' ? 'active' : ''}" data-view="analysis">
            🇻🇳 Bản Phân Tích
          </button>
          <button class="view-tab-btn ${state.currentViewMode === 'english' ? 'active' : ''}" data-view="english">
            🏛️ Văn Bản Gốc (English)
          </button>
        </div>
      `;
    }

    // Build the Full Reader Container HTML
    dom.readerContainer.innerHTML = `
      <div class="chapter-header">
        <div class="chapter-breadcrumb">
          <span>${ch.group}</span>
          <span>›</span>
          <span>${ch.badge || "Chương " + ch.index}</span>
        </div>
        <h1 class="chapter-main-title">${ch.title}</h1>
        <div class="chapter-actions-bar">
          <div class="chapter-stats-info">
            <span>⏳ ~${ch.estMinutes} phút đọc</span>
            <span>•</span>
            <span>📝 ${ch.wordCount.toLocaleString()} từ</span>
            <span>•</span>
            <span>${ch.file}</span>
          </div>
          ${tabsHtml}
        </div>
      </div>

      <div class="markdown-body" id="chapterMarkdownBody">
        ${bodyHtml}
      </div>

      <div class="chapter-footer-nav">
        <div>
          ${prevCh ? `
            <button class="nav-prev-btn" data-jump-ch="${prevCh.id}">
              <span class="nav-btn-sub">← Chương trước</span>
              <span class="nav-btn-title">${prevCh.shortTitle || prevCh.title}</span>
            </button>
          ` : ""}
        </div>

        <div>
          <button class="nav-mark-read-btn ${isCompleted ? 'completed' : ''}" id="navMarkReadBtn" data-ch-id="${ch.id}">
            <span>${isCompleted ? '✓ Đã hoàn thành' : 'Đánh dấu đã đọc'}</span>
          </button>
        </div>

        <div>
          ${nextCh ? `
            <button class="nav-next-btn" data-jump-ch="${nextCh.id}">
              <span class="nav-btn-sub">Chương tiếp theo →</span>
              <span class="nav-btn-title">${nextCh.shortTitle || nextCh.title}</span>
            </button>
          ` : ""}
        </div>
      </div>
    `;

    // Render On-Page Table of Contents
    renderPageOutline(ch.headings);

    // Load Personal Note for this chapter
    renderChapterNote(ch.id);

    // Highlight current chapter in sidebar TOC
    renderSidebarTOC(dom.sidebarSearchInput ? dom.sidebarSearchInput.value : "");

    // Restore scroll position or reset to top
    if (restoreScroll && state.scrollPositions[ch.id]) {
      setTimeout(() => {
        dom.readerWorkspace.scrollTop = state.scrollPositions[ch.id];
      }, 50);
    } else {
      dom.readerWorkspace.scrollTop = 0;
    }
  }

  // --- On-Page TOC (Headings Outline) ---
  function renderPageOutline(headings) {
    if (!dom.outlineList) return;
    if (!headings || headings.length === 0 || state.currentViewMode === "english") {
      dom.outlineList.innerHTML = `<li style="font-size: 0.8rem; color: var(--text-muted); padding: 8px;">Không có mục phụ</li>`;
      return;
    }

    let html = "";
    headings.forEach(h => {
      html += `
        <li>
          <a href="#${h.slug}" class="outline-link level-${h.level}" data-slug="${h.slug}">
            ${h.title}
          </a>
        </li>
      `;
    });
    dom.outlineList.innerHTML = html;

    // Connect click to smooth scroll to heading
    dom.outlineList.querySelectorAll(".outline-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const slug = link.dataset.slug;
        scrollToHeading(slug);
      });
    });
  }

  function scrollToHeading(slug) {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Find heading by text
      const headings = dom.readerContainer.querySelectorAll("h1, h2, h3, h4");
      for (const h of headings) {
        const text = h.textContent.trim().toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u1EF9]+/g, '-').replace(/^-|-$/g, '');
        if (text === slug || text.includes(slug)) {
          h.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        }
      }
    }
  }

  // --- Personal Chapter Reflection Note ---
  function renderChapterNote(chapterId) {
    if (!dom.chapterNoteTextarea) return;
    const savedNote = state.chapterNotes[chapterId] || "";
    dom.chapterNoteTextarea.value = savedNote;
    if (dom.noteSavedStatus) {
      dom.noteSavedStatus.textContent = savedNote ? "Đã lưu tự động" : "Ghi lại chiêm nghiệm cá nhân...";
    }
  }

  function saveCurrentChapterNote() {
    if (!dom.chapterNoteTextarea) return;
    const text = dom.chapterNoteTextarea.value;
    state.chapterNotes[state.currentChapterId] = text;
    saveState(STORAGE_KEYS.CHAPTER_NOTES, state.chapterNotes);
    if (dom.noteSavedStatus) {
      dom.noteSavedStatus.textContent = "✓ Đã lưu chiêm nghiệm!";
      setTimeout(() => {
        dom.noteSavedStatus.textContent = "Đã lưu tự động";
      }, 2000);
    }
  }

  // --- Reading Scroll Progress Tracking ---
  function handleReadingScroll() {
    const scrollEl = dom.readerWorkspace;
    const scrollTop = scrollEl.scrollTop;
    const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;

    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (dom.readingProgressFill) {
      dom.readingProgressFill.style.width = Math.min(100, Math.max(0, progress)) + "%";
    }

    // Save scroll position throttled
    state.scrollPositions[state.currentChapterId] = scrollTop;
    saveState(STORAGE_KEYS.SCROLL_POSITIONS, state.scrollPositions);

    // Auto mark as completed if scrolled past 90%
    if (progress > 90 && !state.completedChapters.has(state.currentChapterId)) {
      state.completedChapters.add(state.currentChapterId);
      saveState(STORAGE_KEYS.COMPLETED_CHAPTERS, Array.from(state.completedChapters));
      updateProgressStats();
      const markBtn = document.getElementById("navMarkReadBtn");
      if (markBtn) {
        markBtn.classList.add("completed");
        markBtn.querySelector("span").textContent = "✓ Đã hoàn thành";
      }
    }
  }

  // --- Toggle Chapter Read Status ---
  function toggleChapterRead(chapterId) {
    if (state.completedChapters.has(chapterId)) {
      state.completedChapters.delete(chapterId);
    } else {
      state.completedChapters.add(chapterId);
    }
    saveState(STORAGE_KEYS.COMPLETED_CHAPTERS, Array.from(state.completedChapters));
    renderSidebarTOC(dom.sidebarSearchInput ? dom.sidebarSearchInput.value : "");

    // If on current chapter, update button
    if (chapterId === state.currentChapterId) {
      const markBtn = document.getElementById("navMarkReadBtn");
      if (markBtn) {
        const isDone = state.completedChapters.has(chapterId);
        markBtn.classList.toggle("completed", isDone);
        markBtn.querySelector("span").textContent = isDone ? "✓ Đã hoàn thành" : "Đánh dấu đã đọc";
      }
    }
  }

  // --- Toggle Bookmark ---
  function toggleBookmark() {
    const chId = state.currentChapterId;
    if (state.bookmarks.has(chId)) {
      state.bookmarks.delete(chId);
    } else {
      state.bookmarks.add(chId);
    }
    saveState(STORAGE_KEYS.BOOKMARKS, Array.from(state.bookmarks));
    if (dom.bookmarkChBtn) {
      dom.bookmarkChBtn.classList.toggle("active", state.bookmarks.has(chId));
      dom.bookmarkChBtn.title = state.bookmarks.has(chId) ? "Đã lưu dấu trang" : "Lưu dấu trang chương này";
    }
  }

  // --- Search Engine ---
  function openSearchModal() {
    dom.searchModal.classList.add("open");
    dom.searchModalInput.value = "";
    dom.searchModalInput.focus();
    renderSearchResults("");
  }

  function closeSearchModal() {
    dom.searchModal.classList.remove("open");
  }

  function renderSearchResults(query) {
    if (!state.bookData) return;
    const q = query.toLowerCase().trim();
    if (!q) {
      // Show top quotes as suggestions when search is empty
      let html = `<div style="padding: 10px 14px; font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Trích dẫn bất hủ gợi ý:</div>`;
      state.bookData.quotes.forEach(quote => {
        html += `
          <div class="search-result-item" data-quote-search="${encodeURIComponent(quote.quote)}">
            <div class="search-result-title">🏛️ ${quote.source} — ${quote.meaning}</div>
            <div class="search-result-snippet"><em>"${quote.quote}"</em></div>
          </div>
        `;
      });
      dom.searchResultsList.innerHTML = html;
      return;
    }

    const results = [];
    state.bookData.chapters.forEach(ch => {
      const titleMatch = ch.title.toLowerCase().indexOf(q);
      const contentIndex = ch.content.toLowerCase().indexOf(q);

      if (titleMatch !== -1 || contentIndex !== -1) {
        let snippet = "";
        if (contentIndex !== -1) {
          const start = Math.max(0, contentIndex - 60);
          const end = Math.min(ch.content.length, contentIndex + q.length + 80);
          const rawSnippet = ch.content.substring(start, end).replace(/\n/g, " ");
          const regex = new RegExp(`(${escapeRegExp(q)})`, "gi");
          snippet = (start > 0 ? "... " : "") + rawSnippet.replace(regex, "<mark>$1</mark>") + (end < ch.content.length ? " ..." : "");
        } else {
          snippet = "Khớp với tiêu đề chương";
        }

        results.push({
          chapterId: ch.id,
          title: ch.title,
          badge: ch.badge,
          snippet: snippet,
          score: titleMatch !== -1 ? 100 : 50
        });
      }
    });

    results.sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      dom.searchResultsList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <div>Không tìm thấy nội dung phù hợp với <strong>"${query}"</strong></div>
        </div>
      `;
      return;
    }

    let html = "";
    results.slice(0, 30).forEach(res => {
      html += `
        <div class="search-result-item" data-jump-ch="${res.chapterId}">
          <div class="search-result-title">${res.title} <span class="toc-badge">${res.badge}</span></div>
          <div class="search-result-snippet">${res.snippet}</div>
        </div>
      `;
    });
    dom.searchResultsList.innerHTML = html;
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Flashcard Mode Engine ---
  function openFlashcardsModal() {
    dom.flashcardModal.classList.add("open");
    initFlashcards();
  }

  function closeFlashcardModal() {
    dom.flashcardModal.classList.remove("open");
  }

  function initFlashcards() {
    if (!state.bookData || !state.bookData.flashcards) return;
    const cards = state.bookData.flashcards;
    const filterSelect = document.getElementById("flashcardGroupSelect");
    const selectedGroup = filterSelect ? filterSelect.value : "all";

    if (selectedGroup === "all") {
      state.filteredFlashcards = [...cards];
    } else {
      state.filteredFlashcards = cards.filter(c => c.group.includes(selectedGroup));
    }

    state.currentFlashcardIndex = 0;
    renderCurrentFlashcard();
  }

  function renderCurrentFlashcard() {
    const cardEl = document.getElementById("flashcardElement");
    const cards = state.filteredFlashcards;
    if (!cardEl || !cards || cards.length === 0) return;

    cardEl.classList.remove("flipped");
    const currentCard = cards[state.currentFlashcardIndex];

    const qEl = document.getElementById("flashcardQuestion");
    const aEl = document.getElementById("flashcardAnswer");
    const numEl = document.getElementById("flashcardNumBadge");
    const groupEl = document.getElementById("flashcardGroupBadge");
    const counterEl = document.getElementById("flashcardCounter");
    const masterBtn = document.getElementById("btnCardMastered");

    if (qEl) qEl.textContent = currentCard.question;
    if (aEl) aEl.textContent = currentCard.answer;
    if (numEl) numEl.textContent = `Thẻ #${currentCard.num}`;
    if (groupEl) groupEl.textContent = currentCard.group;
    if (counterEl) counterEl.textContent = `${state.currentFlashcardIndex + 1} / ${cards.length}`;

    const isMastered = state.flashcardStatus[currentCard.num] === "mastered";
    if (masterBtn) {
      masterBtn.classList.toggle("mastered", isMastered);
      masterBtn.innerHTML = isMastered ? "✓ Đã thuộc" : "Đánh dấu đã thuộc";
    }
  }

  function flipFlashcard() {
    const cardEl = document.getElementById("flashcardElement");
    if (cardEl) {
      cardEl.classList.toggle("flipped");
    }
  }

  function nextFlashcard() {
    if (state.filteredFlashcards.length === 0) return;
    state.currentFlashcardIndex = (state.currentFlashcardIndex + 1) % state.filteredFlashcards.length;
    renderCurrentFlashcard();
  }

  function prevFlashcard() {
    if (state.filteredFlashcards.length === 0) return;
    state.currentFlashcardIndex = (state.currentFlashcardIndex - 1 + state.filteredFlashcards.length) % state.filteredFlashcards.length;
    renderCurrentFlashcard();
  }

  function toggleMasterCurrentCard() {
    const currentCard = state.filteredFlashcards[state.currentFlashcardIndex];
    if (!currentCard) return;

    if (state.flashcardStatus[currentCard.num] === "mastered") {
      delete state.flashcardStatus[currentCard.num];
    } else {
      state.flashcardStatus[currentCard.num] = "mastered";
    }
    saveState(STORAGE_KEYS.FLASHCARD_STATUS, state.flashcardStatus);
    renderCurrentFlashcard();
  }

  function shuffleFlashcards() {
    for (let i = state.filteredFlashcards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.filteredFlashcards[i], state.filteredFlashcards[j]] = [state.filteredFlashcards[j], state.filteredFlashcards[i]];
    }
    state.currentFlashcardIndex = 0;
    renderCurrentFlashcard();
  }

  // --- Focus Mode (Distraction-Free Reading) ---
  function toggleFocusMode() {
    state.isFocusMode = !state.isFocusMode;
    document.body.classList.toggle("focus-mode", state.isFocusMode);
  }

  // --- Keyboard Shortcuts ---
  function setupShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Ignore if inside an input or textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Escape") {
          closeSearchModal();
          e.target.blur();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearchModal();
      } else if (e.key === "/") {
        e.preventDefault();
        openSearchModal();
      } else if (e.key === "Escape") {
        closeSearchModal();
        if (dom.settingsModal) dom.settingsModal.classList.remove("open");
        if (dom.flashcardModal) closeFlashcardModal();
        if (state.isFocusMode) toggleFocusMode();
      } else if (e.key === "[" || e.key === "PageUp") {
        // Prev chapter
        navigateChapterRelative(-1);
      } else if (e.key === "]" || e.key === "PageDown") {
        // Next chapter
        navigateChapterRelative(1);
      } else if (e.key.toLowerCase() === "f") {
        toggleFocusMode();
      } else if (e.key.toLowerCase() === "b") {
        toggleBookmark();
      } else if (dom.flashcardModal && dom.flashcardModal.classList.contains("open")) {
        if (e.code === "Space") {
          e.preventDefault();
          flipFlashcard();
        } else if (e.key === "ArrowRight") {
          nextFlashcard();
        } else if (e.key === "ArrowLeft") {
          prevFlashcard();
        }
      }
    });
  }

  function navigateChapterRelative(delta) {
    if (!state.bookData) return;
    const chapters = state.bookData.chapters;
    const curIdx = chapters.findIndex(c => c.id === state.currentChapterId);
    const targetIdx = curIdx + delta;
    if (targetIdx >= 0 && targetIdx < chapters.length) {
      renderChapter(chapters[targetIdx].id, false);
    }
  }

  // --- Bind Event Listeners ---
  function bindEvents() {
    function setSidebarOpen(open) {
      state.isSidebarOpen = open;
      dom.sidebar.classList.toggle("collapsed", !open);
      if (dom.sidebarBackdrop) {
        dom.sidebarBackdrop.classList.toggle("active", open && window.innerWidth <= 768);
      }
    }

    // Sidebar toggle button
    if (dom.sidebarToggleBtn) {
      dom.sidebarToggleBtn.addEventListener("click", () => {
        setSidebarOpen(!state.isSidebarOpen);
      });
    }

    // Mobile Backdrop click to close sidebar
    if (dom.sidebarBackdrop) {
      dom.sidebarBackdrop.addEventListener("click", () => {
        setSidebarOpen(false);
      });
    }

    // Quick Theme Toggle (Day / Night)
    if (dom.quickThemeToggleBtn) {
      dom.quickThemeToggleBtn.addEventListener("click", () => {
        const isDark = state.theme === "dark" || state.theme === "oled";
        state.theme = isDark ? "sepia" : "dark";
        saveState(STORAGE_KEYS.THEME, state.theme);
        applyPreferences();
      });
    }

    // Sidebar Search Filter
    if (dom.sidebarSearchInput) {
      dom.sidebarSearchInput.addEventListener("input", (e) => {
        renderSidebarTOC(e.target.value);
      });
    }

    // TOC Item Click & Read Checkbox Click Delegation
    if (dom.tocList) {
      dom.tocList.addEventListener("click", (e) => {
        const toggleReadBtn = e.target.closest("[data-toggle-read]");
        if (toggleReadBtn) {
          e.stopPropagation();
          const chId = toggleReadBtn.dataset.toggleRead;
          toggleChapterRead(chId);
          return;
        }

        const tocItem = e.target.closest("[data-ch-id]");
        if (tocItem) {
          const chId = tocItem.dataset.chId;
          state.currentViewMode = "analysis"; // default back to analysis when switching chapters
          renderChapter(chId);

          // Close sidebar on mobile screens so reader sees the content immediately
          if (window.innerWidth <= 768) {
            setSidebarOpen(false);
          }
        }
      });
    }

    // Reader Container Delegation (Prev/Next buttons, View Tabs, Mark Read)
    if (dom.readerContainer) {
      dom.readerContainer.addEventListener("click", (e) => {
        const jumpBtn = e.target.closest("[data-jump-ch]");
        if (jumpBtn) {
          const chId = jumpBtn.dataset.jumpCh;
          state.currentViewMode = "analysis";
          renderChapter(chId, false);
          return;
        }

        const markBtn = e.target.closest("#navMarkReadBtn");
        if (markBtn) {
          const chId = markBtn.dataset.chId;
          toggleChapterRead(chId);
          return;
        }

        const viewTabBtn = e.target.closest(".view-tab-btn");
        if (viewTabBtn) {
          const mode = viewTabBtn.dataset.view;
          state.currentViewMode = mode;
          renderChapter(state.currentChapterId, false);
          return;
        }
      });
    }

    // Scroll Spy for Reading Progress
    if (dom.readerWorkspace) {
      dom.readerWorkspace.addEventListener("scroll", handleReadingScroll);
    }

    // Personal Note Textarea
    if (dom.chapterNoteTextarea) {
      dom.chapterNoteTextarea.addEventListener("input", () => {
        if (dom.noteSavedStatus) dom.noteSavedStatus.textContent = "Đang gõ...";
      });
      dom.chapterNoteTextarea.addEventListener("blur", saveCurrentChapterNote);
    }

    // Bookmark Button
    if (dom.bookmarkChBtn) {
      dom.bookmarkChBtn.addEventListener("click", toggleBookmark);
    }

    // Focus Mode Buttons
    if (dom.focusModeBtn) dom.focusModeBtn.addEventListener("click", toggleFocusMode);
    if (dom.exitFocusBtn) dom.exitFocusBtn.addEventListener("click", toggleFocusMode);

    // Search Modal Trigger
    if (dom.openSearchBtn) dom.openSearchBtn.addEventListener("click", openSearchModal);
    if (dom.closeSearchBtn) dom.closeSearchBtn.addEventListener("click", closeSearchModal);
    if (dom.searchModal) {
      dom.searchModal.addEventListener("click", (e) => {
        if (e.target === dom.searchModal) closeSearchModal();
      });
    }
    if (dom.searchModalInput) {
      dom.searchModalInput.addEventListener("input", (e) => {
        renderSearchResults(e.target.value);
      });
    }
    if (dom.searchResultsList) {
      dom.searchResultsList.addEventListener("click", (e) => {
        const item = e.target.closest("[data-jump-ch]");
        if (item) {
          const chId = item.dataset.jumpCh;
          closeSearchModal();
          state.currentViewMode = "analysis";
          renderChapter(chId);
        }

        const quoteItem = e.target.closest("[data-quote-search]");
        if (quoteItem) {
          const quoteText = decodeURIComponent(quoteItem.dataset.quoteSearch);
          dom.searchModalInput.value = quoteText.substring(0, 30);
          renderSearchResults(dom.searchModalInput.value);
        }
      });
    }

    // Reading Settings Modal Trigger
    if (dom.openSettingsBtn) {
      dom.openSettingsBtn.addEventListener("click", () => {
        dom.settingsModal.classList.add("open");
      });
    }
    if (dom.closeSettingsBtn) {
      dom.closeSettingsBtn.addEventListener("click", () => {
        dom.settingsModal.classList.remove("open");
      });
    }
    if (dom.settingsModal) {
      dom.settingsModal.addEventListener("click", (e) => {
        if (e.target === dom.settingsModal) dom.settingsModal.classList.remove("open");
      });
    }

    // Settings: Theme Switch
    document.querySelectorAll(".theme-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.theme = btn.dataset.theme;
        saveState(STORAGE_KEYS.THEME, state.theme);
        applyPreferences();
      });
    });

    // Settings: Font Family Switch
    document.querySelectorAll(".font-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.fontFamily = btn.dataset.font;
        saveState(STORAGE_KEYS.FONT_FAMILY, state.fontFamily);
        applyPreferences();
      });
    });

    // Settings: Font Size +/-
    const fsDec = document.getElementById("fontSizeDec");
    const fsInc = document.getElementById("fontSizeInc");
    if (fsDec) {
      fsDec.addEventListener("click", () => {
        if (state.fontSize > 14) {
          state.fontSize -= 1;
          saveState(STORAGE_KEYS.FONT_SIZE, state.fontSize);
          applyPreferences();
        }
      });
    }
    if (fsInc) {
      fsInc.addEventListener("click", () => {
        if (state.fontSize < 26) {
          state.fontSize += 1;
          saveState(STORAGE_KEYS.FONT_SIZE, state.fontSize);
          applyPreferences();
        }
      });
    }

    // Settings: Line Spacing
    document.querySelectorAll(".spacing-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".spacing-option-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.lineHeight = parseFloat(btn.dataset.spacing);
        saveState(STORAGE_KEYS.LINE_HEIGHT, state.lineHeight);
        applyPreferences();
      });
    });

    // Settings: Max Width
    document.querySelectorAll(".width-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".width-option-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.maxWidth = parseInt(btn.dataset.width, 10);
        saveState(STORAGE_KEYS.MAX_WIDTH, state.maxWidth);
        applyPreferences();
      });
    });

    // Flashcard Modal Trigger
    if (dom.openFlashcardsBtn) dom.openFlashcardsBtn.addEventListener("click", openFlashcardsModal);
    if (dom.closeFlashcardBtn) dom.closeFlashcardBtn.addEventListener("click", closeFlashcardModal);
    if (dom.flashcardModal) {
      dom.flashcardModal.addEventListener("click", (e) => {
        if (e.target === dom.flashcardModal) closeFlashcardModal();
      });
    }

    // Flashcard Interactions
    const cardEl = document.getElementById("flashcardElement");
    if (cardEl) cardEl.addEventListener("click", flipFlashcard);

    const prevCardBtn = document.getElementById("btnPrevCard");
    const nextCardBtn = document.getElementById("btnNextCard");
    const shuffleCardBtn = document.getElementById("btnShuffleCards");
    const masterCardBtn = document.getElementById("btnCardMastered");
    const groupSelect = document.getElementById("flashcardGroupSelect");

    if (prevCardBtn) prevCardBtn.addEventListener("click", prevFlashcard);
    if (nextCardBtn) nextCardBtn.addEventListener("click", nextFlashcard);
    if (shuffleCardBtn) shuffleCardBtn.addEventListener("click", shuffleFlashcards);
    if (masterCardBtn) masterCardBtn.addEventListener("click", toggleMasterCurrentCard);
    if (groupSelect) groupSelect.addEventListener("change", initFlashcards);
  }

  // --- Bootstrap Application ---
  function init() {
    initElements();
    loadSavedState();
    if (dom.sidebar) {
      dom.sidebar.classList.toggle("collapsed", !state.isSidebarOpen);
    }
    applyPreferences();
    renderSidebarTOC();
    renderChapter(state.currentChapterId);
    setupShortcuts();
    bindEvents();
    console.log("Suy Tuong Book Reader initialized successfully.");
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
