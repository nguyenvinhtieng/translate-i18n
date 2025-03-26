export function convertJsonToKeyValueArray(json: string | object) {
  try {
    let inputJson = json;
    if (typeof inputJson === "string") {
      inputJson = JSON.parse(inputJson);
    }

    const keys: string[] = [];
    const values: string[] = [];

    const traverse = (obj: object, parentKey = "") => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof value === "object" && value !== null) {
          traverse(value, fullKey);
        } else {
          keys.push(fullKey);
          values.push(value);
        }
      }
    };

    traverse(inputJson as object);

    return { keys, values };
  } catch (error) {
    return null;
  }
}

export function convertKeyValueArrayToJson(
  keys: string[],
  values: string[]
): object | null {
  try {
    const result: any = {};
    keys.forEach((key, index) => {
      const value = values[index];
      const keyParts = key.split(".");

      let current = result;
      keyParts.forEach((part, i) => {
        if (i === keyParts.length - 1) {
          current[part] = value;
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });

    return result;
  } catch (error) {
    console.error("Error reverting key-value array to JSON:", error);
    return null;
  }
}

export function isJsonString(json: string) {
  try {
    JSON.parse(json);
    return true;
  } catch (error) {
    return false;
  }
}
