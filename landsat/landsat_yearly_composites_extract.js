//// Landsat yearly index compostite time series extract
// Computes a Landsat (vegetation) index time series with a yearly resolution.
// How the months of a year are aggeragted can be selected with "reducer"
// Extracts the time series for point locations

//// RETURN
// data.frame, each column is a year


//// PARAMETERS

// pois - featurecollection: points at which the time series is extracted
var pois = ee.FeatureCollection("projects/ee-ludwigm6/assets/peat/natura2000_moorwaelder")

// index - string: NDVI
var index = "NDVI"

// na_value - numeric: NA value in the output table (e.g. for cloud pixel)
var na_value = -5

// Define startYear and endYear - numeric
var startYear = 1985;
var endYear = 2023;

// startMonth and endMonth - numeric
// months for each year to aggregate. This can be used to e.g. only select the vegetation period
var startMonth = 6;
var endMonth = 9;

// choose reducer to aggregate the months (see reducer_list below)
var reducer = "10mean90"

var reducer_list = {'median': ee.Reducer.median(),
                    '10mean90': ee.Reducer.intervalMean(10,90),
                    'p90': ee.Reducer.percentile([90]),
                    'p10': ee.Reducer.percentile([10]),
                    'mean': ee.Reducer.mean()
  }

// out_prefix - string: output filename prefix
var out_prefix = "moorwaelder"



// ###################################################################################
// SCRIPT START


// Conduct filename
var output = out_prefix + "-" + index + "-" +
             startYear.toString() + "-" + endYear.toString() + "-" +
             ("0" + startMonth).slice(-2) + "-" +
             ("0" + endMonth).slice(-2) + "-" +
             reducer
print(output)



// Conduct Band names 
var bandnames = [];
for(var i = startYear; i <= endYear; i++) {
  bandnames.push(index + reducer + "_" + i)
}




var aoi = pois.geometry().bounds();
var myReducer = reducer_list[reducer]




var lsNDVI = function(aoi){
  //cloud and saturation mask adapted from
 
  
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
      //.unmask(-99999);r
}



// Rename bands, because Bands are different for different satellites
var name_standard = ['RED', 'NIR', 'QA_PIXEL', 'QA_RADSAT']


// Define function ndvi
var ndvi = function(img){
    var ndvi = img.expression('(NIR-RED)/(NIR+RED)', {
              'NIR': img.select('NIR'),
              'RED': img.select('RED')
              }).rename('NDVI').toFloat();
    ndvi = ndvi.updateMask(ndvi.gt(0)).updateMask(ndvi.lt(1))
    return img.addBands(ndvi)
  }
  
  
var l4 = ee.ImageCollection("LANDSAT/LT04/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")

var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")

var l7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(["SR_B3", "SR_B4", "QA_PIXEL", "QA_RADSAT"], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")


var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(aoi)
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .filter(ee.Filter.lt('CLOUD_COVER', 80))
  .select(['SR_B4', 'SR_B5', 'QA_PIXEL', 'QA_RADSAT'], name_standard)
  .map(maskLcl)
  .map(ndvi)
  .select("NDVI")

var l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterBounds(aoi)
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

var ndvi_ts = lsNDVI(aoi)

// #######################################################################

// Make a list of years to generate composites for.
var yearList = ee.List.sequence(startYear, endYear);

// Map over the list of years to generate a composite for each year - returns an List.
var yearCompList = yearList.map(function(year){
  // Filter the merged collection by the given year.  
  var yearCol = ndvi_ts.filter(ee.Filter.calendarRange(year, year, 'year'));
  // Reduce (composite) the images for this year.
  var yearComp = yearCol.reduce(myReducer);
  // Return the intra-annual composite - set properties just defined.
  return yearComp.set({
    'year': year
  });
});



var ndviTS = ee.ImageCollection(yearCompList)
        .toBands()
        .rename(bandnames)
        .unmask(na_value)


var ndviExt = ndviTS.sampleRegions({
  collection: pois, 
  scale: 30,
  geometries: true,
  tileScale: 2
})




Export.table.toDrive({
  collection: ndviExt,
  description: output
})



// SCRIPT END
// ###################################################################################


//// AUTHOR
// Marvin Ludwig

//// REFERENCES
// https://gis.stackexchange.com/questions/340433/making-intra-annual-image-composites-for-a-series-of-years-in-google-earth-engin
// https://gis.stackexchange.com/questions/425159/how-to-make-a-cloud-free-composite-for-landsat-8-collection-2-surface-reflectanc
