// Sentinel 2 L2A Downloader
// Just use the Product ID that is specified e.g. here https://scihub.copernicus.eu/dhus/#/home


// User Input:
var id_l2a = "S2A_MSIL2A_20191002T180151_N0213_R041_T12SXJ_20191004T091232"


//------------------------------
var s2_l2a = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filter(ee.Filter.eq("PRODUCT_ID", id_l2a))
  .select('B.*')

var s2image = s2_l2a.toBands().toUint16()

print("Sentinel 2 L2A Tile to download:", s2_l2a)

Export.image.toDrive({
  image: s2image,
  scale: 10,
  maxPixels: 500000000,
  folder: "gee",
  description: "Sentinel2_Tile_Download",
  fileNamePrefix: id_l2a
})



