// const API_URL = "http://localhost:3000/animals";
const API_URL = "https://animals-backend-r0h2.onrender.com/animals";
// const API_URL = "https://animal-api-v8to.onrender.com/animals";
// const API_URL = "https://backend-animals-i5yl.onrender.com/animals";

// Check if user is already logged in by looking for token, if no token redirect to login page
const token = localStorage.getItem("accessToken");
if (!token) {
    window.location.href = "./login.html";
}

// Logout button on the page
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    // When user clicks logout, remove the token and redirect to login page
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        window.location.href = "./login.html";
    });
}

// Function when user token is invalid or expired, force logout to login again
function handleUnauthorized(response) {
    if (response.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "./login.html";
        return true;
    }
    return false;
}

// Grab all HTML elements needed to interact on the page
const animalForm = document.getElementById("animal-form");
const animalList = document.getElementById("animal-list");
const animalTable = document.getElementById("animal-table");
const loadingDiv = document.getElementById("loading");
const formMessage = document.getElementById("form-message");
const searchMessage = document.getElementById("search-message");
const editCard = document.getElementById("edit-card");
const editForm = document.getElementById("edit-form");

// Fetch animals for the user logged in.
async function fetchAnimals() {
    // Clear out old search text in the search boxes
    searchMessage.textContent = "";
    searchMessage.className = "message";
    document.getElementById("searchId").value = "";
    document.getElementById("searchName").value = ""; 
    document.getElementById("filterLegs").value = "";

    try {
        // Send request to server, include the user token proof of user login.
        const response = await fetch(API_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        // Stop if the token is not valid
        if (handleUnauthorized(response)) return;
        
        // Error if something wrong with the server
        if (!response.ok) throw new Error("Server error"); 
        
        // Read animal data and update the table on the page
        const data = await response.json();
        renderTable(data.animals);
    } catch (error) {
        // Print error message if connection fail
        loadingDiv.style.display = "block"; 
        loadingDiv.textContent = "Failed to load animals.";
    }
}

// Search animal by ID
async function searchById() {
    // Get ID from search box, stop if empty
    const id = document.getElementById("searchId").value;
    if (!id) return;
    
    // Clear search boxes
    document.getElementById("searchName").value = "";
    document.getElementById("filterLegs").value = "";
    searchMessage.textContent = "";

    try {
        // Ask server for the animal with searched ID, pass the token for access
        const response = await fetch(`${API_URL}/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        // Stop if user login is invalid
        if (handleUnauthorized(response)) return;

        const data = await response.json();
        
        // If server can't find the animal
        if (!response.ok) {
            // If not found error, show empty table
            if (response.status === 404) {
                renderTable([]);
                return;
            }
            throw new Error(data.message);
        }
        
        // Give table showing the animal found
        renderTable([data.animal]); 
    } catch (error) {
        console.error("Error searching by ID:", error);
        searchMessage.textContent = "Server error occurred.";
        searchMessage.className = "message error";
    }
}

// Search animals by name
async function searchByName() {
    // Get name from the search box, stop if empty
    const name = document.getElementById("searchName").value;
    if (!name) return;
    
    // Clear search boxe
    document.getElementById("searchId").value = "";
    document.getElementById("filterLegs").value = "";
    searchMessage.textContent = "";

    try {
        // Ask server for animals matching the name, pass token for access
        const response = await fetch(`${API_URL}?name=${name}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        // Stop if user login is invalid
        if (handleUnauthorized(response)) return;
        if (!response.ok) throw new Error("Server error"); 
        
        // Give the table with the matching animal
        const data = await response.json();
        renderTable(data.animals); 
    } catch (error) {
        console.error("Error searching by Name:", error);
        searchMessage.textContent = "Server error occurred.";
        searchMessage.className = "message error";
    }
}

// Filter animal list bu number of legs
async function filterByLegs() {
    // Get number of legs from search box, stop if empty
    const legs = document.getElementById("filterLegs").value;
    if (!legs) return;
    
    // Clear search box
    document.getElementById("searchId").value = "";
    document.getElementById("searchName").value = "";
    searchMessage.textContent = "";

    try {
        // Ask server for animals with this number of legs, passing the token
        const response = await fetch(`${API_URL}?numLegs=${legs}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        // Stop if user login is invalid
        if (handleUnauthorized(response)) return;
        if (!response.ok) throw new Error("Server error"); 
        
        // Give the table with the filtered animals
        const data = await response.json();
        renderTable(data.animals);
    } catch (error) {
        console.error("Error filtering by legs:", error);
        searchMessage.textContent = "Server error occurred.";
        searchMessage.className = "message error";
    }
}

// Function to display the table of animals on the page
function renderTable(animals) {
    // Hide the loading message and make sure the table is visible
    loadingDiv.style.display = "none";
    animalTable.style.display = "table"; 
    
    // Clear out old rows in the table
    animalList.innerHTML = "";

    // Print message if no animals found
    if (!animals || animals.length === 0) {
        animalList.innerHTML = `<tr><td colspan="4" class="text-center">No animals found.</td></tr>`;
        return;
    }

    // Loop through each animal in the list and make a new table row for it
    animals.forEach(animal => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${animal.id}</td>
            <td><strong>${animal.name}</strong></td>
            <td>${animal.numLegs}</td>
            <td>
                <button class="btn-secondary action-btn" onclick="openEditForm(${animal.id}, '${animal.name}', ${animal.numLegs})">Edit</button>
                <button class="btn-danger" onclick="deleteAnimal(${animal.id})">Delete</button>
            </td>
        `;
        // Attach new row to the table
        animalList.appendChild(row);
    });
}

// Handle user add new animal
animalForm.addEventListener("submit", async (e) => {
    // Stop page from reloading when submitting the form
    e.preventDefault();
    
    // Get the name and num of legs user search
    const name = document.getElementById("name").value;
    const numLegs = Number(document.getElementById("numLegs").value);

    try {
        // Send new animal data to server using POST request
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, numLegs })
        });
        
        // Stop if user login is invalid
        if (handleUnauthorized(response)) return;
        
        const result = await response.json();
        
        // If server reject new animal, error message
        if (!response.ok) {
            formMessage.textContent = result.message;
            formMessage.className = "message error";
            return;
        }

        // Show a success message
        formMessage.textContent = "Animal added successfully!";
        formMessage.className = "message success";
        
        // Clear input and reload the animal table
        animalForm.reset();
        fetchAnimals();
    } catch (error) {
        formMessage.textContent = "Server error occurred.";
        formMessage.className = "message error";
    }
});

