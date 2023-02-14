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
        const [r1, g1, b1] = c1.split(',', 3);
        const [r2, g2, b2] = c2.split(',', 3);

        console.log(r1, g1, b1);
        console.log(r2, g2, b2);
        // Calculating Euclidean Distance between two colors
        return (r1 - r2) * (r1 - r2) + (g1 - g2) * (g1 - g2) + (b1 - b2) * (b1 - b2);
    };


    const euclideanDistance = (c1, c2) => {
        const v1 = c1.split(',', 3);
        const v2 = c2.split(',', 3);

        var i,
            d = 0;

        for (i = 0; i < v1.length; i++) {
            d += (v1[i] - v2[i]) * (v1[i] - v2[i]);
        }
        return Math.sqrt(d);
    }

    const getClosestRGBComponentFromColor = (givenColor, colorList) => {
        let closestDistance = null;
        let closestColor = null;

        colorList.forEach(t => {
            const delta = euclideanDistance(t, givenColor);
            if (closestDistance === null || delta < closestDistance) {
                closestDistance = delta;
                closestColor = t;
            }
        });
        console.log("delta winning =>", closestDistance);
        return closestColor;
    }

    const orderPictures = (list, current) => {
        const nlist = list.filter(e => e != current);
        const closest = getClosestRGBComponentFromColor(current, nlist);
        sortedColor.push(current);
        if (nlist.length > 0) orderPictures(nlist, closest);
    }

    const renamePictures = () => {
        images.forEach((image, index) => {
            const oldPath = '.' + `/${image}`;
            const newPath = '.' + `image-${index}.jpg`;

            // Rename files
            fs.rename(
                oldPath,
                newPath,
                err => err
            );
        });
    }

    orderPictures(Object.keys(colorMap), Object.keys(colorMap)[0]);
    renamePictures();
});
