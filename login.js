// const API_URL = "http://localhost:3000";
const API_URL = "https://animals-backend-r0h2.onrender.com";

// Get HTML elements needed for the form, button, messages
const loginForm = document.querySelector("#login-form");
const message = document.querySelector("#message");
const loginBtn = document.querySelector("#login-btn"); 
const loadingDiv = document.querySelector("#loading");

// Handle when user clicks the login button
loginForm.addEventListener("submit", async (event) => {
    // Stop page from reloading when the form is submitted
    event.preventDefault();
    
    // Get the email and password the user inputed
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    
    // Show loading message and disable the button
    loginBtn.disabled = true;
    loadingDiv.style.display = "block";
    message.textContent = ""; 
    message.className = "message";
    
    try {
        // Send email and password to the server using POST request
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        
        // Read the server response
        const data = await response.json();
        
        // If server rejects the login, error
        if (!response.ok) {
            // Show error message
            message.textContent = data.message ?? "Login failed";
            message.className = "message error";
            
            // Hide loading text and enable the button
            loadingDiv.style.display = "none";
            loginBtn.disabled = false;
            return;
        }
        
        // If login successful, save login token
        localStorage.setItem("accessToken", data.accessToken);
        
        // Hide loading text and show success message
        loadingDiv.style.display = "none";
        message.textContent = "Login successful";
        message.className = "message success";
        
        // Send user to the main dashboard
        window.location.href = "./index.html";
        
    } catch (error) {
        // If connection fails, error
        console.error(error);
        message.textContent = "Unable to connect to the API";
        message.className = "message error";
        
        // Hide loading text and enable the button to try again
        loadingDiv.style.display = "none";
        loginBtn.disabled = false;
    }
});