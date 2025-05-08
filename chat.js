
let socket;

console.log( window.location.host)


if (window.location.host.split(":")[0] === "localhost") {
    socket = new WebSocket("ws://localhost:8080");
    console.log("WebSocket connection established to localhost");
} else {
    console.log( window.location.host)
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    socket = new WebSocket('wss://portfolio-9gah.onrender.com/ws');
    console.log("WebSocket connection established to production server");
}

document.getElementById("closepopup1").addEventListener("click", function close() {
    console.log("close() called");
    document.getElementById("message1").style.display = "none";
    document.getElementById("closepopup1").style.display = "none";

    sessionStorage.setItem("message1Closed", "true");
  });



window.addEventListener("DOMContentLoaded", function() { 

    const isClosed = sessionStorage.getItem("messageClosed");

    if (isClosed) {
        document.getElementById("message1").style.display = "none";
        document.getElementById("closepopup1").style.display = "none";

    } else {
        document.getElementById("message1").style.display = "block";
        document.getElementById("closepopup1").style.display = "block";

    }
    
})


document.getElementById("startchat").addEventListener("click", function() {

 document.getElementById("messagearea").style.display = "flex";

 document.getElementById("message1").style.display = "none";
 document.getElementById("closepopup1").style.display = "none";

 sessionStorage.setItem("message1Closed", "true");

 socket.addEventListener("open", function () {
    console.log("WebSocket connection opened");
    // You can send a message to the server if needed
 })

})

document.getElementById("closepopup2").addEventListener("click", function (){

    document.getElementById("messagearea").style.display = "none";

    socket.close(); // Close the WebSocket connection when the popup is closed

    console.log("WebSocket connection closed");


}
)
document.getElementById("send").addEventListener("click", function () {

    var x = document.getElementById("inputmessage").value;

    // Correctly create div elements
    var parentDiv = document.createElement("div");
    parentDiv.className = "messagesdiv";

    var childDiv = document.createElement("div");
    childDiv.className = "usermessage";

    var messagediv = document.getElementById("messages");

    messagediv.appendChild(parentDiv);
    parentDiv.appendChild(childDiv);
    childDiv.innerHTML = x;

    document.getElementById("inputmessage").value = ""; // Clear the input field
    messagediv.scrollTop = messagediv.scrollHeight; // Scroll to the bottom of the messages div 
    console.log("Message sent: " + x);


    socket.send(x); // Send the message to the server via WebSocket
    console.log("Message sent to server: " + x);

});


socket.addEventListener("message", function (event) { 

    var x = event.data;
    console.log("Message received from server: " + x);

    // Correctly create div elements
    var parentDiv = document.createElement("div");
    parentDiv.className = "messagesdiv";

    var childDiv = document.createElement("div");
    childDiv.className = "bemessage";

    var messagediv = document.getElementById("messages");

    messagediv.appendChild(parentDiv);
    parentDiv.appendChild(childDiv);
    childDiv.innerHTML = x;

    messagediv.scrollTop = messagediv.scrollHeight; // Scroll to the bottom of the messages div

})

