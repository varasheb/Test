export class HexConverter {
  static hexToDecimal(data) {
    const arr = data.trim().split(/\s+/);
    const prefix = arr.slice(0, 4).join(" ");
    const hexValues = arr.slice(4);
    const decimalValues = hexValues.map((hex) => parseInt(hex, 16));
    const result = `${prefix} ${decimalValues.join(" ")}`;

    return result;
  }

  static hexToBinary(data) {
    const arr = data.trim().split(/\s+/);
    const prefix = arr.slice(0, 4).join(" ");
    const hexValues = arr.slice(4);
    const binaryValues = hexValues.map((hex) => {
      const binary = parseInt(hex, 16).toString(2);
      return binary.padStart(8, "0");
    });
    const result = `${prefix} ${binaryValues.join(" ")}`;

    return result;
  }
}
