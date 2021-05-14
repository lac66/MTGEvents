// Used for button functionality on savedConnections page

var updateId;
var deleteId;

function getElement(id) {
    return document.getElementById(id);
}

window.onload = function () {
    // Gets all update buttons and assigns on click listener
    var buttons = document.getElementsByClassName("update");
    for (var i = 0; i < buttons.length; i++) {
        updateId = buttons[i].id;
        getElement(updateId).onclick = loadDetailsWindow;
    }

    // Gets all delete buttons and assigns on click listener
    var delButtons = document.getElementsByClassName("delete");
    for (var i = 0; i < delButtons.length; i++) {
        deleteId = delButtons[i].id;
        getElement(deleteId).onclick = deleteConnection;
    }
}

// Link to connection details page
function loadDetailsWindow() {
    if (this.classList.contains("ownedConnection")) {
        window.location.href = "/user/newConnection/" + this.id;
    } else {
        window.location.href = "/connections/" + this.id;
    }
} 

// Link to delete userConnection handler
function deleteConnection() {
    window.location.href = "/user/delete/" + this.id.substring(3);
}