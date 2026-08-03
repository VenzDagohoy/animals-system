const API_URL = "https://animals-backend-r0h2.onrender.com";

const registerForm = document.querySelector("#register-form");
const message = document.querySelector("#message");
const registerBtn = document.querySelector("#register-btn");
const loadingDiv = document.querySelector("#loading");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    
    // Show text loading, disable button, clear errors
    registerBtn.disabled = true;
    loadingDiv.style.display = "block";
    message.textContent = "";
    message.className = "message";
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            message.textContent = data.message ?? "Registration failed";
            message.className = "message error";
            
            // Hide loading, re-enable button
            loadingDiv.style.display = "none";
            registerBtn.disabled = false;
            return;
        }
        
        // Hide loading on success
        loadingDiv.style.display = "none";
        message.textContent = "Registration successful! Redirecting to login...";
        message.className = "message success";
        registerForm.reset();
        
        setTimeout(() => {
            window.location.href = "./login.html";
        }, 2000);
        
    } catch (error) {
        console.error(error);
        message.textContent = "Unable to connect to the API";
        message.className = "message error";
        
        // Hide loading, re-enable button on error
        loadingDiv.style.display = "none";
        registerBtn.disabled = false;
    }
});