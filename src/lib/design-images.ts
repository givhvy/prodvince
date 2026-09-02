/**
 * Curated assets from huy.global Design → Gallery (Firestore `gallery` collection).
 * Source: https://huy.global/design/gallery
 */

const CLOUDINARY_HOST = "res.cloudinary.com";

export function designImage(url: string, width = 960): string {
  if (!url.includes(CLOUDINARY_HOST) || !url.includes("/upload/")) {
    return url;
  }

  const transform = `f_auto,q_auto,c_limit,w_${width}`;
  if (/\/upload\/(?:[^/]*_,|f_auto|q_auto)/.test(url)) {
    return url.replace(/\/upload\/([^/]+)\//, `/upload/${transform}/`);
  }

  return url.replace("/upload/", `/upload/${transform}/`);
}

/** Auth panel carousel: ELIRA pack art + dark studio mood from Design Gallery */
export const AUTH_PANEL_IMAGES = [
  {
    url: "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787981012/design_gallery/zljnilrx4sxy9sy6y2tr.jpg",
    title: "ELIRA style 1",
  },
  {
    url: "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787981013/design_gallery/y63dt7pddlvg0wclmtxn.jpg",
    title: "ELIRA style 2",
  },
  {
    url: "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787981014/design_gallery/sjitahq75wqrkhlgbqp5.jpg",
    title: "ELIRA style 3",
  },
  {
    url: "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787827898/design_gallery/lwuaub4jjcvxwmjlq1lv.jpg",
    title: "MJ recreate unseenai dark mode",
  },
] as const;

/** Landing feature cards */
export const FEATURE_IMAGES = [
  "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787039058/design_gallery/eleoca49yl4v7ashyhff.png",
  "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1786966810/design_gallery/yeknmkbsb2ehg5gvfvse.png",
  "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787202305/design_gallery/ce24szkurcgvcmuduaa9.png",
  "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1786772759/design_gallery/pvgecstriuosrioe1fdj.png",
  "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787038989/design_gallery/mlk4judge1evouxdsgqh.png",
] as const;

/** Genre card backgrounds on /genres */
export const GENRE_IMAGES: Record<string, string> = {
  Trap: "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787204469/design_gallery/nzrdbsuo2u8j5bboqo20.png",
  "Hip Hop": "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787827873/design_gallery/qrmrt7oantwggdkfdpxp.jpg",
  "R&B": "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787981013/design_gallery/y63dt7pddlvg0wclmtxn.jpg",
  Soul: "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1786966728/design_gallery/smviv0esznwvdoxlsmki.png",
  "Boom Bap": "https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787827892/design_gallery/vq8tr03sz8knpob4rceq.jpg",
};
