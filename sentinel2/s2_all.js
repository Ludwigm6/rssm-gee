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


var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                    .filterBounds(aoi)
                    .filter(ee.Filter.calendarRange(startYear, endYear, 'year'))
                    .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',80))
                  //.map(maskS2clouds);



var ndviTS = dataset.map(ndvi)




Export.image.toDrive({
  image: ndviTS,
  folder: "gee",
  maxPixels: 1000000000,
  scale: 30,
  description: output
})






// SCRIPT END
// ###################################################################################


//// AUTHOR
// Marvin Ludwig

//// REFERENCES
// https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED#bands
