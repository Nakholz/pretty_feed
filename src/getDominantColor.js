import { getAverageColor } from 'fast-average-color-node';
import * as fs from 'fs';

fs.readdir('.', async (err, files) => {
    if (err) {
        console.log(err);
        return;
    }

    // Filter for image files
    const images = files.filter(file => /\.(jpeg|jpg|png|bmp)$/i.test(file));
    const sortedColor = [];

    // Map of average color to arrays of image file names
    var colorMap = {};
    // Process each image file
    const promises = images.map(async (image) => {
        const averageColor = await getAverageColor(image);
        if (!colorMap[averageColor.value]) {
            colorMap[averageColor.value] = [];
        }
        colorMap[averageColor.value].push(image);
    });
    await Promise.all(promises);

    const distanceBetweenTwoColors = (c1, c2) => {
        const [r1, g1, b1] = c1;
        const [r2, g2, b2] = c2;
        return (r1 - r2) * (r1 - r2) + (g1 - g2) * (g1 - g2) + (b1 - b2) * (b1 - b2);
    };

    const getClosestRGBComponentFromColor = (givenColor, colorList) => {
        let closestDistance = null;
        let closestColor = null;

        colorList.forEach(t => {
            const distance = distanceBetweenTwoColors(t, givenColor);
            if (closestDistance === null || distance < closestDistance) {
                closestDistance = distance;
                closestColor = t;
            }
        });
        return closestColor;
    }

    const orderPictures = (list, current) => {
        const nlist = list.filter(e => e != current);
        const closest = getClosestRGBComponentFromColor(current, nlist);
        sortedColor.push(current);
        if (nlist.length > 0) orderPictures(nlist, closest);
    }

    const renamePictures = () => {
        files.forEach((file, index) => {
            console.log(colorMap[file]);
            const oldPath = './' + `/${file}`;
          
            // lowercasing the filename
            const newPath = './' + `${index}.jpg`;
          
            // Rename file
            fs.rename(
              oldPath,
              newPath,
              err => console.log(err)
            );
          });
    }

    orderPictures(Object.keys(colorMap), Object.keys(colorMap)[0]);
    renamePictures();
});
