// const API_URL = "http://localhost:3000/animals";
// const API_URL = "https://animal-api-v8to.onrender.com/animals";
const API_URL = "https://animals-backend-r0h2.onrender.com/animals";
// const API_URL = "https://backend-animals-i5yl.onrender.com/animals";

const animalForm = document.getElementById("animal-form");
const animalList = document.getElementById("animal-list");
const animalTable = document.getElementById("animal-table");
const loadingDiv = document.getElementById("loading");
const formMessage = document.getElementById("form-message");
const searchMessage = document.getElementById("search-message");
const editCard = document.getElementById("edit-card");
const editForm = document.getElementById("edit-form");

// GET fetch all animals
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

// GET search by id
async function searchById() {
    const id = document.getElementById("searchId").value;
    if (!id) return;
    
    // Clear inputs
    document.getElementById("searchName").value = "";
    document.getElementById("filterLegs").value = "";
    searchMessage.textContent = "";

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
            // Render table handle 404 message
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

// GET search by name
async function searchByName() {
    const name = document.getElementById("searchName").value;
    if (!name) return;
    
    // Clear inputs
    document.getElementById("searchId").value = "";
    document.getElementById("filterLegs").value = "";
    searchMessage.textContent = "";

    try {
        const response = await fetch(`${API_URL}?name=${name}`);
        if (!response.ok) throw new Error("Server error"); 
        const data = await response.json();
        
        // Render table handle the empty array natively
        renderTable(data.animals); 
    } catch (error) {
        console.error("Error searching by Name:", error);
        searchMessage.textContent = "Server error occurred.";
        searchMessage.className = "message error";
    }
}

// GET filter by legs
async function filterByLegs() {
    const legs = document.getElementById("filterLegs").value;
    if (!legs) return;
    
    // Clear orphaned inputs
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

// Render table utility
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

// POST add animal
animalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const numLegs = Number(document.getElementById("numLegs").value);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, numLegs })
        });

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

// PUT edit animal
// Show form and fill with data
function openEditForm(id, name, legs) {
    editCard.style.display = "block";
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-numLegs").value = legs;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Hide form and reset inputs
function cancelEdit() {
    editCard.style.display = "none"; 
    editForm.reset(); 
}

// Submit changes
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("edit-id").value;
    const name = document.getElementById("edit-name").value;
    const numLegs = Number(document.getElementById("edit-numLegs").value);

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, numLegs })
        });

        if (!response.ok) {
            const result = await response.json();
            alert("Error updating: " + result.message);
            
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

// DELETE remove animal
async function deleteAnimal(id) {
    if (!confirm("Are you sure you want to delete this animal?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

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

// Initialize app on load
fetchAnimals();