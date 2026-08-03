// Using your live Render API URL
const API_URL = "https://animals-backend-r0h2.onrender.com";

const registerForm = document.querySelector("#register-form");
const message = document.querySelector("#message");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    
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
            // Displays error (e.g., "Email is already registered")
            message.textContent = data.message ?? "Registration failed";
            message.className = "message error";
            return;
        }
        
        message.textContent = "Registration successful! Redirecting to login...";
        message.className = "message success";
        registerForm.reset();
        
        // Wait 2 seconds so the user can see the success message, then redirect
        setTimeout(() => {
            window.location.href = "./login.html";
        }, 2000);
        
    } catch (error) {
        console.error(error);
        message.textContent = "Unable to connect to the API";
        message.className = "message error";
    }
});