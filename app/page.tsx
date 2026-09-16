"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SearchResult = {
  title: string;
  url: string;
  content: string;
  thumbnail?: string | null;
  engine?: string;
};

const QUICK_SEARCHES = [
  "Cybersecurity",
  "Technology",
  "News",
  "Wikipedia",
];

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function Icon({
  name,
  size = 20,
}: {
  name:
    | "search"
    | "shield"
    | "globe"
    | "image"
    | "arrow"
    | "plus"
    | "lock"
    | "trash"
    | "chevron"
    | "external"
    | "back"
    | "forward"
    | "reload"
    | "home"
    | "expand"
    | "minimize";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 19 6v5.5c0 4.7-3 7.9-7 9.5-4-1.6-7-4.8-7-9.5V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17" />
          <path d="M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5s-1 6.2-3.2 8.5c-2.2-2.3-3.2-5.1-3.2-8.5S9.8 5.8 12 3.5Z" />
        </svg>
      );

    case "image":
      return (
        <svg {...common}>
          <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
          <circle cx="8.5" cy="9" r="1.4" />
          <path d="m5.5 17 4.2-4.2 3.1 3 2.2-2.2 3.5 3.4" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h13" />
          <path d="m13 7 5 5-5 5" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="M7 7l1 13h8l1-13" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m7 10 5 5 5-5" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="M10 14 20 4" />
          <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
        </svg>
      );

    case "back":
      return (
        <svg {...common}>
          <path d="M19 12H5" />
          <path d="m11 6-6 6 6 6" />
        </svg>
      );

    case "forward":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "reload":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14.8-4L4 9" />
          <path d="M4 4v5h5" />
          <path d="M4 13a8 8 0 0 0 14.8 4L20 15" />
          <path d="M20 20v-5h-5" />
        </svg>
      );

    case "home":
      return (
        <svg {...common}>
          <path d="m3 11 9-7 9 7" />
          <path d="M5 10v9h14v-9" />
          <path d="M9 19v-5h6v5" />
        </svg>
      );

    case "expand":
      return (
        <svg {...common}>
          <path d="M8 3H3v5" />
          <path d="M3 3l6 6" />
          <path d="M16 3h5v5" />
          <path d="m21 3-6 6" />
          <path d="M8 21H3v-5" />
          <path d="m3 21 6-6" />
          <path d="M16 21h5v-5" />
          <path d="m21 21-6-6" />
        </svg>
      );

    case "minimize":
      return (
        <svg {...common}>
          <path d="M9 3v6H3" />
          <path d="m3 3 6 6" />
          <path d="M15 3v6h6" />
          <path d="m21 3-6 6" />
          <path d="M9 21v-6H3" />
          <path d="m3 21 6-6" />
          <path d="M15 21v-6h6" />
          <path d="m21 21-6-6" />
        </svg>
      );
  }
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"web" | "images">("web");
  const [safeSearch, setSafeSearch] = useState(true);

  const [results, setResults] = useState<SearchResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [showPrivacy, setShowPrivacy] = useState(false);

  /*
  ========================================================
  BROWSER STATE
  ========================================================
  */

  const [browserUrl, setBrowserUrl] = useState("");
  const [browserInput, setBrowserInput] = useState("");

  /*
  Browser navigation exists ONLY in React memory.

  Nothing is saved to:
  - localStorage
  - sessionStorage
  - database
  - cookies
  */

  const [browserHistory, setBrowserHistory] =
    useState<string[]>([]);

  const [browserIndex, setBrowserIndex] =
    useState(-1);

  const [browserKey, setBrowserKey] =
    useState(0);

  const [isBrowserExpanded, setIsBrowserExpanded] =
    useState(false);

  const browserSectionRef =
    useRef<HTMLElement>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();

    const applyTelegramTheme = () => {
      const root = document.documentElement;
      const colors = webApp.themeParams;

      if (colors.bg_color) {
        root.style.setProperty(
          "--telegram-bg-color",
          colors.bg_color
        );
      }

      if (colors.text_color) {
        root.style.setProperty(
          "--telegram-text-color",
          colors.text_color
        );
      }
    };

    applyTelegramTheme();
    webApp.onEvent(
      "themeChanged",
      applyTelegramTheme
    );

    return () => {
      webApp.offEvent(
        "themeChanged",
        applyTelegramTheme
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      isBrowserExpanded ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isBrowserExpanded]);

  useEffect(() => {
    if (!browserUrl) {
      return;
    }

    browserSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [browserUrl, browserKey]);

  /*
  ========================================================
  API BASE
  ========================================================
  */

  const API_BASE = useMemo(() => {
    const configuredApiUrl =
      process.env.NEXT_PUBLIC_API_URL?.trim();

    if (configuredApiUrl) {
      return configuredApiUrl.replace(/\/$/, "");
    }

    if (typeof window === "undefined") {
      return "http://localhost:5000";
    }

    const hostname =
      window.location.hostname;

    /*
    Local development
    */

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    ) {
      return "http://localhost:5000";
    }

    /*
    Phone/LAN testing.

    Example:

    Frontend:
    http://192.168.1.10:3000

    Backend:
    http://192.168.1.10:5000
    */

    return `http://${hostname}:5000`;
  }, []);

  /*
  ========================================================
  SEARCH
  ========================================================
  */

  async function performSearch(
    searchText?: string
  ) {
    const finalQuery =
      (searchText ?? query).trim();

    if (!finalQuery) {
      return;
    }

    setQuery(finalQuery);
    setLoading(true);
    setSearched(true);
    setSearchError("");

    try {
      const params =
        new URLSearchParams({
          q: finalQuery,
          mode,
          safe: String(safeSearch),
        });

      const response =
        await fetch(
          `${API_BASE}/api/search?${params.toString()}`
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Search failed"
        );
      }

      setResults(
        data.results || []
      );
    } catch (error) {
      setResults([]);
      setSearchError(
        error instanceof Error
          ? error.message
          : "Search service is unavailable"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  ========================================================
  URL NORMALIZATION
  ========================================================
  */

  function normalizeBrowserUrl(
    value: string
  ) {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return "";
    }

    try {
      const parsed = new URL(
        trimmed,
        "https://html.duckduckgo.com"
      );
      const destination = parsed.searchParams.get("uddg");

      if (destination) {
        const destinationUrl = new URL(destination);

        if (
          ["http:", "https:"].includes(
            destinationUrl.protocol
          )
        ) {
          return destinationUrl.toString();
        }
      }
    } catch {
      return "";
    }

    /*
    Already HTTP/HTTPS
    */

    if (
      /^https?:\/\//i.test(
        trimmed
      )
    ) {
      return trimmed;
    }

    /*
    Domain entered without protocol.

    example.com
    google.com/search?q=test
    */

    if (
      /^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(
        trimmed
      )
    ) {
      return `https://${trimmed}`;
    }

    /*
    Anything else is treated as
    a search query.
    */

    return "";
  }

  /*
  ========================================================
  OPEN THROUGH STARK
  ========================================================
  */

  function openInBrowser(
    value: string
  ) {
    const normalized =
      normalizeBrowserUrl(value);

    /*
    If it isn't a URL,
    search it instead.
    */

    if (!normalized) {
      performSearch(value);
      return;
    }

    // Open the selected result directly in the current tab.
    // This avoids iframe limitations on complex websites.
    window.location.assign(normalized);
  }

  /*
  ========================================================
  BACK
  ========================================================
  */

  function goBack() {
    if (browserIndex <= 0) {
      return;
    }

    const nextIndex =
      browserIndex - 1;

    const nextUrl =
      browserHistory[
        nextIndex
      ];

    if (!nextUrl) {
      return;
    }

    setBrowserIndex(
      nextIndex
    );

    setBrowserUrl(
      nextUrl
    );

    setBrowserInput(
      nextUrl
    );

    setBrowserKey(
      (current) =>
        current + 1
    );
  }

  /*
  ========================================================
  FORWARD
  ========================================================
  */

  function goForward() {
    if (
      browserIndex >=
      browserHistory.length - 1
    ) {
      return;
    }

    const nextIndex =
      browserIndex + 1;

    const nextUrl =
      browserHistory[
        nextIndex
      ];

    if (!nextUrl) {
      return;
    }

    setBrowserIndex(
      nextIndex
    );

    setBrowserUrl(
      nextUrl
    );

    setBrowserInput(
      nextUrl
    );

    setBrowserKey(
      (current) =>
        current + 1
    );
  }

  /*
  ========================================================
  RELOAD
  ========================================================
  */

  function reloadBrowser() {
    setBrowserKey(
      (current) =>
        current + 1
    );
  }

  /*
  ========================================================
  CLOSE BROWSER
  ========================================================
  */

  function closeBrowser() {
    setBrowserUrl("");
    setBrowserInput("");

    /*
    Destroy temporary
    navigation state.
    */

    setBrowserHistory([]);
    setBrowserIndex(-1);

    setBrowserKey(0);
    setIsBrowserExpanded(false);
  }

  /*
  ========================================================
  NEW SESSION
  ========================================================
  */

  function startNewSession() {
    setQuery("");
    setResults([]);
    setSearched(false);
    setSearchError("");
    setShowPrivacy(false);

    closeBrowser();
  }

  /*
  ========================================================
  UI
  ========================================================
  */

  return (
    <main className="stark-shell">

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* ==================================================
          TOP BAR
      ================================================== */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-mark">
            S
          </div>

          <div>
            <div className="brand-name">
              STARK
            </div>

            <div className="brand-subtitle">
              PRIVATE BROWSER
            </div>
          </div>

        </div>

        <button
          className="session-pill"
          onClick={() =>
            setShowPrivacy(true)
          }
          type="button"
        >

          <span className="session-dot" />

          <span>
            Private session
          </span>

          <Icon
            name="chevron"
            size={14}
          />

        </button>

      </header>

      {/* ==================================================
          HERO + SEARCH
      ================================================== */}

      <section
        className={`hero ${
          searched
            ? "hero-compact"
            : ""
        }`}
      >

        <div className="hero-badge">

          <Icon
            name="shield"
            size={15}
          />

          <span>
            Private by design
          </span>

        </div>

        <h1>
          Search the web.
          <br />
          <span>
            Keep your session private.
          </span>
        </h1>

        {!searched && (
          <p className="hero-description">
            A clean search experience
            built around temporary
            sessions and minimal
            data retention.
          </p>
        )}

        <div className="search-card">

          <div className="search-input-row">

            <Icon
              name="search"
              size={22}
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  performSearch();
                }
              }}
              placeholder={
                mode === "images"
                  ? "Search images..."
                  : "Search anything..."
              }
              autoComplete="off"
              spellCheck={false}
            />

            {query && (
              <button
                className="clear-search"
                onClick={() =>
                  setQuery("")
                }
                type="button"
                aria-label="Clear search"
              >
                ×
              </button>
            )}

            <button
              className="search-button"
              onClick={() =>
                performSearch()
              }
              disabled={
                loading ||
                !query.trim()
              }
              type="button"
            >

              {loading ? (
                <span className="spinner" />
              ) : (
                <Icon
                  name="arrow"
                  size={20}
                />
              )}

            </button>

          </div>

          <div className="search-options">

            <div className="mode-switch">

              <button
                className={
                  mode === "web"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMode("web")
                }
                type="button"
              >

                <Icon
                  name="globe"
                  size={16}
                />

                Web

              </button>

              <button
                className={
                  mode === "images"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMode("images")
                }
                type="button"
              >

                <Icon
                  name="image"
                  size={16}
                />

                Images

              </button>

            </div>

            <button
              className={`safe-control ${
                safeSearch
                  ? "enabled"
                  : ""
              }`}
              onClick={() =>
                setSafeSearch(
                  (value) =>
                    !value
                )
              }
              type="button"
            >

              <span className="safe-icon">
                <Icon
                  name="shield"
                  size={14}
                />
              </span>

              <span>
                Safe Search
              </span>

              <span className="toggle">
                <span />
              </span>

            </button>

          </div>

        </div>

      </section>

      {/* ==================================================
          QUICK SEARCH
      ================================================== */}

      {!searched && (
        <section className="quick-section">

          <div className="section-label">
            Quick search
          </div>

          <div className="quick-list">

            {QUICK_SEARCHES.map(
              (item) => (
                <button
                  key={item}
                  onClick={() =>
                    performSearch(item)
                  }
                  type="button"
                >

                  {item}

                  <Icon
                    name="arrow"
                    size={15}
                  />

                </button>
              )
            )}

          </div>

        </section>
      )}

      {/* ==================================================
          SEARCH RESULTS
      ================================================== */}

      {searched && (
        <section className="results-section">

          <div className="results-header">

            <div>

              <div className="section-label">
                {mode === "images"
                  ? "Image results"
                  : "Web results"}
              </div>

              <h2>
                {loading
                  ? "Searching..."
                  : results.length
                    ? `Results for “${query}”`
                    : "No results found"}
              </h2>

            </div>

            <button
              className="new-search"
              onClick={
                startNewSession
              }
              type="button"
            >

              <Icon
                name="plus"
                size={17}
              />

              New

            </button>

          </div>

          {loading && (
            <div className="loading-box">

              <div className="large-spinner" />

              <span>
                Searching privately...
              </span>

            </div>
          )}

          {/* ==================================================
              WEB RESULTS

              IMPORTANT:
              These no longer open the
              external website directly.

              They open inside STARK.
          ================================================== */}

          {!loading &&
            mode === "web" &&
            results.length > 0 && (

              <div className="web-results">

                {results.map(
                  (
                    result,
                    index
                  ) => {

                    const domain =
                      getDomain(
                        result.url
                      );

                    return (
                      <button
                        className="result-card result-card-button"
                        onClick={() =>
                          openInBrowser(
                            result.url
                          )
                        }
                        type="button"
                        key={`${result.url}-${index}`}
                      >

                        <div className="result-top">

                          <div className="site-icon">

                            <Icon
                              name="globe"
                              size={17}
                            />

                          </div>

                          <div className="result-domain">
                            {domain ||
                              "Web result"}
                          </div>

                          <div className="result-engine">
                            {result.engine ||
                              "Search"}
                          </div>

                        </div>

                        <h3>
                          {result.title}
                        </h3>

                        {result.content && (
                          <p>
                            {result.content}
                          </p>
                        )}

                        <div className="result-url">

                          {result.url}

                          <Icon
                            name="arrow"
                            size={14}
                          />

                        </div>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          {/* ==================================================
              IMAGE RESULTS
          ================================================== */}

          {!loading &&
            mode === "images" &&
            results.length > 0 && (

              <div className="image-results">

                {results.map(
                  (
                    result,
                    index
                  ) => (

                    <button
                      className="image-card"
                      onClick={() =>
                        openInBrowser(
                          result.url
                        )
                      }
                      type="button"
                      key={`${result.url}-${index}`}
                    >

                      {result.thumbnail ? (
                        <img
                          src={
                            result.thumbnail
                          }
                          alt={
                            result.title
                          }
                          loading="lazy"
                        />
                      ) : (
                        <div className="image-placeholder">

                          <Icon
                            name="image"
                            size={28}
                          />

                        </div>
                      )}

                      <div className="image-info">

                        <span>
                          {result.title ||
                            "Image"}
                        </span>

                      </div>

                    </button>

                  )
                )}

              </div>
            )}

          {/* ==================================================
              EMPTY RESULTS
          ================================================== */}

          {!loading &&
            results.length === 0 && (

              <div className="empty-results">

                <div className="empty-icon">

                  <Icon
                    name="search"
                    size={25}
                  />

                </div>

                <h3>
                  Nothing found
                </h3>

                <p>
                  {searchError || (
                    <>
                      Try a different
                      search or check
                      your connection
                      to the search
                      service.
                    </>
                  )}
                </p>

              </div>
            )}

        </section>
      )}

      {/* ==================================================
          STARK BROWSER
      ================================================== */}

      {browserUrl && (

        <section
          ref={browserSectionRef}
          className={`browser-section ${
            isBrowserExpanded
              ? "browser-section-expanded"
              : ""
          }`}
        >

          {/* ==================================================
              BROWSER TOOLBAR
          ================================================== */}

          <div className="browser-toolbar">

            <div className="browser-nav-actions">

              <button
                className="browser-icon-button"
                onClick={goBack}
                disabled={
                  browserIndex <= 0
                }
                type="button"
                aria-label="Back"
              >

                <Icon
                  name="back"
                  size={18}
                />

              </button>

              <button
                className="browser-icon-button"
                onClick={goForward}
                disabled={
                  browserIndex >=
                  browserHistory.length -
                    1
                }
                type="button"
                aria-label="Forward"
              >

                <Icon
                  name="forward"
                  size={18}
                />

              </button>

              <button
                className="browser-icon-button"
                onClick={
                  reloadBrowser
                }
                type="button"
                aria-label="Reload"
              >

                <Icon
                  name="reload"
                  size={17}
                />

              </button>

              <button
                className="browser-icon-button"
                onClick={() =>
                  setIsBrowserExpanded(
                    (expanded) => !expanded
                  )
                }
                type="button"
                aria-label={
                  isBrowserExpanded
                    ? "Restore browser size"
                    : "Full screen browser"
                }
                title={
                  isBrowserExpanded
                    ? "Restore size"
                    : "Full screen"
                }
              >

                <Icon
                  name={
                    isBrowserExpanded
                      ? "minimize"
                      : "expand"
                  }
                  size={17}
                />

              </button>

            </div>

            {/* ==================================================
                ADDRESS BAR
            ================================================== */}

            <form
              className="browser-address"
              onSubmit={(event) => {
                event.preventDefault();

                openInBrowser(
                  browserInput
                );
              }}
            >

              <Icon
                name="lock"
                size={15}
              />

              <input
                value={browserInput}
                onChange={(event) =>
                  setBrowserInput(
                    event.target.value
                  )
                }
                aria-label="Address bar"
                autoComplete="off"
                spellCheck={false}
              />

            </form>

            <button
              className="browser-icon-button browser-home"
              onClick={
                startNewSession
              }
              type="button"
              aria-label="Home"
            >

              <Icon
                name="home"
                size={18}
              />

            </button>

          </div>

          {/* ==================================================
              BROWSER STATUS
          ================================================== */}

          <div className="browser-status">

            <span className="browser-live-dot" />

            <span>
              STARK secure temporary view
            </span>

            <button
              onClick={
                closeBrowser
              }
              type="button"
            >
              Close
            </button>

          </div>

          {/* ==================================================
              PROXY BROWSER FRAME
          ================================================== */}

          <div className="browser-frame-wrap">

            <iframe
              key={browserKey}
              className="browser-frame"

              /*
              IMPORTANT:

              The website is NOT loaded
              directly anymore.

              It goes through:

              STARK frontend
                    ↓
              STARK backend
                    ↓
              Secure proxy
                    ↓
              Website
              */

              src={`${API_BASE}/api/proxy?url=${encodeURIComponent(
                browserUrl
              )}`}

              title="STARK browser view"

              referrerPolicy="no-referrer"

              /*
              The iframe is sandboxed.

              We deliberately DO NOT give
              it unrestricted same-origin
              access.
              */

              sandbox="
                allow-forms
                allow-modals
                allow-popups
                allow-popups-to-escape-sandbox
                allow-presentation
                allow-scripts
              "
            />

            <div className="browser-frame-note">

              STARK is loading this page
              through the temporary privacy
              proxy. Complex websites may
              not fully render yet.

            </div>

          </div>

        </section>
      )}

      {/* ==================================================
          PRIVACY STRIP
      ================================================== */}

      <section className="privacy-strip">

        <div className="privacy-icon">

          <Icon
            name="lock"
            size={19}
          />

        </div>

        <div className="privacy-copy">

          <strong>
            Temporary session
          </strong>

          <span>
            This interface does not
            create a search-history list.
          </span>

        </div>

        <button
          onClick={() =>
            setShowPrivacy(true)
          }
          type="button"
        >

          Privacy

          <Icon
            name="arrow"
            size={15}
          />

        </button>

      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="footer">

        <span>
          STARK
        </span>

        <span className="footer-dot">
          •
        </span>

        <span>
          Private browsing experience
        </span>

      </footer>

      {/* ==================================================
          BOTTOM NAV
      ================================================== */}

      <nav className="bottom-nav">

        <button
          className="nav-active"
          type="button"
        >

          <Icon
            name="search"
            size={19}
          />

          <span>
            Search
          </span>

        </button>

        <button
          onClick={
            startNewSession
          }
          type="button"
        >

          <Icon
            name="plus"
            size={19}
          />

          <span>
            New
          </span>

        </button>

        <button
          onClick={() =>
            setShowPrivacy(true)
          }
          type="button"
        >

          <Icon
            name="shield"
            size={19}
          />

          <span>
            Privacy
          </span>

        </button>

      </nav>

      {/* ==================================================
          PRIVACY MODAL
      ================================================== */}

      {showPrivacy && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setShowPrivacy(false)
          }
        >

          <div
            className="privacy-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <div className="section-label">
                  STARK
                </div>

                <h2>
                  Privacy center
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowPrivacy(false)
                }
                type="button"
              >
                ×
              </button>

            </div>

            <div className="privacy-status">

              <div className="status-check">

                <Icon
                  name="shield"
                  size={20}
                />

              </div>

              <div>

                <strong>
                  Private session active
                </strong>

                <span>
                  Your current interface
                  session is temporary.
                </span>

              </div>

            </div>

            <div className="privacy-row">

              <div className="privacy-row-icon">

                <Icon
                  name="search"
                  size={18}
                />

              </div>

              <div>

                <strong>
                  Search history
                </strong>

                <span>
                  Not displayed or stored
                  by this interface.
                </span>

              </div>

              <span className="status-badge">
                OFF
              </span>

            </div>

            <div className="privacy-row">

              <div className="privacy-row-icon">

                <Icon
                  name="shield"
                  size={18}
                />

              </div>

              <div>

                <strong>
                  Safe Search
                </strong>

                <span>
                  {safeSearch
                    ? "Enabled"
                    : "Disabled"}
                </span>

              </div>

              <button
                className={`mini-toggle ${
                  safeSearch
                    ? "on"
                    : ""
                }`}
                onClick={() =>
                  setSafeSearch(
                    (value) =>
                      !value
                  )
                }
                type="button"
              >

                <span />

              </button>

            </div>

            <button
              className="destroy-button"
              onClick={
                startNewSession
              }
              type="button"
            >

              <Icon
                name="trash"
                size={18}
              />

              Destroy current session

            </button>

            <p className="modal-note">

              STARK is designed to
              minimize unnecessary
              retention. Network
              providers, search engines,
              and websites may still have
              their own logs and policies.

            </p>

          </div>

        </div>

      )}

    </main>
  );
}