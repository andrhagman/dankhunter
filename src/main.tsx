import React from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition, type Variants } from "motion/react";
import {
  CalendarDays,
  CircleDot,
  ExternalLink,
  Flame,
  Gamepad2,
  Search,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Settings2,
  X
} from "lucide-react";
import { type Confidence, type Release, type TimelineEvent } from "./data";
import releaseData from "./data/pc-releases.json";
import seasonData from "./data/season-calendar.json";
import "./styles.css";

const pcReleases = releaseData.releases as Release[];
const timelineEvents = seasonData.events as TimelineEvent[];
const preferenceStorageKey = "dankhunter-season-games";
const calendarFilters = ["All", "Upcoming", "Live", "Season", "Expansion", "Patch", "Launch"];
const brandIconUrl = `${import.meta.env.BASE_URL}dankhunter-icon.png`;

const formatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const releasesUpdatedAt = formatter.format(new Date(releaseData.updatedAt));

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric"
});

type ViewMode = "seasons" | "releases";

const panelMotion: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(3px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(3px)" }
};

const itemMotion: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 }
};

const smoothTransition: Transition = { duration: 0.22, ease: "easeOut" };
const listFadeTransition: Transition = { duration: 0.2, ease: "easeOut" };
const layoutTransition: Transition = { type: "spring", stiffness: 520, damping: 42, mass: 0.7 };

type ListPhase = "idle" | "out" | "in";

function normalizedDate(date: string) {
  return new Date(date);
}

function prettyDate(date: string, confidence: Confidence) {
  const parsed = normalizedDate(date);

  if (confidence === "window") {
    return monthFormatter.format(parsed);
  }

  return formatter.format(parsed);
}

function daysUntil(date: string) {
  const target = normalizedDate(date).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86_400_000);
}

function confidenceLabel(confidence: Confidence) {
  return {
    confirmed: "Confirmed",
    window: "Window",
    estimated: "Estimate"
  }[confidence];
}

