var template = '<div class="col-6 col-md-4 col-lg-3 mb-4">';
template += '<img src="https://s3-us-west-2.amazonaws.com/photos4parents/[[filename]]" class="w-100 img-fluid"> </div>';
function find_photos(ele) {
    var name = ele.value.trim();
    if (name.length < 3) {
        return;
    }
    set_cookie("photos-name", name);
    $(".photos").empty();
    $.post("/my-photos?rand=" + Math.random(), { name: name }, resp => {
        if (resp.length < 1) {
            $(".photos").html("<h4>Sorry, no photos found</h4>");
            return;
        }
        for (let filename of resp.split(",")) {
            var entry = template.replace("[[filename]]", filename);
            $(".photos").append(entry);
        }
    });
}

function submit() {
    find_photos($("input")[0]);
}

function load_cookie() {
    let data = {};
    if (!document.cookie) {
        return data;
    }
    for (let kv of document.cookie.split(";")) {
        kv = $.trim(kv);
        let p = kv.indexOf("=");
        if (p == -1) {
            continue;
        }
        data[kv.substr(0, p)] = kv.substr(p + 1);
    }
    return data;
}

function get_cookie(key) {
    let data = load_cookie();
    if (data.hasOwnProperty(key)) {
        return data[key];
    } else {
        return null;
    }
}

function set_cookie(key, value) {
    let c = `${key}=${value}`;
    document.cookie = c;
}

var saved_name = get_cookie("photos-name");
if (saved_name) {
    $("input").val(saved_name);
    find_photos($("input")[0]);
}
