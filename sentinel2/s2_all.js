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




var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate('2020-01-01', '2020-01-30')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',80))
                  //.map(maskS2clouds);







// Conduct filename
var output = out_prefix + "-" + index + "-" +
             startYear.toString() + "-" + endYear.toString() + "-" +
             ("0" + startMonth).slice(-2) + "-" +
             ("0" + endMonth).slice(-2)
print(output)







// SCRIPT END
// ###################################################################################


//// AUTHOR
// 

//// REFERENCES
// https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED#bands
