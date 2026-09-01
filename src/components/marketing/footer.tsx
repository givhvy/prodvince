import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import { FOOTER_LINKS } from "@/constants/links";

const Footer = () => {
  return (
    <footer className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center border-t border-foreground/5 px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-32">
      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <Container>
          <div className="flex flex-col items-start justify-start md:max-w-[200px]">
            <div className="flex items-center gap-2">
              <Icons.icon className="h-5 w-auto" />
              <span className="text-base font-medium text-foreground md:text-lg">Velta</span>
            </div>
            <p className="mt-4 text-start text-sm text-muted-foreground">
              Beat marketplace with Studio tools, email marketing, and live Whop checkout.
            </p>
          </div>
        </Container>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:mt-16 sm:gap-8 xl:col-span-2 xl:mt-0">
          <div className="grid gap-8 md:grid-cols-2">
            <Container delay={0.1} className="h-auto">
              <h3 className="text-base font-medium text-foreground">Marketplace</h3>
              <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
                {FOOTER_LINKS.marketplace.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link transition-all duration-300 hover:text-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
            <Container delay={0.2} className="h-auto">
              <h3 className="text-base font-medium text-foreground">Producers</h3>
              <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
                {FOOTER_LINKS.producers.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link transition-all duration-300 hover:text-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <Container delay={0.3} className="h-auto">
              <h3 className="text-base font-medium text-foreground">Platform</h3>
              <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
                {FOOTER_LINKS.platform.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link transition-all duration-300 hover:text-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </div>
        </div>
      </div>

      <Container delay={0.5} className="relative mt-12 w-full lg:mt-20">
        <div className="footer mt-8 flex w-full justify-center md:mt-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Velta. Payments secured by Whop.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
