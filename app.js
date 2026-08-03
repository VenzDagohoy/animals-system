// const API_URL = "http://localhost:3000/animals";
// const API_URL = "https://animal-api-v8to.onrender.com/animals";
const API_URL = "https://animals-backend-r0h2.onrender.com/animals";
// const API_URL = "https://backend-animals-i5yl.onrender.com/animals";

// NEW: 1. Check login state immediately on load
const token = localStorage.getItem("accessToken");
if (!token) {
    window.location.href = "./login.html";
}

// NEW: 2. Handle Logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        window.location.href = "./login.html";
    });
}

// NEW: Helper function to force logout on 401 errors
function handleUnauthorized(response) {
    if (response.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "./login.html";
        return true;
    }
    return false;
}

const animalForm = document.getElementById("animal-form");
const animalList = document.getElementById("animal-list");
const animalTable = document.getElementById("animal-table");
const loadingDiv = document.getElementById("loading");
const formMessage = document.getElementById("form-message");
const searchMessage = document.getElementById("search-message");
const editCard = document.getElementById("edit-card");
const editForm = document.getElementById("edit-form");

// GET fetch all animals (Public route, no token needed)
async function fetchAnimals() {
    searchMessage.textContent = "";
    searchMessage.className = "message";
    document.getElementById("searchId").value = "";
    document.getElementById("searchName").value = ""; 
    document.getElementById("filterLegs").value = "";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Server error"); 
        const data = await response.json();
        renderTable(data.animals);
    } catch (error) {
        loadingDiv.style.display = "block"; 
        loadingDiv.textContent = "Failed to load animals.";
    }
}

// GET search by id (Public route)
async function searchById() {
    const id = document.getElementById("searchId").value;
    if (!id) return;
    document.getElementById("searchName").value = "";
    document.getElementById("filterLegs").value = "";
    searchMessage.textContent = "";
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 404) {
                renderTable([]);
                return;
            }
            throw new Error(data.message);
        }
        renderTable([data.animal]); 
    } catch (error) {
        console.error("Error searching by ID:", error);
        searchMessage.textContent = "Server error occurred.";
        searchMessage.className = "message error";
    }
}

// GET search by name (Public route)
async function searchByName() {
    const name = document.getElementById("searchName").value;
    if (!name) return;
    document.getElementById("searchId").value = "";
    document.getElementById("filterLegs").value = "";
    searchMessage.textContent = "";
    try {
        const response = await fetch(`${API_URL}?name=${name}`);
        if (!response.ok) throw new Error("Server error"); 
        const data = await response.json();
        renderTable(data.animals); 
    } catch (error) {
        console.error("Error searching by Name:", error);
        searchMessage.textContent = "Server error occurred.";
        searchMessage.className = "message error";
    }
}

// GET filter by legs (Public route)
async function filterByLegs() {
    const legs = document.getElementById("filterLegs").value;
    if (!legs) return;
    document.getElementById("searchId").value = "";
    document.getElementById("searchName").value = "";
    searchMessage.textContent = "";
    try {
        const response = await fetch(`${API_URL}?numLegs=${legs}`);
        if (!response.ok) throw new Error("Server error"); 
        const data = await response.json();
        renderTable(data.animals);
    } catch (error) {
        console.error("Error filtering by legs:", error);
        searchMessage.textContent = "Server error occurred.";
        searchMessage.className = "message error";
    }
}

// Render table utility function
function renderTable(animals) {
    loadingDiv.style.display = "none";
    animalTable.style.display = "table"; 
    animalList.innerHTML = "";
    if (!animals || animals.length === 0) {
        animalList.innerHTML = `<tr><td colspan="4" class="text-center">No animals found.</td></tr>`;
        return;
    }
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
        animalList.appendChild(row);
    });
}

// POST add animal (Protected route)
animalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const numLegs = Number(document.getElementById("numLegs").value);
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // NEW: 3. Attach token
            },
            body: JSON.stringify({ name, numLegs })
        });
        
        // NEW: 4. Check for unauthorized access
        if (handleUnauthorized(response)) return;

        const result = await response.json();
        if (!response.ok) {
            formMessage.textContent = result.message;
            formMessage.className = "message error";
            return;
        }
        formMessage.textContent = "Animal added successfully!";
        formMessage.className = "message success";
        animalForm.reset();
        fetchAnimals();
    } catch (error) {
        formMessage.textContent = "Server error occurred.";
        formMessage.className = "message error";
    }
});

// Show form and fill with data
window.openEditForm = function(id, name, legs) {
    editCard.style.display = "block";
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-numLegs").value = legs;
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// Hide form and reset inputs
window.cancelEdit = function() {
    editCard.style.display = "none"; 
    editForm.reset(); 
};

// PUT edit animal (Protected route)
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-id").value;
    const name = document.getElementById("edit-name").value;
    const numLegs = Number(document.getElementById("edit-numLegs").value);
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // NEW: 3. Attach token
            },
            body: JSON.stringify({ name, numLegs })
        });

        // NEW: 4. Check for unauthorized access
        if (handleUnauthorized(response)) return;

        if (!response.ok) {
            const result = await response.json();
            alert(result.message);
            editForm.reset(); 
            return;
        }
        const result = await response.json(); 
        alert(result.message);
        cancelEdit();
        fetchAnimals(); 
    } catch (error) {
        console.error("Error updating animal:", error);
        editForm.reset(); 
    }
});

// DELETE remove animal (Protected route)
window.deleteAnimal = async function(id) {
    if (!confirm("Are you sure you want to delete this animal?")) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}` // NEW: 3. Attach token
            }
        });

        // NEW: 4. Check for unauthorized access
        if (handleUnauthorized(response)) return;

        if (response.ok) {
            alert("Animal deleted successfully!");
            fetchAnimals();
        } else {
            alert("Failed to delete animal.");
        }
    } catch (error) {
        console.error("Error deleting animal:", error);
    }
};

// Initialize app on load
fetchAnimals();