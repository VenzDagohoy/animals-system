// const API_URL = "http://localhost:3000";
const API_URL = "https://animals-backend-r0h2.onrender.com";

// Get HTML element needed for the form, button, messages
const registerForm = document.querySelector("#register-form");
const message = document.querySelector("#message");
const registerBtn = document.querySelector("#register-btn");
const loadingDiv = document.querySelector("#loading");

// Handle when user clicks register button
registerForm.addEventListener("submit", async (event) => {
    // Stop the page from reloading when the form is submitted
    event.preventDefault();
    
    // Get name, email, and password the user inputed
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    
    // Show loading message and disable the button
    registerBtn.disabled = true;
    loadingDiv.style.display = "block";
    message.textContent = "";
    message.className = "message";
    
    try {
        // Send new user info to the server using POST request
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });
        
        // Read the server response
        const data = await response.json();
        
        // If server rejects the registration, error
        if (!response.ok) {
            // Show the error message to the user.
            message.textContent = data.message ?? "Registration failed";
            message.className = "message error";
            
            // Hide loading text and enable the button to try again
            loadingDiv.style.display = "none";
            registerBtn.disabled = false;
            return;
        }
        
        // Hide loading text
        loadingDiv.style.display = "none";
        // Show success message
        message.textContent = "Registration successful! Redirecting to login...";
        message.className = "message success";
        // Clear the inputs
        registerForm.reset();
        
        // Wait 2 seconds, then send user to the login page
        setTimeout(() => {
            window.location.href = "./login.html";
        }, 2000);
        
    } catch (error) {
        // If connection fails, error
        console.error(error);
        message.textContent = "Unable to connect to the API";
        message.className = "message error";
        
        // Hide loading text and enable the button to try again
        loadingDiv.style.display = "none";
        registerBtn.disabled = false;
    }
});