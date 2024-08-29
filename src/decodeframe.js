import { checkForSupported } from "./checkpid";
import { sendRequestForSupportedPIds } from "./sendRequest";
import { DataHexDecoder } from "./calFUnction";

export function decodeFrame(data) {
  let arr = `${data}`.split("  ");
  if (arr[2] == "7E8") {
    let length = arr[4].split(" ")[0];
    let hexdata = arr[4].split(" ");
    const pid = hexdata[2];
    hexdata.splice(0, 3);
    hexdata.splice(length, hexdata.length - length);
    hexdata = hexdata.join("").trim();
    const decodedata = new DataHexDecoder();
    switch (pid) {
      case "00":
        const supportedPids = checkForSupported(hexdata);
        sendRequestForSupportedPIds(supportedPids);
        console.log("------>", supportedPids);
        break;

      case "01":
        break;
      case "02":
        break;
      case "03":
        break;
      case "04":
        return {
          id: "04",
          name: "Calculate Engine Load",
          value: decodedata.calcuteEngineLoad(hexdata),
        };
      case "05":
        return {
          id: "05",
          name: "Engine coolant temperature",
          value: decodedata.engineColentTemprature(hexdata),
        };
      case "06":
        return {
          id: "06",
          name: "Short term fuel trim (bank 1)",
          value: decodedata.calculate_fuel_Trim(hexdata),
        };
      case "07":
        break;
      case "08":
        break;
      case "09":
        break;
      case "0A":
        return {
          id: "0A",
          name: "Fuel pressure (gauge pressure)",
          value: decodedata.calculate_fuel_Pressure(hexdata),
        };
      case "0B":
        return {
          id: "0B",
          name: "Intake manifold absolute pressure",
          value: decodedata.intake_manifold_absolute_pressure(hexdata),
        };
      case "0C":
        return {
          id: "0C",
          name: "Engine speed",
          value: decodedata.calculateEngineSpeed(hexdata),
        };
      case "0D":
        return {
          id: "0D",
          name: "Vehicle speed",
          value: decodedata.cal_vechile_Speed(hexdata),
        };
      case "0E":
        return {
          id: "0E",
          name: "Timing advance",
          value: decodedata.cal_timing_Advance(hexdata),
        };

      case "0F":
        return {
          id: "0F",
          name: "Intake air temperature",
          value: decodedata.cal_intake_air_temp(hexdata),
        };
      case "10":
        return {
          id: "10",
          name: "Mass air flow sensor air flow rate",
          value: decodedata.cal_mass_air_flow(hexdata),
        };
      case "11":
        return {
          id: "11",
          name: "Throttle position",
          value: decodedata.cal_throttle_position(hexdata),
        };
      case "12":
        break;

      case "13":
        return {
          id: "13",
          name: "Oxygen sensors present (2 banks)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "14":
        return {
          id: "14",
          name: "Oxygen sensor 1 (voltage)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "15":
        return {
          id: "15",
          name: "Oxygen sensor 2 (voltage)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "16":
        return {
          id: "16",
          name: "Oxygen sensor 3 (voltage)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "17":
        return {
          id: "17",
          name: "Oxygen sensor 4 (voltage)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "18":
        return {
          id: "18",
          name: "Oxygen sensor 5 (voltage)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "19":
        return {
          id: "19",
          name: "Oxygen sensor 6 (voltage)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "1A":
        return {
          id: "1A",
          name: "Oxygen sensor 7 (voltage)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "1B":
        return {
          id: "1B",
          name: "Oxygen sensor 8 (voltage)",
          value: decodedata.cal_oxigen_senV(hexdata),
        };
      case "1C":
        break;
      case "1D":
        break;
      case "1E":
        break;
      case "1F":
        return {
          id: "1F",
          name: "Run time since engine start",
          value: decodedata.cal_run_time_engine_start(hexdata),
        };
      default:
        console.error(`Unknown PID: ${hexdata.slice(0, 2)}`);
        return null;
    }
  }
}
