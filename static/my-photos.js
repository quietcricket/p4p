function find_photos(ele) {
    var name = ele.value.trim();
    if (name.length < 3) {
        return;
    }

    $.post("/find-photos", { name: name }, resp => {
        if(resp.length<1){
            
        }
    });
}
