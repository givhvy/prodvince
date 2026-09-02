import Container from "@/components/global/container";
import { MockTweetCard } from "@/components/ui/mock-tweet-card";
import { TESTIMONIALS } from "@/lib/testimonials";

const Testimonials = () => {
  return (
    <section className="relative flex w-full flex-col items-center justify-center py-20">
      <Container>
        <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-400/90">
            Loved by producers & artists
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium !leading-snug md:text-4xl lg:text-5xl">
            What creators are <span className="font-subheading italic">saying</span>
          </h2>
          <p className="mt-4 text-base text-accent-foreground/80 md:text-lg">
            Real workflow wins from sellers and buyers on Velta, styled like the posts they share.
          </p>
        </div>
      </Container>

      <div className="grid w-full grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:gap-5">
        {TESTIMONIALS.map((testimonial, index) => (
          <Container key={testimonial.id} delay={0.05 + index * 0.05}>
            <MockTweetCard testimonial={testimonial} className="mx-auto h-full" />
          </Container>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
