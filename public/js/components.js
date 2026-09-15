const navbar = document.getElementById("navbar")

fetch("/components/navbar.html")
    .then(response => response.text())
    .then(data =>{
        navbar.innerHTML = data


    const navLinks = navbar.querySelectorAll(".nav-links a")
    navLinks.forEach(link =>{
       link.addEventListener('click',()=>{
        navLinks.forEach(link =>{
            link.classList.remove('active')
        })
        link.classList.add("active")
       })
    })
    })