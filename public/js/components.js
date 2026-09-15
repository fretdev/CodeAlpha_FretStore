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
    const menuBar = navbar.querySelector('.menu-bar')
    const navListContainer = navbar.querySelector('.nav-links-container')
    const navLists = navbar.querySelector('.nav-links')
    const navButtons = navbar.querySelector('.nav-btns')
    const loginBtn = navbar.querySelector('.login-btn')
    const registerBtn = navbar.querySelector('.register-btn')
    menuBar.addEventListener('click',()=>{
        menuBar.classList.toggle('is-toggled')
        navListContainer.classList.toggle('is-toggled')
        navLists.classList.toggle('is-toggled')
        navButtons.classList.toggle('is-toggled')
        loginBtn.classList.toggle('is-toggled')
        registerBtn.classList.toggle('is-toggled')
    })
    
    })