import { SceneTemplate } from './types';

export const SCENE_TEMPLATES: SceneTemplate[] = [
  // Category: Studio & Lifestyle
  { id: 'studio', name: 'Clean Studio', prompt: 'on a clean studio sweep with a soft, neutral background', category: 'Studio & Lifestyle' },
  { id: 'lightbox', name: 'Macro Lightbox', prompt: 'in a macro lightbox, highlighting intricate details', category: 'Studio & Lifestyle' },
  { id: 'workbench', name: 'Workbench', prompt: 'on a rustic workbench surrounded by realistic tools', category: 'Studio & Lifestyle' },
  { id: 'in-hand', name: 'In-Hand', prompt: 'being held in a human hand to show scale, with a blurred lifestyle background', category: 'Studio & Lifestyle' },
  { id: 'desk', name: 'Desk Setup', prompt: 'on a modern desk setup with a keyboard, mouse, and a small plant', category: 'Studio & Lifestyle' },
  { id: 'keychain', name: 'Lifestyle', prompt: 'attached to a backpack or set of keys in a realistic lifestyle setting', category: 'Studio & Lifestyle' },
  { id: 'shelf', name: 'Shelf Display', prompt: 'on a minimalist wooden shelf against a clean, modern wall', category: 'Studio & Lifestyle' },
  { id: 'packaging', name: 'Packaging Flat-lay', prompt: 'in a packaging flat-lay with tissue paper and a branded box', category: 'Studio & Lifestyle' },
  { id: 'retail', name: 'Retail Display', prompt: 'in a brightly lit glass retail display case with other modern objects', category: 'Studio & Lifestyle' },
  { id: 'industrial', name: 'Industrial Loft', prompt: 'on a rough concrete floor in a modern industrial loft with large windows', category: 'Studio & Lifestyle' },
  { id: 'gallery', name: 'Art Gallery', prompt: 'displayed on a clean white pedestal in a minimalist art gallery setting', category: 'Studio & Lifestyle' },
  { id: 'cozy', name: 'Cozy Rug', prompt: 'on a plush, cozy shag rug next to a steaming mug of coffee', category: 'Studio & Lifestyle' },
  { id: 'kitchen', name: 'Kitchen Counter', prompt: 'on a modern quartz kitchen countertop with blurred background elements like a faucet or plant', category: 'Studio & Lifestyle' },
  
  // Category: Nature & Organic
  { id: 'nature', name: 'Forest Floor', prompt: 'resting on a bed of moss on a forest floor with soft, dappled sunlight', category: 'Nature & Organic' },
  { id: 'beach', name: 'Sandy Beach', prompt: 'on clean, fine sand at a beach with a softly blurred ocean background', category: 'Nature & Organic' },
  { id: 'underwater', name: 'Underwater', prompt: 'submerged underwater, surrounded by faint light rays and gentle air bubbles', category: 'Nature & Organic' },
  { id: 'cloudscape', name: 'Cloudscape', prompt: 'floating on a soft, fluffy white cloud in a bright blue sky at sunset', category: 'Nature & Organic' },

  // Category: Abstract & Minimal
  { id: 'floating', name: 'Floating Abstract', prompt: 'floating mid-air against a clean, abstract geometric background', category: 'Abstract & Minimal' },
  { id: 'marble', name: 'Luxury Marble', prompt: 'on a polished white marble surface with elegant, soft shadows and a hint of gold', category: 'Abstract & Minimal' },
  { id: 'geometric', name: 'Geometric Podiums', prompt: 'on a minimalist podium with abstract geometric shapes in the background', category: 'Abstract & Minimal' },
  { id: 'crystal', name: 'Crystal Cave', prompt: 'resting inside a giant, glowing amethyst crystal geode with sparkling facets', category: 'Abstract & Minimal' },
  { id: 'powder', name: 'Color Powder', prompt: 'in the middle of a vibrant explosion of colorful powder, like a Holi festival', category: 'Abstract & Minimal' },
  { id: 'paper', name: 'Paper Art', prompt: 'in a whimsical world made entirely of layered, colorful paper art (quilling style)', category: 'Abstract & Minimal' },

  // Category: Creative & Sci-Fi
  { id: 'tech', name: 'Futuristic Grid', prompt: 'on a glowing neon grid surface in a dark, futuristic environment', category: 'Creative & Sci-Fi' },
  { id: 'hologram', name: 'Holographic Display', prompt: 'projected as a vibrant hologram in a dark, high-tech lab with digital artifacts', category: 'Creative & Sci-Fi' },
  { id: 'popart', name: 'Pop Art Explosion', prompt: 'against a bold, colorful pop-art background with comic book-style dots and graphic elements', category: 'Creative & Sci-Fi' },
  { id: 'vaporwave', name: 'Vaporwave Sunset', prompt: 'in a retro-futuristic vaporwave landscape with a neon grid floor and a pink sunset', category: 'Creative & Sci-Fi' },
  { id: 'liquid-chrome', name: 'Liquid Chrome', prompt: 'coated in shimmering liquid chrome, reflecting a futuristic cityscape', category: 'Creative & Sci-Fi' },
  { id: 'candyland', name: 'Candy Land', prompt: 'on a mountain of colorful candy sprinkles and gummy bears in a fantasy candy world', category: 'Creative & Sci-Fi' },
  { id: 'neon-noir', name: 'Neon Noir City', prompt: 'on a wet street in a neon-lit, cyberpunk city at night with Blade Runner style aesthetics', category: 'Creative & Sci-Fi' },
];

export const VEO_LOADING_MESSAGES = [
    "Warming up the digital director's chair...",
    "Choreographing pixels into motion...",
    "This can take a few minutes. Time for a coffee break?",
    "Rendering your vision, frame by frame...",
    "Almost there! Adding the final cinematic touches.",
    "The digital film is developing...",
];