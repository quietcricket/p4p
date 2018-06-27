for (var ele of document.querySelectorAll("input[type=file]")) {
    ele.onchange = function(e) {
        loadImage(
            e.target.files[0],
            img => {
                let canvas = to_canvas(img);
                canvas.toBlob(b => do_upload(b), "image/jpeg", 0.85);
            },
            { maxWidth: 2000, maxHeight: 2000, orientation: true, canvas: true }
        );
    };
}

function to_canvas(image) {
    if (image.tagName == "IMG") {
        let imgCanvas = document.createElement("canvas");
        let imgContext = imgCanvas.getContext("2d");

        // Make sure canvas is as big as the picture
        imgCanvas.width = image.width;
        imgCanvas.height = image.height;

        // Draw image into canvas element
        imgContext.drawImage(image, 0, 0, image.width, image.height);
        return imgCanvas;
    } else {
        return image;
    }
}

function do_upload(image_data) {
    let fd = new FormData();
    fd.append("image", image_data, "image.jpg");
    $.ajax({
        type: "POST",
        url: "/upload-photo",
        data: fd,
        processData: false,
        contentType: false,
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener(
                "progress",
                evt => {
                    if (evt.lengthComputable) {
                        let percent = Math.round((evt.loaded * 100) / evt.total);
                    }
                },
                false
            );
            return xhr;
        },
        complete: evt => {
            alert("Done");
        }
    });
}
