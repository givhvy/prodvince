import Image from "next/image";
import Link from "next/link";
import Container from "../global/container";
import { Button } from "../ui/button";

const Integration = () => {
  return (
    <section className="relative flex w-full flex-col items-center justify-center py-16 sm:py-20">
      <Container className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-2xl font-semibold !leading-snug md:text-4xl lg:text-5xl">
          Whop checkout and iOS sync
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          License beats instantly, then open the same library on web and iPhone.
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          <Image
            src="/images/integration.svg"
            alt=""
            width={640}
            height={360}
            loading="lazy"
            className="h-auto w-full"
          />
        </div>
        <Link href="/explore" className="mt-8 inline-flex">
          <Button size="lg">Browse beats</Button>
        </Link>
      </Container>
    </section>
  );
};

export default Integration;
