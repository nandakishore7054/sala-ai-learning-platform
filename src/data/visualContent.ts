export const visualContent: Record<
  string,
  {
    breakdown: string;
    tip: string;
    real: string;
    mentalMap: string[];
  }
> = {
  "HTML Document Structure": {
    breakdown:
      "Think of an HTML document like the blueprint of a house. The head section contains planning information such as the title and metadata, while the body section contains the visible rooms and content users interact with.",

    tip:
      "Imagine a house with walls, rooms, and a roof — each section represents part of an HTML document structure.",

    real:
      "A newspaper layout works similarly to an HTML page where the title acts as the header, articles become the body, and copyright information forms the footer.",

    mentalMap: [
      "HTML Document",
      "Head Section",
      "Body Section",
      "Footer",
    ],
  },

  "Working with Media": {
    breakdown:
      "Media elements in HTML are like frames in a digital gallery. Images, videos, and audio clips are placed inside containers so users can interact with multimedia content smoothly.",

    tip:
      "Visualize a photo album where each page holds images or videos arranged neatly for viewing.",

    real:
      "Streaming apps like YouTube and Spotify use media elements to display videos, songs, thumbnails, and controls.",

    mentalMap: [
      "Images",
      "Video",
      "Audio",
      "Media Tags",
    ],
  },

  "Forms and User Input": {
    breakdown:
      "HTML forms work like registration sheets where users enter information into input boxes, dropdowns, and buttons that send data to a server.",

    tip:
      "Think of filling out an online application form with text fields, checkboxes, and submit buttons.",

    real:
      "Login pages, signup forms, and payment pages all use HTML forms to collect user information.",

    mentalMap: [
      "Input Fields",
      "Labels",
      "Buttons",
      "Validation",
    ],
  },
};