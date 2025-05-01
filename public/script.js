const socket = io();

// Handle sending file
function sendFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please choose a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.filename) {
                socket.emit('file-shared', data.filename);
                alert('File uploaded and shared!');
                fileInput.value = ""; // Clear input
            } else {
                alert('Error uploading file.');
            }
        })
        .catch(err => {
            console.error('Upload error:', err);
            alert('An error occurred while uploading.');
        });
}

// Receive shared file
socket.on('receive-file', (filename) => {
    const received = document.getElementById('received');
    const fileUrl = `/uploads/${filename}`;
    const fileExtension = filename.split('.').pop().toLowerCase();

    const container = document.createElement('div');
    container.className = 'file-container';

    let preview;

    // Image preview
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        preview = document.createElement('img');
        preview.src = fileUrl;
        preview.alt = filename;
        preview.className = 'file-thumb';
    }
    // PDF preview
    else if (fileExtension === 'pdf') {
        preview = document.createElement('img');
        preview.src = '/pdf-icon.png';
        preview.alt = 'PDF';
        preview.className = 'file-icon';
    }
    // Other file type
    else {
        preview = document.createElement('img');
        preview.src = '/file-icon.png';
        preview.alt = 'File';
        preview.className = 'file-icon';
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.innerText = 'Download';
    downloadLink.download = filename;
    downloadLink.className = 'download-btn';

    container.appendChild(preview);
    container.appendChild(downloadLink);
    received.appendChild(container);
});
