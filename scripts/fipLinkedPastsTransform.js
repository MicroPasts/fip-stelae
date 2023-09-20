import fs from 'fs';
import Papa from 'papaparse';

const getPlace = (museumLon,museumLat) => {
    console.log(museumLon)
    console.log(museumLat)
    return {
        type: 'Point',
        coordinates: [ parseFloat(museumLon), parseFloat(museumLat) ]
    };

}

const buildFeature = (record, place, museumLon, museumLat) => {
    if (!place?.trim() && !museumLon?.trim())
        return;

    return {
        ...record,
       // '@id': nanoid(),
        properties: {
            ...record.properties,
            place: place.trim(),
            // relation
        },
        geometry: {
            ...getPlace(museumLon,museumLat)
        }
    }
}


const recordsCsv = fs.readFileSync('../rawData/FIP-stelae.csv', { encoding: 'utf8' });
const records = Papa.parse(recordsCsv, { header: true });
const features = records.data.reduce((all, row) => {
    console.log(row)

    const title = row['title'];
    const objectType = row['objectType'];
    const country = row['holdingCountry'];
    const institution  = row['holdingMuseum'];
    const museumLat = row['museumLat'];
    const museumLon = row['museumLon'];
    const city = row['holdingCity'];
    const accessionNumber = row['accessionNumber'];
    const fipNumber = row['fipCatalogueNumber'];
    const findSpot = row['findspot'];
    const Link = institution + '-' + city + '' + fipNumber;
    const place = institution + ', ' + city;
    console.log(place)
    const peripleoRecord = {
       '@id': fipNumber.trim() + '+' + city.trim(),
        type: 'Feature',
        properties: {
            title: title,
            source: Link,
            objectType: objectType,
            institution: institution,
            city: city,
            country: country,
            findspot: findSpot,
            accessionNumber: accessionNumber,
            catalogueNumber: fipNumber
        }
    };
    console.log(peripleoRecord)
    const features = Link?.trim() ? [
        buildFeature(peripleoRecord, place, museumLon, museumLat)
    ].filter(rec => rec) : [];

    return [...all, ...features];
}, []);

const fc = {
    type: 'FeatureCollection',
    features
};

fs.writeFileSync('../docs/data/fipLP.json', JSON.stringify(fc, null, 2), 'utf8');
