export class DataHexDecoder {
  calculateEngineSpeed(hexData) {
    let hexA = hexData.slice(0, 2);
    let hexB = hexData.slice(2, 4);

    let A = parseInt(hexA, 16);
    let B = parseInt(hexB, 16);

    let result = (256 * A + B) / 4;

    return result;
  }

  calcuteEngineLoad(hexdata) {
    let hexA = hexdata.slice(0, 2);
    let A = parseInt(hexA, 16);

    let result = A / 2.55;

    console.log('Engine Load in percentage:', result + ' %');
    return result;
  }

  engineColentTemprature(hexData) {
    let hexA = hexData.slice(0, 2);

    let A = parseInt(hexA, 16);
    let result = A - 40;

    console.log('Engine coolant temperature: ' + result + '°C');
    return result;
  }

  calculate_fuel_Trim(hexData) {
    let hexA = hexData.slice(0, 2);
    let A = parseInt(hexA, 16);

    let result = A / 1.28 - 100;

    console.log('fuel_Trim: ' + result + ' %');
    return result;
  }

  calculate_fuel_Pressure(hexData) {
    let hexA = hexData.slice(0, 2);
    let A = parseInt(hexA, 16);

    let result = 3 * A;

    console.log('fuel_Pressure : ' + result + ' kpa');
    return result;
  }

  intake_manifold_absolute_pressure(hexData) {
    let hexA = hexData.slice(0, 2);
    let A = parseInt(hexA, 16);

    let result = 1 * A;

    console.log('intake_manifold_absolute_pressure : ' + result + ' kpa');
    return result;
  }

  cal_vechile_Speed(hexData) {
    let hexA = hexData.slice(0, 2);
    let A = parseInt(hexA, 16);
    let result = 1 * A;

    console.log('Vechile speed in Km/h:', result + ' Km/h');
    return result;
  }

  cal_timing_Advance(hexData) {
    let hexA = hexData.slice(0, 2);

    let A = parseInt(hexA, 16);

    let result = A / 2 - 64;

    console.log('Timing Advance in deg:', result + ' deg');
    return result;
  }

  cal_intake_air_temp(hexData) {
    let hexA = hexData.slice(0, 2);

    let A = parseInt(hexA, 16);

    let result = A - 40;

    console.log('Intake AIr Temp in degC:', result + ' degC');
    return result;
  }

  cal_mass_air_flow(hexData) {
    let hexA = hexData.slice(0, 2);
    let hexB = hexData.slice(2, 4);

    let A = parseInt(hexA, 16);
    let B = parseInt(hexB, 16);

    let result = (256 * A + B) / 100;

    console.log('mass air flow in g/s:', result + ' g/s');
    return result;
  }

  cal_throttle_position(hexData) {
    let hexA = hexData.slice(0, 2);

    let A = parseInt(hexA, 16);

    let result = (100 / 255) * A;

    console.log('throttle position in %:', result + ' %');
    return result;
  }

  cal_oxigen_senV(hexData) {
    let hexA = hexData.slice(0, 2);

    let A = parseInt(hexA, 16);

    let result = A / 200;

    console.log('oxigen sensor voltage in V:', result + ' V');
    return result;
  }

  cal_run_time_engine_start(hexData) {
    let hexA = hexData.slice(0, 2);
    let hexB = hexData.slice(2, 4);

    let A = parseInt(hexA, 16);
    let B = parseInt(hexB, 16);

    let result = 256 * A + B;

    console.log('runtime since engine start:', result + ' seconds');
    return result;
  }
}
