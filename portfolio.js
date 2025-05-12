const place = window.location.pathname;
console.log(place);

if (place === "/") {
    document.querySelector(".navbar a[href='/']").style.color = "purple";
    
    }


window.onload = function() {
        setTimeout(function() {
            document.querySelector('.transitionleft').classList.add('show');
            document.querySelector('.transitionright').classList.add('show');
        }, 100); // You can adjust the timeout delay as needed
    };




