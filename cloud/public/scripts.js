function showUploadPage() {
    document.getElementById('upload-page').style.display = 'block';
    document.getElementById('download-page').style.display = 'none';
}

function showDownloadPage() {
    document.getElementById('upload-page').style.display = 'none';
    document.getElementById('download-page').style.display = 'block';
}

function uploadFormData() {
    var formData = new FormData();

    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');
    var fileInput = document.getElementById('file');

    formData.append('username', usernameInput.value);
    formData.append('password', passwordInput.value);
    formData.append('file', fileInput.files[0], );

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log(xhr.responseText);

                window.location.href = 'https://5.35.29.142:3000';
            } else {
                console.error('Произошла ошибка:', xhr.status);
            }
        }
    };

    xhr.open('POST', '/upload', true);

    xhr.send(formData);
}

document.querySelector('input[type="submit"]').addEventListener('click', function(event) {
    event.preventDefault();

    uploadFormData();
});
