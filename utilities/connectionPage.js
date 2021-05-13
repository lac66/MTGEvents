// Used for button functionality on connection details page
function getElement(id) {
    return document.getElementById(id);
}

// listeners for all buttons
window.onload = function() {
    getElement("btnYes").onclick = yesWindow;
    getElement("btnNo").onclick = noWindow;
    getElement("btnMaybe").onclick = maybeWindow;
}

// click handlers attach connection id to query string
function yesWindow() {
    var url = window.location.href;
    window.location.href = "/user/yes/" + url.substring(url.length - 24);
}

function noWindow() {
    var url = window.location.href;
    window.location.href = "/user/no/" + url.substring(url.length - 24);
}

function maybeWindow() {
    var url = window.location.href;
    window.location.href = "/user/maybe/" + url.substring(url.length - 24);
}