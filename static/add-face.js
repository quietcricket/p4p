function name_changed(ele) {
    var val = ele.value.trim();
    if (val.length > 2) {
        $(".icon-camera").removeClass("d-none");
    } else {
        $(".icon-camera").addClass("d-none");
    }
}

for (var ele of document.querySelectorAll("input[type=file]")) {
    ele.onchange = function(e) {
        loadImage(
            e.target.files[0],
            canvas => {
                canvas.toBlob(b => do_upload(b, name), "image/jpeg", 0.85);
            },
            { maxWidth: 2000, maxHeight: 2000, orientation: true, canvas: true }
        );
    };
}

function do_upload(image_data) {
    let fd = new FormData();
    fd.set("name", $("#name").val().trim());
    fd.set("image", image_data, "image.jpg");
    $(".icon-camera").html("Uploading...");
    $(".icon-camera").css("background", "none");
    $("input").detach();
    $.ajax({
        type: "POST",
        url: "/update-face",
        data: fd,
        processData: false,
        contentType: false,
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            return xhr;
        },
        complete: evt => {
            $(".icon-camera").html("<h2>Done!</h2><p>Go and take some photos now</p>");
        }
    });
    set_cookie("photos-name", $("#name").val().trim());
}
function set_cookie(key, value) {
    let c = `${key}=${value}`;
    document.cookie = c;
}
function hide_btns() {
    $("a.btn").addClass("d-none");
}
function show_btns() {
    $("a.btn").removeClass("d-none");
}
