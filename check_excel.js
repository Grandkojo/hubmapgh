const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('./src/ghana_hubs_network_members.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

let invalidCount = 0;
let errors = {};
rawJson.forEach((row, i) => {
    const name = row['Hub Bio'] || row['Hub Name'] || '';
    const description = row['What you do (Bio)'] || row['Description'] || '';
    const city = row['Which city/town is your Hub located'] || row['City'] || '';
    
    if (!name || !city || !description) {
        invalidCount++;
        if(invalidCount <= 5) {
            console.log(`Row ${i + 2} failed. Name: "${name}", City: "${city}", Desc: "${description}"`);
            console.log('Row Keys:', Object.keys(row));
        }
    }
});
console.log(`Total invalid: ${invalidCount}`);
