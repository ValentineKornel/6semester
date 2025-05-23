function onPhotoLoad(img, h, w) {
    if (w === 0) w = h * img.naturalWidth / img.naturalHeight;
    img.style.height = h + "px";
    img.style.width = w + "px";
}

function onPhotoClick(id) {
    alert("Clicked celebrity ID: " + id);
    window.location = "/" + id;
}