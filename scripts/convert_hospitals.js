const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../Data/hospital_directory.csv');
const jsonPath = path.join(__dirname, '../src/data/hospitals.json');
const outputDir = path.dirname(jsonPath);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Reading CSV file from:', csvPath);

try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split(/\r?\n/);

    if (lines.length < 2) {
        console.error('CSV file is empty or has no data rows');
        process.exit(1);
    }

    // Helper to parse CSV line with quoted fields
    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.replace(/^"|"$/g, '').trim()); // Remove surrounding quotes
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.replace(/^"|"$/g, '').trim());
        return result;
    };

    // Get headers from first line (assuming standard formatting)
    // The file view shows headers are quoted: "Sr_No","Location_Coordinates",...
    const headers = parseCSVLine(lines[0]);

    console.log('Found headers:', headers);

    // Map of header name to index
    const headerMap = {};
    headers.forEach((h, i) => headerMap[h] = i);

    const hospitals = [];
    const MAX_RECORDS = 5000; // Limit records to avoid massive bundle size if needed, or remove to load all

    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const row = parseCSVLine(lines[i]);

        // Safety check just in case parsing failed or row is malformed
        if (row.length < headers.length - 5) {
            skippedCount++;
            continue;
        }

        const coords = row[headerMap['Location_Coordinates']];
        const name = row[headerMap['Hospital_Name']];

        if (!coords || !name || coords === '0' || coords.trim() === '') {
            skippedCount++;
            continue;
        }

        const [latStr, lngStr] = coords.split(',').map(s => s.trim());
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        if (isNaN(lat) || isNaN(lng)) {
            skippedCount++;
            continue;
        }

        // Extract other fields
        const address = row[headerMap['Address_Original_First_Line']] || '';
        const city = row[headerMap['District']] || row[headerMap['Town']] || '';
        const state = row[headerMap['State']] || '';
        const pincode = row[headerMap['Pincode']] || '';
        const phone = row[headerMap['Mobile_Number']] || row[headerMap['Telephone']] || 'N/A';
        const type = row[headerMap['Hospital_Care_Type']] || row[headerMap['Hospital_Category']] || 'Hospital';
        const specialties = row[headerMap['Specialties']] || '';
        const emergencyNum = row[headerMap['Emergency_Num']];
        const hasEmergency = emergencyNum && emergencyNum !== '0';

        hospitals.push({
            id: `local-${i}`,
            name: name,
            lat: lat,
            lng: lng,
            address: `${address}, ${city}, ${state} ${pincode}`.replace(/, ,/g, ','),
            city: city,
            state: state,
            phone: phone === '0' ? 'N/A' : phone,
            type: type,
            hasEmergency: hasEmergency,
            specialties: specialties && specialties !== '0' ? specialties.split(',').map(s => s.trim()) : []
        });
    }

    console.log(`Processed ${hospitals.length} valid hospitals.`);
    console.log(`Skipped ${skippedCount} records (invalid coords or empty name).`);

    fs.writeFileSync(jsonPath, JSON.stringify(hospitals, null, 2)); // formatted for inspection
    // fs.writeFileSync(jsonPath, JSON.stringify(hospitals)); // Minified

    console.log('Successfully wrote JSON to:', jsonPath);

} catch (err) {
    console.error('Error processing CSV:', err);
}
