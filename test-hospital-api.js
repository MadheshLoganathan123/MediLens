// Test script for Data.gov.in Hospital API
const API_KEY = '9ixZh7jDeut1AoCAil0Ag5qKph2xpVIofjrr55Jv';
// Changing base URL to api.data.gov.in
const API_URL = 'https://api.data.gov.in/resource/98fa254e-c5f8-4910-a19b-4828939b477d';

async function testHospitalAPI() {
    try {
        console.log('Testing Data.gov.in Hospital API...');
        console.log('Endpoint:', API_URL);

        // Construct URL with parameters
        const params = new URLSearchParams({
            'api-key': API_KEY,
            'format': 'json',
            'limit': '10',
            'offset': '0'
        });

        const url = `${API_URL}?${params.toString()}`;
        console.log('Full URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        console.log('Response Status:', response.status, response.statusText);

        if (!response.ok) {
            // Try to read text if json fails
            const text = await response.text();
            console.log('Response Body:', text.substring(0, 500));
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            console.log('Received HTML instead of JSON. Preview:', text.substring(0, 200));
            throw new Error('Received HTML response');
        }

        const data = await response.json();
        console.log('\n✅ API Response received successfully!');
        console.log('Response structure:', {
            type: Array.isArray(data) ? 'Array' : 'Object',
            keys: Object.keys(data),
            recordCount: data.records?.length || data.length || 'unknown'
        });

        if (data.records && Array.isArray(data.records) && data.records.length > 0) {
            console.log('\nFirst hospital record keys:', Object.keys(data.records[0]));
            console.log('Sample Record:', JSON.stringify(data.records[0], null, 2));
        } else if (Array.isArray(data) && data.length > 0) {
            console.log('\nFirst hospital record keys:', Object.keys(data[0]));
            console.log('Sample Record:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('No records found in response.');
            console.log('Full JSON:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('\n❌ API Test Failed:');
        console.error(error);
    }
}

testHospitalAPI();
