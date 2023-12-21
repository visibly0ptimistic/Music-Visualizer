document.addEventListener('DOMContentLoaded', function() {
    var fileInput = document.getElementById('music-file-input');

    if (!fileInput) {
        console.error('File input element not found on the page.');
        return;
    }

    fileInput.addEventListener('change', function(event) {
        var file = event.target.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }

        // Directly handle the file without uploading to the server
        handleFile(file);
    });
});

function handleFile(file) {
    console.log('File selected:', file.name);
    // You can add any additional file handling here if needed
}