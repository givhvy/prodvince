import Link from "next/link";
import Container from "../global/container";

const GENRES = ["Trap", "Hip Hop", "R&B", "Drill", "Boom Bap", "Afrobeat", "Lo-Fi", "Pop"];

const Companies = () => {
  return (
    <div className="companies relative mt-16 flex w-full flex-col items-center justify-center py-20">
      <Container>
        <div className="flex flex-col items-center justify-center">
          <h4 className="text-2xl font-medium lg:text-4xl">
            Browse by <span className="font-subheading italic">genre</span>
          </h4>
        </div>
      </Container>

      <Container delay={0.1}>
        <div className="mx-auto flex max-w-3xl flex-row flex-wrap items-center justify-center gap-3 pt-16">
          {GENRES.map((genre) => (
            <Link
              key={genre}
              href={`/explore?genre=${encodeURIComponent(genre)}`}
              className="rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-border hover:text-foreground"
            >
              {genre}
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default Companies;
