import * as fs from "fs";
import * as path from "path";

const CONFIG_FILENAME = "config.json";

// function to import config.json or create it if it doesn't exists
export const config = (() => {
  if (fs.existsSync(path.join(__dirname, "..", CONFIG_FILENAME))) {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", CONFIG_FILENAME), "utf8")
    );
  } else {
    fs.writeFileSync(
      path.join(__dirname, "..", CONFIG_FILENAME),
      JSON.stringify({}, null, 2)
    );
    return {};
  }
})();

// function to create config.json if it doesn't exists
export const createConfig = () => {
  if (!fs.existsSync(path.join(__dirname, "..", CONFIG_FILENAME))) {
    fs.writeFileSync(
      path.join(__dirname, "..", CONFIG_FILENAME),
      JSON.stringify(config, null, 2)
    );
  }
};

// Find config variable and save it or replace it. Add the config variable if it doesnt exists. The config variable is saved in config.json file. Returns this config variable if successful, otherwise returns null.
export const saveToConfig = (key: keyof typeof config, value: string) => {
  createConfig();
  config[key] = value;
  try {
    fs.writeFileSync(
      path.join(__dirname, "..", CONFIG_FILENAME),
      JSON.stringify(config, null, 2)
    );
    return config[key];
  } catch (err) {
    throw new Error(`Unable to save ${value} to config.json`);
  }
};

export const getFromConfig = (key: keyof typeof config) => {
  createConfig();
  if (config[key]) return config[key];
  // throw new Error(`Key "${key as string}" not found`);
  return "";
};
