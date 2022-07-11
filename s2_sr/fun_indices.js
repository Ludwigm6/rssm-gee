// author: Edgar 



exports.s2_indices = function(img) {
  var ndvi = img.expression('(NIR-RED)/(NIR+RED)', {
              'NIR': img.select('B8'),
              'RED': img.select('B4')
              }).multiply(10000).toInt16().rename('NDVI');

  var ndwi = img.expression('(NIR-SWIR)/(NIR+SWIR)', {
              'NIR': img.select('B8'),
              'SWIR': img.select('B11')
              }).multiply(10000).toInt16().rename('NDWI');
              
  var evi = img.expression(
      '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
      'NIR': img.select('B8'),
      'RED': img.select('B4'),
      'BLUE': img.select('B2')}).multiply(10000).toInt16().rename('EVI');
  
  var savi = img.expression(
      '1.5 * ((NIR - RED) / (NIR + RED + 0.5))', {
      'NIR': img.select('B8'),
      'RED': img.select('B4')}).multiply(10000).toInt16().rename('SAVI');
      
  var gcvi = img.expression(
      '(NIR / GREEN) - 1', {
      'NIR': img.select('B8'),
      'GREEN': img.select('B3')}).multiply(10000).toInt16().rename('GCVI');

  return img.addBands(ndvi).addBands(ndwi).addBands(evi).addBands(savi).addBands(gcvi);

  };