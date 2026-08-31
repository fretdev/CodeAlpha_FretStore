const usernameInput = document.querySelector('.username')
const passwordInput = document.querySelector('.password')

const submitButton = document.querySelector('.submit-btn')
const loginform = document.querySelector('.login-form')
const display = document.querySelector('.status-display')

loginform.addEventListener('submit',(event)=>{
    event.preventDefault()
    const username = usernameInput.value
    const password = passwordInput.value
    
        fetch("http://localhost:3000/form",{
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username,password})
        })
        .then(response => response.json())
        .then(data =>{
             display.textContent=`You have successfully login ${data.username}`
            usernameInput.value=""
            passwordInput.value=""
            setTimeout(()=>{
                display.textContent=""
            },2000)

            console.log(`Response from the server: ${data.username} ${data.password}`)
        })
        .catch(err=>{
            console.log(err)
        })
    })