function App() {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState("Upcoming");
  const [mode, setMode] = React.useState<ViewMode>("seasons");
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(false);

  const seasonGames = React.useMemo(
    () => [...new Set(timelineEvents.map((event) => event.game))].sort((a, b) => a.localeCompare(b)),
    []
  );
  const [selectedGames, setSelectedGames] = React.useState<string[]>(() => readStoredGames(seasonGames));

  const sortedEvents = [...timelineEvents].sort(
    (a, b) => normalizedDate(a.date).getTime() - normalizedDate(b.date).getTime()
  );
  const selectedEvents = sortedEvents.filter((event) => selectedGames.includes(event.game));

  const filteredEvents = selectedEvents.filter((event) => {
    const matchesKind = kind === "All" || event.type === kind || event.status === kind;
    const haystack = `${event.game} ${event.title} ${event.note}`.toLowerCase();
    return matchesKind && haystack.includes(query.toLowerCase());
  });

  const sortedReleases = [...pcReleases].sort(
    (a, b) => normalizedDate(a.date).getTime() - normalizedDate(b.date).getTime()
  );
  const filteredReleases = sortedReleases.filter((release) => {
    const haystack = `${release.title} ${release.genre} ${release.platform}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const upcomingCount = selectedEvents.filter((event) => event.status === "Upcoming").length;
  const nextEvent = selectedEvents.find((event) => event.status === "Upcoming") ?? selectedEvents[0];
  const nextRelease = sortedReleases[0];
  const selectedGameCount = selectedGames.length;
  const activeStats =
    mode === "seasons"
      ? {
          events: selectedEvents.length,
          label: "Tracked seasons",
          upcoming: upcomingCount,
          upcomingLabel: "Upcoming",
          next: nextEvent ? prettyDate(nextEvent.date, nextEvent.confidence) : "None",
          nextLabel: "Next window"
        }
      : {
          events: sortedReleases.length,
          label: "Tracked releases",
          upcoming: filteredReleases.length,
          upcomingLabel: "Visible",
          next: nextRelease ? prettyDate(nextRelease.date, nextRelease.confidence) : "None",
          nextLabel: "Next release"
        };
  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden",
        animate: "visible",
        exit: "exit",
        variants: panelMotion,
        transition: smoothTransition
      };
  const itemMotionProps = reduceMotion
    ? {}
    : {
        initial: "hidden",
        animate: "visible",
        variants: itemMotion,
        transition: smoothTransition
      };

  React.useEffect(() => {
    localStorage.setItem(preferenceStorageKey, JSON.stringify(selectedGames));
  }, [selectedGames]);

  function toggleGame(game: string) {
    setSelectedGames((current) => {
      if (current.includes(game)) {
        return current.filter((candidate) => candidate !== game);
      }

      return [...current, game].sort((a, b) => a.localeCompare(b));
    });
  }

  function selectAllGames() {
    setSelectedGames(seasonGames);
  }

  function resetDefaultGames() {
    localStorage.removeItem(preferenceStorageKey);
    setSelectedGames(seasonGames);
  }

  return (
    <main>
      <section className="topbar" aria-label="Dankhunter overview">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <img alt="" src={brandIconUrl} />
          </div>
          <div>
            <p>Dankhunter</p>
            <span>Season, wipe, and PC release tracker</span>
          </div>
        </div>
      </section>

      <motion.section className="hero" layout>
        <div className="hero-primary">
          <div className="hero-copy">
            <p className="eyebrow">
              <Flame size={16} /> Dankhunter
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1 key={mode} {...motionProps}>
                {mode === "seasons" ? "Calendar" : "Game releases"}
              </motion.h1>
            </AnimatePresence>
          </div>

          <section className="mode-switch" aria-label="Tracker mode">
            <button
              aria-pressed={mode === "seasons"}
              className={mode === "seasons" ? "active" : ""}
              onClick={() => setMode("seasons")}
              type="button"
            >
              <CalendarDays size={17} />
              <span>
                Calendar
                <small>Live season dates</small>
              </span>
            </button>
            <button
              aria-pressed={mode === "releases"}
              className={mode === "releases" ? "active" : ""}
              onClick={() => setMode("releases")}
              type="button"
            >
              <Gamepad2 size={17} />
              <span>
                Game releases
                <small>New PC launches</small>
              </span>
            </button>
          </section>
        </div>

        <div className="stats-grid" aria-label="Tracker stats">
          <AnimatePresence mode="popLayout" initial={false}>
            <Metric key={activeStats.label} icon={<CalendarDays />} label={activeStats.label} value={activeStats.events} />
            <Metric key={activeStats.upcomingLabel} icon={<TimerReset />} label={activeStats.upcomingLabel} value={activeStats.upcoming} />
            <Metric
              key={activeStats.nextLabel}
              icon={<CircleDot />}
              label={activeStats.nextLabel}
              value={activeStats.next}
            />
          </AnimatePresence>
        </div>
      </motion.section>

      <section className="layout">
        <AnimatePresence mode="wait" initial={false}>
        {mode === "seasons" ? (
          <motion.div className="panel timeline-panel" key="calendar" {...motionProps}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <CalendarDays size={16} /> Priority watchlist
                </p>
                <h2>Calendar</h2>
              </div>
              <div className="panel-summary" aria-label="Calendar summary">
                <span>{filteredEvents.length} showing</span>
                <span>{selectedGameCount} games</span>
              </div>
            </div>

            <section className="calendar-toolbar" aria-label="Calendar controls">
              <div className="toolbar-group" aria-label="Calendar filters">
                <span className="toolbar-label">Show</span>
                <LayoutGroup id="calendar-filters">
                  {calendarFilters.map((filter) => (
                    <FilterButton
                      isActive={kind === filter}
                      key={filter}
                      label={filter}
                      onClick={() => setKind(filter)}
                      reduceMotion={Boolean(reduceMotion)}
                    />
                  ))}
                </LayoutGroup>
              </div>

              <div className="toolbar-actions">
                <button
                  aria-expanded={isPreferencesOpen}
                  aria-label="Tracked games"
                  className="preference-button"
                  onClick={() => setIsPreferencesOpen((open) => !open)}
                  title="Tracked games"
                  type="button"
                >
                  <Settings2 size={17} />
                  <span>Games</span>
                </button>
                <SearchField
                  onChange={setQuery}
                  placeholder="Search"
                  value={query}
                />
              </div>
            </section>

            <AnimatePresence initial={false}>
            {isPreferencesOpen ? (
              <motion.div
                className="preferences-popover"
                role="dialog"
                aria-label="Calendar preferences"
                key="preferences"
                {...motionProps}
              >
                <div className="preferences-header">
                  <div>
                    <strong>My calendar</strong>
                    <span>
                      {selectedGameCount} of {seasonGames.length} games selected
                    </span>
                  </div>
                  <button
                    aria-label="Close preferences"
                    className="icon-button"
                    onClick={() => setIsPreferencesOpen(false)}
                    title="Close"
                    type="button"
                  >
                    <X size={17} />
                  </button>
                </div>
                <div className="game-toggle-list">
                  {seasonGames.map((game) => (
                    <label className="game-toggle" key={game}>
                      <input
                        checked={selectedGames.includes(game)}
                        onChange={() => toggleGame(game)}
                        type="checkbox"
                      />
                      <span>{game}</span>
                    </label>
                  ))}
                </div>
                <div className="preferences-footer">
                  <button onClick={selectAllGames} type="button">
                    Select all
                  </button>
                  <button onClick={resetDefaultGames} type="button">
                    Reset
                  </button>
                </div>
              </motion.div>
            ) : null}
            </AnimatePresence>

            <CalendarList events={filteredEvents} reduceMotion={Boolean(reduceMotion)} />
          </motion.div>
        ) : null}

        {mode === "releases" ? (
          <motion.aside className="panel releases-panel" key="releases" {...motionProps}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <Gamepad2 size={16} /> Release radar
                </p>
                <h2>Game releases</h2>
              </div>
              <div className="release-actions">
                <div className="panel-summary" aria-label="Release summary">
                  <span>{filteredReleases.length} showing</span>
                  <span>Updated {releasesUpdatedAt}</span>
                </div>
                <SearchField
                  onChange={setQuery}
                  placeholder="Search game releases"
                  value={query}
                />
              </div>
            </div>

            <div className="release-list">
              <AnimatePresence initial={false}>
                {filteredReleases.length > 0 ? (
                  filteredReleases.map((release, index) => (
                    <motion.a
                      className="release-row"
                      href={release.sourceUrl}
                      key={release.id}
                      layout
                      {...(reduceMotion
                        ? {}
                        : {
                            initial: "hidden",
                            animate: "visible",
                            exit: "exit",
                            variants: itemMotion,
                            transition: { ...smoothTransition, delay: Math.min(index * 0.012, 0.12) }
                          })}
                    >
                      <div>
                        <strong>{release.title}</strong>
                        <span>{release.genre}</span>
                      </div>
                      <time>{prettyDate(release.date, release.confidence)}</time>
                    </motion.a>
                  ))
                ) : (
                  <motion.div className="empty-state" key="empty-releases" layout {...itemMotionProps}>
                    <strong>No matching releases</strong>
                    <span>Try another game title, genre, or platform.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
}

function readStoredGames(allGames: string[]) {
  try {
    const stored = JSON.parse(localStorage.getItem(preferenceStorageKey) ?? "null");

    if (Array.isArray(stored)) {
      const validGames = stored.filter((game): game is string => allGames.includes(game));
      return validGames;
    }
  } catch {
    return allGames;
  }

  return allGames;
}

function eventSignature(events: TimelineEvent[]) {
  return events.map((event) => event.id).join("|");
}

function CalendarList({ events, reduceMotion }: { events: TimelineEvent[]; reduceMotion: boolean }) {
  const [displayedEvents, setDisplayedEvents] = React.useState(events);
  const [shellHeight, setShellHeight] = React.useState<number | "auto">("auto");
  const [phase, setPhase] = React.useState<ListPhase>("idle");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef<number[]>([]);
  const targetSignature = eventSignature(events);
  const displayedSignature = eventSignature(displayedEvents);
  const timelineAnimate = reduceMotion
    ? undefined
    : {
        opacity: phase === "out" ? 0.16 : 1,
        y: phase === "out" ? -6 : 0,
        filter: phase === "out" ? "blur(2px)" : "blur(0px)"
      };

  React.useEffect(() => {
    return () => {
      timers.current.forEach(window.clearTimeout);
    };
  }, []);

  React.useLayoutEffect(() => {
    if (targetSignature === displayedSignature) {
      return;
    }

    if (reduceMotion) {
      setDisplayedEvents(events);
      setShellHeight("auto");
      setPhase("idle");
      return;
    }

    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    const previousHeight = contentRef.current?.offsetHeight ?? 0;
    setShellHeight(previousHeight);
    setPhase("out");

    const swapTimer = window.setTimeout(() => {
      setDisplayedEvents(events);
      setPhase("in");

      requestAnimationFrame(() => {
        const nextHeight = contentRef.current?.offsetHeight ?? previousHeight;
        setShellHeight(nextHeight);

        const releaseTimer = window.setTimeout(() => {
          setShellHeight("auto");
          setPhase("idle");
        }, 360);
        timers.current.push(releaseTimer);
      });
    }, 180);

    timers.current.push(swapTimer);
  }, [displayedSignature, events, reduceMotion, targetSignature]);

  return (
    <motion.div
      animate={{ height: shellHeight }}
      className="timeline-shell"
      transition={layoutTransition}
    >
      <motion.div
        animate={timelineAnimate}
        className="timeline"
        ref={contentRef}
        transition={listFadeTransition}
      >
        {displayedEvents.length > 0 ? (
          displayedEvents.map((event) => <TimelineCard key={event.id} event={event} />)
        ) : (
          <motion.div className="empty-state" layout transition={layoutTransition}>
            <strong>No matching seasons</strong>
            <span>Adjust your calendar preferences, search, or filter.</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function FilterButton({
  isActive,
  label,
  onClick,
  reduceMotion
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
  reduceMotion: boolean;
}) {
  return (
    <button
      aria-pressed={isActive}
      className={`filter-button ${isActive ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {isActive && !reduceMotion ? (
        <motion.span
          className="filter-active-indicator"
          layoutId="calendar-filter-active"
          transition={layoutTransition}
        />
      ) : null}
      <span className="filter-button-label">{label}</span>
    </button>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <motion.div
      animate="visible"
      className="metric"
      initial="hidden"
      layout
      transition={smoothTransition}
      variants={itemMotion}
    >
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </motion.div>
  );
}

function SearchField({
  onChange,
  placeholder,
  value
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="search">
      <Search size={18} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
    </div>
  );
}

function TimelineCard({
  event
}: {
  event: TimelineEvent;
}) {
  const remaining = daysUntil(event.date);
  const isPast = remaining < 0;

  return (
    <motion.article
      className="timeline-card"
      layout
      style={{ "--accent": event.accent } as React.CSSProperties}
      transition={layoutTransition}
    >
      <div className="date-block">
        <time>{prettyDate(event.date, event.confidence)}</time>
        <span>{isPast ? "Live now" : `${remaining} days`}</span>
      </div>
      <div className="marker" aria-hidden="true" />
      <div className="event-body">
        <div className="event-topline">
          <span>{event.game}</span>
          <span className={`confidence ${event.confidence}`}>
            {event.confidence === "confirmed" ? <ShieldCheck size={14} /> : <Sparkles size={14} />}
            {confidenceLabel(event.confidence)}
          </span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.note}</p>
        <div className="event-footer">
          <span>{event.type}</span>
          <a href={event.sourceUrl}>
            {event.sourceName} <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
