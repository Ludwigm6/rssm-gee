//// Title
// Description

//// RETURN
//

//// PARAMETERS
var pois = ee.FeatureCollection("projects/ee-ludwigm6/assets/luenten/extent")
var out_prefix = "luenten"

var index = "NDVI"


// na_value - numeric: NA value in the output table (e.g. for cloud pixel)
var na_value = -5

// Define start and end years and month
var startYear = 1985;
var endYear = 2023;
var startMonth = 1;
var endMonth = 12;


// ###################################################################################
// SCRIPT START



// Conduct filename
var output = out_prefix + "-" + index + "-" +
             startYear.toString() + "-" + endYear.toString() + "-" +
             ("0" + startMonth).slice(-2) + "-" +
             ("0" + endMonth).slice(-2)
print(output)


var aoi = pois.geometry().bounds();


// NDVI function
var ndvi = function(img){
    var ndvi = img.expression('(NIR-RED)/(NIR+RED)', {
              'NIR': img.select('B8'),
              'RED': img.select('B4')
              }).rename("NDVI").toFloat();
    ndvi = ndvi.updateMask(ndvi.gt(0)).updateMask(ndvi.lt(1))
    return img.addBands(ndvi)
  }


var s2cloudmask = function(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}


// cloud masking


var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                    .filterBounds(aoi)
                    .filter(ee.Filter.calendarRange(startYear, endYear, 'year'))
                    .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',80))
                    .map(s2cloudmask)
                    .map(ndvi)
                    .select("NDVI")











print(dataset)

Export.image.toDrive({
  image: dataset,
  folder: "gee",
  maxPixels: 1000000000,
  scale: 10,
  description: output
})






// SCRIPT END
// ###################################################################################


//// AUTHOR
// Marvin Ludwig

//// REFERENCES
// https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED#bands
