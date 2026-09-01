import { GenreBentoGrid, GenreHoverList } from "@/components/genres/genre-grid";
import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";

export default function GenresPage() {
  return (
    <Wrapper className="py-12 sm:py-16 md:py-20">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <h1 className="font-heading text-3xl font-medium md:text-5xl">
            Browse by <span className="font-subheading italic">genre</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Pick a lane, preview beats, and license instantly with live Whop checkout.
          </p>
        </div>
      </Container>

      <Container delay={0.1} className="hidden md:block">
        <GenreBentoGrid />
      </Container>

      <Container delay={0.1} className="md:hidden">
        <GenreHoverList />
      </Container>
    </Wrapper>
  );
}
