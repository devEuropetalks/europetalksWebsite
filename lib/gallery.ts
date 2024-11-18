import { GalleryEvent } from "@/types/gallery";
import { isValid, parse } from "date-fns";
import fs from "fs";
import path from "path";

function parseEventFolder(folderName: string): {
  name: string;
  location: string;
  date: Date;
} {
  const [name, location, dateStr] = folderName.split("_");

  if (!name || !location || !dateStr) {
    throw new Error(`Invalid folder name format: ${folderName}`);
  }

  let date: Date;
  try {
    const monthYearDate = parse(dateStr, "MMMM yyyy", new Date());

    if (isValid(monthYearDate)) {
      date = monthYearDate;
    } else {
      const yearNum = parseInt(dateStr);
      if (isNaN(yearNum)) {
        throw new Error(`Invalid date format: ${dateStr}`);
      }
      date = new Date(yearNum, 0, 1);
    }
  } catch (err) {
    console.error(`Error parsing date from folder: ${folderName}`, err);
    date = new Date();
  }

  return {
    name: name.replace(/-/g, " "),
    location: location,
    date: date,
  };
}

export async function getGalleryEvents(): Promise<GalleryEvent[]> {
  try {
    const galleryPath = path.join(process.cwd(), "public", "images", "Gallery");
    const events = fs.readdirSync(galleryPath);

    return events
      .filter((event) => {
        const eventPath = path.join(galleryPath, event);
        return fs.statSync(eventPath).isDirectory();
      })
      .map((event) => {
        const eventPath = path.join(galleryPath, event);
        const images = fs
          .readdirSync(eventPath)
          .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
          .map((file) => `/images/Gallery/${event}/${file}`);

        const eventInfo = parseEventFolder(event);

        return {
          id: event, // Use the folder name as id
          name: eventInfo.name,
          location: eventInfo.location,
          date: eventInfo.date,
          images,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error reading gallery directory:", error);
    return [];
  }
}
