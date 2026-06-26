const XLSX = require('xlsx');

const workbook = XLSX.readFile('./src/ghana_hubs_network_members.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

console.log(rawJson[59]); // Row 61 (1-indexed header, 0-indexed array)
