//// Title
// Description

//// RETURN
//

//// PARAMETERS
var pois = ee.FeatureCollection("projects/ee-ludwigm6/assets/luenten/extent")
var out_prefix = "luenten"

// ###################################################################################
// SCRIPT START




var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate('2020-01-01', '2020-01-30')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  //.map(maskS2clouds);








// SCRIPT END
// ###################################################################################


//// AUTHOR
// 

//// REFERENCES
// https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED#bands
