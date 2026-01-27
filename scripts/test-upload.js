const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a dummy file
const filePath = path.join(__dirname, 'test-file.txt');
fs.writeFileSync(filePath, 'Hello World Content');

async function testUpload() {
    const form = new FormData();
    form.append('nombreGrupo', 'Test Group');
    form.append('file', fs.createReadStream(filePath));

    try {
        const response = await axios.post('http://localhost:3002/api/file-groups/upload', form, {
            headers: {
                'Content-Type': 'multipart/form-data', // BUG: Missing boundary
            },
            validateStatus: () => true // Resolve all statuses
        });

        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testUpload();
