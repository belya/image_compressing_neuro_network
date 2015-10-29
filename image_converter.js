ImageToVectorsConverter = {

  maxChannelValue: 255,
  channel: 1,
  CHANNELS_NUMBER: 4,
  
  init: function(maxChannelValue, channel, subWidth, subHeight) {
    this.maxChannelValue = maxChannelValue;
    this.channel = channel;
    this.subWidth = subWidth;
    this.subHeight = subHeight;
  },

  convert: function(canvas, width, height) {
    return this.convertImageDataArrayToVectors(this.getImageData(canvas, width, height));
  },

  getImageData: function(canvas, width, height) {
    return document.getElementById(canvas).getContext('2d').getImageData(0, 0, width, height);
  },

  convertChannelMatrixToVector: function(matrix) {
    var vector = [];
    for(var i = 0; i < matrix.length; i++) {
      var row = matrix[i]
      for(var j = 0; j < row.length; j++)
        vector.push(this.convertChannelToCoefficient(row[j]));
    }
    return vector;
  },

  convertImageDataArrayToChannelMatrix: function(imageData) {
    var matrix = [[]];
    for(var i = this.channel; i < imageData.data.length; i+= this.CHANNELS_NUMBER) {
      if (matrix[matrix.length - 1].length == imageData.width)
        matrix.push([])
      matrix[matrix.length - 1].push(imageData.data[i]);
    }
    return matrix;
  },

  convertChannelMatrixToVectors: function(matrix) {
    var k = this.subWidth;
    var p = this.subHeight;
    var vectors = [];
    for(var i = 0; i < matrix.length; i++)
      for(var j = 0; j < matrix[i].length; j++) {
        var newI = (i - i % k) / k;
        var newJ = (j - j % p) / p; 
        var newSize = (matrix[i].length - matrix[i].length%p)/p
        var index = newI * newSize + newJ;
        if (!vectors[index]) vectors[index] = [];
        vectors[index].push(this.convertChannelToCoefficient(matrix[i][j]));
        console.log("Stats: " + i + " " + j + " " + index);
      }
    return vectors;
  },

  convertImageDataArrayToVectors: function(imageData) {
    var channelMatrix = this.convertImageDataArrayToChannelMatrix(imageData, 0);
    var vectors = this.convertChannelMatrixToVectors(channelMatrix);
    return vectors;
  },
  //TODO remove width and height
  //TODO There is an error!
  restore: function(canvas, vectors, width, height) {
    var context = document.getElementById(canvas).getContext('2d');
    var imageData = context.createImageData(width, height);
    var k = this.subWidth;
    var p = this.subHeight;
    for(var n = 0; n < vectors.length; n++) { 
      for(var o = 0; o < vectors[n].length; o++) {
        var size = (width - width%p)/p;
        var i = (n - n%size)/size*k + (o - o%p)/p
        var j = n%size*k + o%p;
        var index = this.CHANNELS_NUMBER*(i*height + j);
        imageData.data[index + 3] = 255
        imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = this.convertCoefficientToChannel(vectors[n][o]);
      }
    }
    context.putImageData(imageData, 0, 0);
  },

  convertChannelToCoefficient: function(channel) {
    return 2*channel / this.maxChannelValue - 1
  },

  convertCoefficientToChannel: function(coefficient) {
    if (coefficient > 1) return this.maxChannelValue;
    if (coefficient < -1) return 0; 
    return this.maxChannelValue*(coefficient + 1)/2
  },

}