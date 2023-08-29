import * as XLSX from "xlsx";
import {IRFile} from "../types/repositories";

export const flattenObject = (obj: any, prefix: string = ""): any => {
  if (obj instanceof Date) {
    return { [prefix]: obj.toLocaleString() };
  }

  if (typeof obj !== "object" || obj === null) {
    return { [prefix]: obj };
  }

  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." + k : k;
    Object.assign(acc, flattenObject(obj[k], pre));
    return acc;
  }, {});
};

export const saveJSONToExcelFile = (
  json: any,
  fileName: string,
  sheetName = "OCM",
  nestedFields = false,
) => {
  return new Promise((resolve, reject) => {
    try {
      const computedJson = nestedFields ? json.map((o: IRFile) => flattenObject(o)) : json;
      const worksheet = XLSX.utils.json_to_sheet(computedJson);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, fileName);
      resolve(true);
    } catch (err) {
      console.error(err);
      reject(false);
    }
  });
};

const handleDropAsync = async (e: any) => {
  e.stopPropagation();
  e.preventDefault();
  const f = e.dataTransfer.files[0];
  /* f is a File */
  const data = await f.arrayBuffer();
  /* data is an ArrayBuffer */
  const workbook = XLSX.read(data);

  /* DO SOMETHING WITH workbook HERE */
};

export const readExcelFile = async (file: File) => {
  const data = await file.arrayBuffer();
  /* data is an ArrayBuffer */
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet);
  console.log('Excel:', json)
  return json;
};

export const unflattenObject = (data: any): any => {
  const result: any = {};

  for (const key of Object.keys(data)) {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        current[keys[i]] = data[key];
      } else {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
    }
  }

  return result;
};

type Mapping = { import: string; download: string };

export const processExcelFiles = async (
    fileA: File,
    fileB: File,
    keyField: string,
    mappings: Mapping[]
) => {
  const workbookA = XLSX.read(await fileA.arrayBuffer(), { type: 'buffer' });
  const workbookB = XLSX.read(await fileB.arrayBuffer(), { type: 'buffer' });

  const sheetA = workbookA.Sheets[workbookA.SheetNames[0]];
  const sheetB = workbookB.Sheets[workbookB.SheetNames[0]];

  const dataA: any[] = XLSX.utils.sheet_to_json(sheetA);
  const dataB: any[] = XLSX.utils.sheet_to_json(sheetB);

  const matchedObjects: any[] = [];
  const unmatchedObjects: any[] = [];
  const reversalObjects: any[] = [];

  dataA.forEach(objA => {
    const correspondingObjB = dataB.find(objB => objB[keyField] === objA[keyField]);

    if (correspondingObjB) {
      const mergedObject: any = { id: objA.id};
      const reversalObject = { ...objA };
      let isChanged = false;

      mappings.forEach(mapping => {
        reversalObject[mapping.download] = correspondingObjB[mapping.import];

        // Check if the value has changed
        if (objA[mapping.download] !== correspondingObjB[mapping.import]) {
          mergedObject[mapping.download] = correspondingObjB[mapping.import];
          isChanged = true;
        }
      });

      // Always include the 'id' field
      mergedObject[keyField] = objA[keyField];

      // Only push to matchedObjects if there's any change
      if (isChanged) {
        matchedObjects.push(mergedObject);
      }

      reversalObjects.push(reversalObject);
    } else {
      unmatchedObjects.push(objA);
    }
  });

  // Create Excel for unmatched objects
  const unmatchedWorkbook = XLSX.utils.book_new();
  const unmatchedWorksheet = XLSX.utils.json_to_sheet(unmatchedObjects);
  XLSX.utils.book_append_sheet(unmatchedWorkbook, unmatchedWorksheet, 'Unmatched');
  const unmatchedExcelBuffer = XLSX.write(unmatchedWorkbook, { bookType: 'xlsx', type: 'buffer' });

  // Create Excel for matched objects
  const matchedWorkbook = XLSX.utils.book_new();
  const matchedWorksheet = XLSX.utils.json_to_sheet(matchedObjects);
  XLSX.utils.book_append_sheet(matchedWorkbook, matchedWorksheet, 'Matched');
  const matchedExcelBuffer = XLSX.write(matchedWorkbook, { bookType: 'xlsx', type: 'buffer' });

  // Create Excel for reversal objects in the same workbook as matched
  const matchedAndReversalWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(matchedAndReversalWorkbook, matchedWorksheet, 'Matched');
  const reversalWorksheet = XLSX.utils.json_to_sheet(reversalObjects);
  XLSX.utils.book_append_sheet(matchedAndReversalWorkbook, reversalWorksheet, 'Reversal');
  const matchedAndReversalExcelBuffer = XLSX.write(matchedAndReversalWorkbook, { bookType: 'xlsx', type: 'buffer' });

  return {
    unmatchedExcel: unmatchedExcelBuffer,
    matchedExcel: matchedExcelBuffer, // Return matched excel separately
    matchedAndReversalExcel: matchedAndReversalExcelBuffer,
    matchedObjects: matchedObjects,
    unmatchedObjects: unmatchedObjects,
    reversalObjects: reversalObjects
  };
};