// Open edit form and fill it with the selected animal current information
window.openEditForm = function(id, name, legs) {
    editCard.style.display = "block";
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-numLegs").value = legs;
    
    // Scroll up to see the edir form
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Close edit form and clear inuted text
window.cancelEdit = function() {
    editCard.style.display = "none"; 
    editForm.reset(); 
}

// Handle user save the changes to an animal
editForm.addEventListener("submit", async (e) => {
    // Stop page from reloading
    e.preventDefault();
    
    // Get updated info from edit form
    const id = document.getElementById("edit-id").value;
    const name = document.getElementById("edit-name").value;
    const numLegs = Number(document.getElementById("edit-numLegs").value);

    try {
        // Send updated info to server using PUT request
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ name, numLegs })
        });

        // Stop if user login is invalid
        if (handleUnauthorized(response)) return;

        // If server rejects the update, close form
        if (!response.ok) {
            const result = await response.json();
            alert(result.message);
            editForm.reset(); 
            return;
        }

        // Print success alert, hide form, and update table
        const result = await response.json(); 
        alert(result.message);
        cancelEdit();
        fetchAnimals(); 
    } catch (error) {
        console.error("Error updating animal:", error);
        editForm.reset(); 
    }
});

// Handle deleting animal
window.deleteAnimal = async function(id) {
    // Ask user to double check before deleting
    if (!confirm("Are you sure you want to delete this animal?")) return;

    try {
        // Tell server to delete the animal using DELETE request
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}` 
            }
        });

        // Stop if user login is invalid
        if (handleUnauthorized(response)) return;

        // Alert of the delete worked or failed, then refresh table
        if (response.ok) {
            alert("Animal deleted successfully!");
            fetchAnimals();
        } else {
            alert("Failed to delete animal.");
        }
    } catch (error) {
        console.error("Error deleting animal:", error);
    }
}

// Load all animals when the page opens
fetchAnimals();