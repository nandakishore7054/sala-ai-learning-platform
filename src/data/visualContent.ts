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

  "The CSS Box Model": {
    breakdown:
      "A 3D perspective diagram of a box showing four concentric layers: Content (blue), Padding (green), Border (yellow), and Margin (orange).",

    tip:
      "Imagine a house with walls, a margin around the yard, and a border fence to remember the CSS Box Model components.",

    real:
      "Think of a picture frame, where the photo is the content area, the frame's border is the border, the matting around the photo is the padding, and the space between the frame and the wall is the margin.",

    mentalMap: [
      "CSS Box Model",
      "Content",
      "Padding",
      "Border",
      "Margin",
    ],
  },

  "Selectors and Specificity": {
    breakdown:
      "A pyramid chart showing 'Global Selectors' at the base, 'Classes' in the middle, and 'IDs' at the top, illustrating the weight of each.",

    tip:
      "Imagine a big box with labels, where each label has a priority, to remember CSS selectors and specificity.",

    real:
      "Think of a library with thousands of books, where each book has a unique title, author and genre, and you need to find a specific book. CSS selectors work similarly by targeting specific webpage elements.",

    mentalMap: [
      "Selectors",
      "Classes",
      "IDs",
      "Specificity",
    ],
  },

  "Colors and Typography": {
    breakdown:
      "A side-by-side comparison of a serif and sans-serif font, with labels highlighting ascenders, descenders, and line-height spacing.",

    tip:
      "Think of colors as flavors and typography as the plate presentation.",

    real:
      "Imagine a beautifully designed restaurant menu, where colors and typography work together to create an appealing and easy-to-read experience.",

    mentalMap: [
      "Colors",
      "Typography",
      "Fonts",
      "Line Height",
      "HEX Codes",
    ],
  },

  "Visualizing Memory and Linear Arrays": {
    breakdown:
      "A horizontal grid of 10 boxes representing memory addresses 100-109, with color-coded blocks indicating stored integers and an arrow pointing to index 3.",

    tip:
      "Imagine a library with books on shelves, where each book represents a piece of data and the shelf is like a linear array.",

    real:
      "Think of a row of houses on a street, where each house is like a memory location and the street is like a linear array, with each house having a unique address.",

    mentalMap: [
      "Memory",
      "Linear Arrays",
      "Indexes",
      "Contiguous Storage",
    ],
  },

  "Dynamic Arrays and Resizing": {
    breakdown:
      "A flowchart showing an array of size 4 filling up, followed by an arrow pointing to a new array of size 8 where the original 4 items are copied.",

    tip:
      "Imagine a dynamic array as a stretchy box that can grow or shrink as you add or remove items.",

    real:
      "Think of a dynamic array like a shelf in a library where books are arranged. When a new book is added, the librarian might need to move the books to a larger shelf to accommodate it.",

    mentalMap: [
      "Dynamic Arrays",
      "Resizing",
      "Capacity",
      "Copying Data",
    ],
  },

  "Multidimensional Arrays (Matrices)": {
    breakdown:
      "A 3x3 grid where each cell is labeled with coordinates (0,0) through (2,2), showing how row-major order flattens it into a single line.",

    tip:
      "Imagine a library with multiple bookshelves, where each shelf represents a dimension.",

    real:
      "A spreadsheet with rows and columns is similar to a 2D array, where each cell is like a box that can hold a value.",

    mentalMap: [
      "2D Arrays",
      "Rows",
      "Columns",
      "Matrices",
    ],
  },
};