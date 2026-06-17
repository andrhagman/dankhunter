import React from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  CircleDot,
  ExternalLink,
  Filter,
  Flame,
  Gamepad2,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  TimerReset
} from "lucide-react";
import { type Confidence, type Release, type TimelineEvent } from "./data";
import releaseData from "./data/pc-releases.json";
import seasonData from "./data/season-calendar.json";
import "./styles.css";

const pcReleases = releaseData.releases as Release[];
const timelineEvents = seasonData.events as TimelineEvent[];

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
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState("Upcoming");

  const sortedEvents = [...timelineEvents].sort(
    (a, b) => normalizedDate(a.date).getTime() - normalizedDate(b.date).getTime()
  );

  const filteredEvents = sortedEvents.filter((event) => {
    const matchesKind = kind === "All" || event.type === kind || event.status === kind;
    const haystack = `${event.game} ${event.title} ${event.note}`.toLowerCase();
    return matchesKind && haystack.includes(query.toLowerCase());
  });

  const upcomingCount = sortedEvents.filter((event) => event.status === "Upcoming").length;
  const nextEvent = sortedEvents.find((event) => event.status === "Upcoming") ?? sortedEvents[0];

  return (
    <main>
      <section className="topbar" aria-label="Dankhunter overview">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Swords size={24} />
          </div>
          <div>
            <p>Dankhunter</p>
            <span>Season, wipe, and PC release tracker</span>
          </div>
        </div>

        <div className="search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games, seasons, expansions"
            aria-label="Search"
          />
        </div>
      </section>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <Flame size={16} /> Live watchlist
          </p>
          <h1>Track the next grind before the patch notes hit.</h1>
          <p>
            A compact calendar for seasons, wipes, expansions, ladders, and notable PC launches.
          </p>
        </div>

        <div className="stats-grid" aria-label="Tracker stats">
          <Metric icon={<CalendarDays />} label="Tracked events" value={timelineEvents.length} />
          <Metric icon={<TimerReset />} label="Upcoming" value={upcomingCount} />
          <Metric
            icon={<CircleDot />}
            label="Next window"
            value={prettyDate(nextEvent.date, nextEvent.confidence)}
          />
        </div>
      </section>

      <section className="controls" aria-label="Timeline filters">
        <div className="control-label">
          <Filter size={17} />
          Filter
        </div>
        {["All", "Upcoming", "Live", "Season", "Expansion", "Patch", "Launch"].map((filter) => (
          <button
            className={kind === filter ? "active" : ""}
            key={filter}
            onClick={() => setKind(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="layout">
        <div className="panel timeline-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <CalendarDays size={16} /> Season calendar
              </p>
              <h2>Season calendar</h2>
            </div>
            <span>{filteredEvents.length} visible</span>
          </div>

          <div className="timeline">
            {filteredEvents.map((event) => (
              <TimelineCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        <aside className="panel releases-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <Gamepad2 size={16} /> Release radar
              </p>
              <h2>Upcoming PC games</h2>
            </div>
            <span>Updated {releasesUpdatedAt}</span>
          </div>

          <div className="release-list">
            {pcReleases.map((release) => (
              <a className="release-row" href={release.sourceUrl} key={release.id}>
                <div>
                  <strong>{release.title}</strong>
                  <span>{release.genre}</span>
                </div>
                <time>{prettyDate(release.date, release.confidence)}</time>
              </a>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}

function TimelineCard({ event }: { event: TimelineEvent }) {
  const remaining = daysUntil(event.date);
  const isPast = remaining < 0;

  return (
    <article className="timeline-card" style={{ "--accent": event.accent } as React.CSSProperties}>
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
    </article>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
