const fs = require('fs');
const sharp = require('sharp');

// Function to get the average color of an image
async function getAverageColor(filepath) {

  const image = await sharp(filepath);
  const { data, info } = await image.resize(1, 1).raw().toBuffer({ resolveWithObject: true });
  const [r, g, b] = data;
  return { r, g, b };
}

// Get all files in the current directory
fs.readdir('.', async (err, files) => {
    if (err) {
        console.log(err);
        return;
    }

    // Filter for image files
    const images = files.filter(file => /\.(jpeg|jpg|png|bmp)$/i.test(file));
  
    // Map of average color to arrays of image file names
    const colorMap = {};
    // Process each image file
    const promises = images.map(async (image) => {
        const averageColor = await getAverageColor(image);
        if (!colorMap[averageColor]) {
            colorMap[averageColor] = [];
        }
        console.log('imag', image);
        colorMap[averageColor].push(image);
    });
    // wait for all the promises to resolve
    await Promise.all(promises);
    // Sort the color map by the average color value
    const sortedColors = Object.keys(colorMap).sort((a, b) => {
        const aVal = `${a.r},${a.g},${a.b}`;
        const bVal = `${b.r},${b.g},${b.b}`;

        if (aVal > bVal) return 1;
        if (aVal < bVal) return -1;
        return 0;
    });

    // Rename and move the files
    let index = 0;
    for (const color of sortedColors) {
        if (!fs.existsSync(color)) {
            fs.mkdirSync(color);
        }
        for (let i = 0; i < colorMap[color].length; i++) {
            //fs.renameSync(colorMap[color][i], `${color}/${index}.jpg`);
            index++;
        }
    }
});
