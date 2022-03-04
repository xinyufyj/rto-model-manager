import { v4 as uuidv4 } from 'uuid';

export function getUUID() {
  return uuidv4()
}

export const CategoryOptions = ['Aspen Hysys Model', 'Aspen Plus Model', 'Dll File Model']

export const CategoryDriverMap = {
  'Aspen Hysys Model' : 'AspenHsysRunner.exe',
  'Aspen Plus Model': 'AspenPlusRunner.py',
  'Dll File Model': 'DllFileRunner.exe'
}

export const CategoryComponentMap = {
  'Aspen Hysys Model' : 'AspenHysysModel',
  'Aspen Plus Model': 'AspenPlusModel',
  'Dll File Model': 'DllModel'
}

export function deepCopy(obj) {
  if (obj == null || typeof obj !== "object") return obj;
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] =
        typeof obj[key] === "object" ? deepCopy(obj[key]) : obj[key];
    }
  }
  return newObj;
}