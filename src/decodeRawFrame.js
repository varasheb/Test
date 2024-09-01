export class HexConverter {
  static hexToDecimal(hex) {
    if (!/^0x/.test(hex)) {
      hex = "0x" + hex;
    }
    return parseInt(hex, 16);
  }

  static hexToBinary(hex) {
    if (!/^0x/.test(hex)) {
      hex = "0x" + hex;
    }

    const decimal = parseInt(hex, 16);
    return decimal
      .toString(2)
      .padStart(
        decimal.toString(2).length +
          ((4 - (decimal.toString(2).length % 4)) % 4),
        "0"
      );
  }
}
