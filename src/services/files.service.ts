import * as XLSX from "xlsx";

export const saveJSONToExcelFile = (
  json: any,
  fileName: string,
  sheetName = "OCM"
) => {
  return new Promise((resolve, reject) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(json);
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

export const getJSONFromExcelFile = (filePath: string) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      resolve(json);
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
