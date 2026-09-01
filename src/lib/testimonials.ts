export type MockTestimonial = {
  id: string;
  name: string;
  handle: string;
  verified?: boolean;
  avatarUrl: string;
  profileUrl: string;
  text: string;
  tweetUrl: string;
};

export const TESTIMONIALS: MockTestimonial[] = [
  {
    id: "1",
    name: "Nova Beats",
    handle: "novabeats",
    verified: true,
    avatarUrl:
      "https://res.cloudinary.com/dtkmkk6k7/image/upload/c_limit,w_96,f_auto,q_auto/v1787981012/design_gallery/zljnilrx4sxy9sy6y2tr.jpg",
    profileUrl: "https://x.com/novabeats",
    tweetUrl: "https://x.com/novabeats/status/1",
    text: "Velta Studio replaced three tools for me. Upload, Whop checkout, and buyer emails — all in one dashboard. First week: 12 MP3 sales without chasing invoices.",
  },
  {
    id: "2",
    name: "Maya R.",
    handle: "mayarwrites",
    verified: true,
    avatarUrl:
      "https://res.cloudinary.com/dtkmkk6k7/image/upload/c_limit,w_96,f_auto,q_auto/v1787981013/design_gallery/y63dt7pddlvg0wclmtxn.jpg",
    profileUrl: "https://x.com/mayarwrites",
    tweetUrl: "https://x.com/mayarwrites/status/2",
    text: "Found the exact dark trap loop I needed on Explore in under 2 minutes. Licensed WAV through Whop and had stems in my inbox before I finished coffee. @velta is clean.",
  },
  {
    id: "3",
    name: "Kairo",
    handle: "kairo808",
    avatarUrl:
      "https://res.cloudinary.com/dtkmkk6k7/image/upload/c_limit,w_96,f_auto,q_auto/v1787981014/design_gallery/q8x9v2m1n0p3r5t7u1w4.jpg",
    profileUrl: "https://x.com/kairo808",
    tweetUrl: "https://x.com/kairo808/status/3",
    text: "The demostack-style Studio overview is actually useful — not just pretty charts. I can see plays, payouts, and which beats convert before I drop the next pack.",
  },
  {
    id: "4",
    name: "ELIRA",
    handle: "elira.music",
    verified: true,
    avatarUrl:
      "https://res.cloudinary.com/dtkmkk6k7/image/upload/c_limit,w_96,f_auto,q_auto/v1787981012/design_gallery/zljnilrx4sxy9sy6y2tr.jpg",
    profileUrl: "https://x.com/elira.music",
    tweetUrl: "https://x.com/elira.music/status/4",
    text: "Switched our beat store to Velta + Whop. Exclusive tiers, instant delivery, and the library keeps buyers coming back. Producers: stop duct-taping Gumroad + email.",
  },
  {
    id: "5",
    name: "Jules",
    handle: "julesonthetrack",
    avatarUrl:
      "https://res.cloudinary.com/dtkmkk6k7/image/upload/c_limit,w_96,f_auto,q_auto/v1787981013/design_gallery/y63dt7pddlvg0wclmtxn.jpg",
    profileUrl: "https://x.com/julesonthetrack",
    tweetUrl: "https://x.com/julesonthetrack/status/5",
    text: "Genre filters + uniform beat cards make browsing feel like BeatStars without the clutter. Bought two leases last night from creators I discovered on /creators.",
  },
  {
    id: "6",
    name: "Admin Velta",
    handle: "velta",
    verified: true,
    avatarUrl:
      "https://res.cloudinary.com/dtkmkk6k7/image/upload/c_limit,w_96,f_auto,q_auto/v1787981014/design_gallery/q8x9v2m1n0p3r5t7u1w4.jpg",
    profileUrl: "https://x.com/velta",
    tweetUrl: "https://x.com/velta/status/6",
    text: "Built for producers who sell beats, not spreadsheets. Marketplace discovery, Studio uploads, Resend campaigns, and live Whop checkout — one stack, blue accents only.",
  },
];
