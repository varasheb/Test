function extractData(input) {
  let inputArr = input.trim().split(" ");
  let extractedData = inputArr[4].slice(6);
  return extractedData;
}

export class HexConverter {
  static hexToDecimal(hex) {
    let prefix = hex.slice(0, 16);
    let newHex = extractData(hex);
    if (!/^0x/.test(newHex)) {
      newHex = "0x" + newHex;
    }

    const result = parseInt(newHex, 16);
    return `${prefix} ${result}`;
  }

  static hexToBinary(hex) {
    let prefix = hex.slice(0, 16);

    let newHex = extractData(hex);
    if (!/^0x/.test(newHex)) {
      newHex = "0x" + newHex;
    }

    const decimal = parseInt(newHex, 16);
    const result = decimal
      .toString(2)
      .padStart(
        decimal.toString(2).length +
          ((4 - (decimal.toString(2).length % 4)) % 4),
        "0"
      );
    return `${prefix} ${result}`;
  }
}
