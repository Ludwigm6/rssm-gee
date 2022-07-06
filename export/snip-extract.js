// snippet: extract spectral features at specific points (or polygons)
// loops over the images of an image collection and writes out the extracted dataframe as a csv



// To 

var SAMPLEDPOINTS = COLLECTION.map(function (image) {
  return image.sampleRegions({
  collection: SAMPLES,
  geometries: true,
  scale: 10});
}).flatten();


Export.table.toDrive(SAMPLEDPOINTS);