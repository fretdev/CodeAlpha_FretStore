const navbar = document.getElementById("navbar")

fetch("/components/navbar.html")
    .then(response => response.text())
    .then(data =>{
        navbar.innerHTML = data
    })