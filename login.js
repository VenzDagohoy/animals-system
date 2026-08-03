const API_URL = "http://localhost:3000";
const loginForm = document.querySelector("#login-form");
const message = document.querySelector("#message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            message.textContent = data.message ?? "Login failed";
            message.className = "message error";
            return;
        }
        
        // Save the JWT to the browser
        localStorage.setItem("accessToken", data.accessToken);
        
        message.textContent = "Login successful";
        message.className = "message success";
        
        // Redirect to the main animals dashboard
        window.location.href = "./index.html"; 
        
    } catch (error) {
        console.error(error);
        message.textContent = "Unable to connect to the API";
        message.className = "message error";
    }
});