const genres = [
  "Trap",
  "Hip Hop",
  "R&B",
  "Drill",
  "Boom Bap",
  "Pop",
  "Afrobeat",
  "Lo-Fi",
];

const moods = ["Dark", "Melodic", "Hard", "Chill", "Emotional"];

export function FilterSidebar() {
  return (
    <aside className="space-y-6 rounded-2xl border border-border/50 bg-card p-5 lg:rounded-3xl">
      <div>
        <p className="text-sm font-medium">Genres</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-border hover:text-foreground"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">Mood</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              type="button"
              className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-border hover:text-foreground"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">BPM</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <label className="space-y-1">
            <span>Min</span>
            <input
              type="number"
              defaultValue={70}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span>Max</span>
            <input
              type="number"
              defaultValue={160}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
        </div>
      </div>
    </aside>
  );
}
