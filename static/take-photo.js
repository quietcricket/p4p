for (var ele of document.querySelectorAll("input[type=file]")) {
    ele.onchange = function(e) {
        loadImage(
            e.target.files[0],
            canvas => {
                canvas.toBlob(b => do_upload(b), "image/jpeg", 0.85);
            },
            { maxWidth: 2000, maxHeight: 2000, orientation: true, canvas: true }
        );
    };
}

function do_upload(image_data) {
    let fd = new FormData();
    fd.append("image", image_data, "image.jpg");
    $('.icon-camera').parent().html('<h2>Uploading...</h2>');
    $.ajax({
        type: "POST",
        url: "/upload-photo",
        data: fd,
        processData: false,
        contentType: false,
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            return xhr;
        },
        complete: evt => {
            alert("Done");
            document.location.reload();
        }
    });
}
