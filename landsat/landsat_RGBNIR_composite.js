//// Landsat RGB NIR Composite
// Computes a Landsat (vegetation) index time series with a yearly resolution.

//// RETURN
// Multi-Layer Image, RGBNIR


//// PARAMETERS

// aoi - FeatureCollection: area of interest
var aoi = ee.FeatureCollection("projects/ee-rssm-beyond/assets/explos/be_alb");

// Define startYear and endYear - numeric
var year = 2015

// startMonth and endMonth - numeric
// months for each year to mosaic. This can be used to e.g. only select the vegetation period
var startMonth = 6;
var endMonth = 9;


// out_prefix - string: output filename prefix
// out_crs - string: output EPSG Code
// out_scale - numeric: output spatial resolution
var out_prefix = "hai"
var out_crs = "EPSG:25832"
var out_scale = 30




// ###################################################################################
// SCRIPT START

// Conduct filename
var output = out_prefix + "-" + "mosaic" + "-" +
             year.toString() + "-" +
             ("0" + startMonth).slice(-2) + "-" +
             ("0" + endMonth).slice(-2)
print(output)







var lsMosaic = function(aoi){
  
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
  var opticalBands = image.select(['BLUE', 'GREEN', 'RED', 'NIR']).multiply(0.0000275).add(-0.2);
  // Replace the original bands with the scaled ones and apply the masks.
  return image.addBands(opticalBands, null, true)
      .updateMask(qaMask)
      .updateMask(saturationMask)
      //.unmask(-99999);
}



// Rename bands, because Bands are different for different satellites
var name_standard = ['BLUE','GREEN', 'RED', 'NIR', 'QA_PIXEL', 'QA_RADSAT']



  
  
var l4 = ee.ImageCollection("LANDSAT/LT04/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(year, year, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B1", "SR_B2", "SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .select(['BLUE','GREEN', 'RED', 'NIR'])


var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(year, year, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B1", "SR_B2", "SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .select(['BLUE','GREEN', 'RED', 'NIR'])

var l7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(year, year, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B1", "SR_B2", "SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .select(['BLUE','GREEN', 'RED', 'NIR'])



var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(year, year, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B2", "SR_B3" ,'SR_B4', 'SR_B5', 'QA_PIXEL', 'QA_RADSAT'], name_standard)
  .map(maskLcl)
  .select(['BLUE','GREEN', 'RED', 'NIR'])


var l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(year, year, 'year'))
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B2", "SR_B3", 'SR_B4', 'SR_B5', 'QA_PIXEL', 'QA_RADSAT'], name_standard)
  .map(maskLcl)


var L = l4.merge(l5).merge(l7).merge(l8).merge(l9)

L = L.sort("DATE_ACQUIRED")


L = L.reduce(ee.Reducer.median())

  
return(L)


}

var landsat_mosaic = lsMosaic(aoi)



landsat_mosaic = landsat_mosaic.clip(aoi)

// #######################################################################



print(landsat_mosaic)
Map.addLayer(landsat_mosaic.select(1), {}, "Landsat")



Export.image.toDrive({
  image: landsat_mosaic,
  region: aoi,
  scale: out_scale,
  crs: out_crs,
  fileDimensions: 6656,
  description: output
})

// SCRIPT END
// ###################################################################################



//// AUTHOR
// Marvin Ludwig


//// REFERENCES
// cloud and saturation mask adapted from:
// https://gis.stackexchange.com/questions/425159/how-to-make-a-cloud-free-composite-for-landsat-8-collection-2-surface-reflectanc






