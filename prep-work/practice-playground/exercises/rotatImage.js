/*
=== P
Given a N x N matrix - rotate it 90 degrees to the right

Input: matrix
Ouput: matrix rotated according to rules

Rules: Rotate 90 degrees to the right
  - for each row in order
    - the row becomes the last column in order from left to right

each layer (onion layer): startIndex = rowIndex;
            endIndex = arrLength - (rowindex + 1);


  [1,2,3],
  [4,5,6]

  [4, 1],
  [5, 2],
  [6, 3],

rotate every element to it's 90 degree counter part position
  - we only want to loop until we meet the middle of the matrix
    (because there's nothing more to rotate)
  - for (i = 0; i <= Math.floor(matrix.length / 2); i += 1)
  - for(i = startIndex; i <= endIndex; i += 1)
*/

function rotateMatrix(input) {
  const matrix = input.slice();
  const layerLimit = Math.floor(matrix.length / 2 - 1);

  for (let layerIndex = 0; layerIndex <= layerLimit; layerIndex += 1) { // outer layer loop
    const endIndex = matrix.length - (layerIndex + 2);

    const rowMax = matrix.length - layerIndex - 1;
    const colMax = endIndex + 1;

    for (let i = 0; i <= endIndex - layerIndex; i += 1) {
      // right side rotation
      let temp = matrix[layerIndex + i][colMax];
      matrix[layerIndex + i][colMax] = matrix[layerIndex][layerIndex + i];

      // bottom side rotation
      [temp, matrix[rowMax][colMax - i]] = [matrix[rowMax][colMax - i], temp];

      // left side rotation
      [temp, matrix[rowMax - i][layerIndex]]= [matrix[rowMax - i][layerIndex], temp];

      // top side rotation
      matrix[layerIndex][layerIndex + i] = temp;
    }
  }
  return matrix;
  // console.log(matrix);
}

const testInput1 = [
  [1, 2],
  [3, 4],
];

const testOutput1 = [
  [3, 1],
  [4, 2],
];

const testInput2 = [
  [1, 2, 3], // start at 0, rotate until length - 1
  [4, 5, 6],
  [7, 8, 9]
];

const testOutput2 = [
  [7, 4, 1],
  [8, 5, 2],
  [9, 6, 3]
];

const testInput3 = [
  // 6 -> row min, col min
  // 7 -> row min, col max
  // 11 -> row max, col max
  // 10 -> row max, col min
  [1, 2, 3, 4], // [outer i: 0, inner i: 0] -> [0, 0]
  [5, 6, 7, 8], // => [0, 4], [4,4], [4, 0], [0, 0]
  [9, 10, 11, 12], // => [0, 0], [0, N], [N, N], [0, 0]
  [13, 14, 15, 16], // => [layerIndex, startIndex], [layerIndex, endIndex], [endIndex,endIndex]
];

const testOutput3 = [
  [13, 9, 5, 1], // start at 0, rotate until length - 1
  [14, 10, 6, 2], // start at 1, rotate until length - 2
  [15, 11, 7, 3],
  [16, 12, 8, 4]
];

const testInput4 = [
  [2, 29, 20, 26, 16, 28],
  [12, 27, 9, 25, 13, 21],
  [32, 33, 32, 2, 28, 14],
  [13, 14, 32, 27, 22, 26],
  [33, 1, 20, 7, 21, 7],
  [4, 24, 1, 6, 32, 34]
];


const testOutputAlgo4 = [
  [4, 33, 13, 32, 12, 2],
  [24, 1, 7, 33, 27, 29],
  [1, 20, 32, 2, 14, 20],
  [6, 28, 32, 27, 25, 26],
  [32, 21, 22, 9, 13, 16],
  [34, 7, 26, 14, 21, 28]

];

const testOutput4 = [
  [4, 33, 13, 32, 12, 2],
  [24, 1, 14, 33, 27, 29],
  [1, 20, 32, 32, 9, 20],
  [6, 7, 27, 2, 25, 26],
  [32, 21, 22, 28, 13, 16],
  [34, 7, 26, 14, 21, 28]
];

console.log(rotateMatrix(testInput1));
console.log(rotateMatrix(testInput2));
console.log(rotateMatrix(testInput3));
console.log(rotateMatrix(testInput4));
