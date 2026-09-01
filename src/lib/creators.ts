import { designImage } from "@/lib/design-images";

export type CreatorCard = {
  id: string;
  name: string;
  verified: boolean;
  beats: number;
  avatar: string;
  handle: string;
};

export function buildCreatorCards(
  creators: Array<{ id: string; name: string; verified: boolean; beats: number }>,
) {
  const avatars = [
    designImage("https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787981012/design_gallery/zljnilrx4sxy9sy6y2tr.jpg", 160),
    designImage("https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787827892/design_gallery/vq8tr03sz8knpob4rceq.jpg", 160),
    designImage("https://res.cloudinary.com/dtkmkk6k7/image/upload/v1787827898/design_gallery/lwuaub4jjcvxwmjlq1lv.jpg", 160),
  ];

  return creators.map((creator, index) => ({
    ...creator,
    avatar: avatars[index % avatars.length],
    handle: `@${creator.name.toLowerCase().replace(/\s+/g, "")}`,
  }));
}
