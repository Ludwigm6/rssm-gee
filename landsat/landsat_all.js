//// Landsat index time series extract
// Computes a Landsat (vegetation) index time series
// Extracts the time series for point locations

//// RETURN
// data.frame, each column is a landsat scene
// IMPORTANT: the columns are not in temporal order!

//// PARAMETERS

// pois - feature collection: points to extract the time series
var pois = ee.FeatureCollection("projects/ee-ludwigm6/assets/luenten/extent")
var out_prefix = "luenten"
// Define index: NDVI

var index = "NDVI"


// na_value - numeric: NA value in the output table (e.g. for cloud pixel)
var na_value = -5

// Define start and end years and month
var startYear = 2022;
var endYear = 2022;
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


var lsNDVI = function(aoi){
  //cloud and saturation mask adapted from
  //https://gis.stackexchange.com/questions/425159/how-to-make-a-cloud-free-composite-for-landsat-8-collection-2-surface-reflectanc
  // by Marvin Ludwig, Laura Giese
  
  function maskLcl(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Unused
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  // Bit 5 - Snow
  //var snowBit = 1 << 6;
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('111111', 2)).eq(0)
  //  .and(image.select('QA_PIXEL').bitwiseAnd(snowBit).eq(0));
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Apply the scaling factors to the appropriate bands.
  var opticalBands = image.select(['RED', 'NIR']).multiply(0.0000275).add(-0.2);
  // Replace the original bands with the scaled ones and apply the masks.
  return image.addBands(opticalBands, null, true)
      .updateMask(qaMask)
      .updateMask(saturationMask)
      //.unmask(-99999);
}



// Rename bands, because Bands are different for different satellites
var name_standard = ['RED', 'NIR', 'QA_PIXEL', 'QA_RADSAT']


// Define function ndvi
var ndvi = function(img){
  
  
    var ndvi = img.expression('(NIR-RED)/(NIR+RED)', {
              'NIR': img.select('NIR'),
              'RED': img.select('RED')
              }).rename("NDVI").toFloat();
    ndvi = ndvi.updateMask(ndvi.gt(0)).updateMask(ndvi.lt(1))
    return img.addBands(ndvi)
  }
  
  
var l4 = ee.ImageCollection("LANDSAT/LT04/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startYear, endYear, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")

var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startYear, endYear, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")

var l7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startYear, endYear, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")


var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startYear, endYear, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(['SR_B4', 'SR_B5', 'QA_PIXEL', 'QA_RADSAT'], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")

var l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startYear, endYear, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(['SR_B4', 'SR_B5', 'QA_PIXEL', 'QA_RADSAT'], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")

var L = l4.merge(l5).merge(l7).merge(l8).merge(l9)





L = L.sort("DATE_ACQUIRED")



return(L)


}



// ndvi_ts is a ImageCollection. But without common properties after the merge
var ndvi_ts = lsNDVI(aoi)

// convert to multi-band image
var ndviTS = ndvi_ts
        .toBands()
        .unmask(na_value)
        
// remove merge rename prefixes
ndviTS = ndviTS.regexpRename("^.*L", "L")





// DEBUG Results

// print("raw image collection:", ndvi_ts)
// print("Multiband Image:", ndviTS)
// print("Export:", ndviExt)



Export.image.toDrive({
  collection: ndvTS,
  folder: "gee",
  scale: 30,
  description: output
})







