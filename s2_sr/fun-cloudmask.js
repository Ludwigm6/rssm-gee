// Functions for the GEE collection copernicus/S2_SR
// author: Jonathan Bahlmann
// input: one image
// --> map over collection


export.S2_SR_maskclouds = function (image) {
  var scl = image.select('SCL');
  var wantedPixels = scl.gt(3).and(scl.lt(7)).or(scl.eq(1)).or(scl.eq(2));
  return image.updateMask(wantedPixels)
}


