/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

//delete 2

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    // delete 4
  
    //Esther
    document.getElementById("searchByNutrient").addEventListener("submit", searchByNutrient);//Esther added
    document.getElementById("aggregationSearch").addEventListener("submit", aggregationSearch); //Aggregtion with having
    document.getElementById("divisionQueryForm").addEventListener("submit", divisionQuery);//Division
    
    //Dali
    document.getElementById("projectionForm").addEventListener("submit", fetchDynamicIngredients);        //Projection
    document.getElementById("deleteRecipeForm").addEventListener("submit", deleteRecipe);                 //Delete
    fetchMaxRecipeId();                                                                                   //Find the maximum ID
    document.getElementById("countDietitianRecipesBtn").addEventListener("click", countDietitianRecipes); //Aggregation
    document.getElementById("findFastestDietitianBtn").addEventListener("click", findFastestDietitian);   //Nested Aggregation with GROUP BY
    document.querySelectorAll('.proj-checkbox').forEach(cb => {
        cb.addEventListener('change', handleProjectionCheckboxChange);
    });                                                                                                   //Projection Order

    //Jiyang Section
    document.getElementById('insertRecipeId').addEventListener('input', validateRecipeIdLive);      //Insert
    document.getElementById('insertRecipeName').addEventListener('input', validateRecipeNameLive);  //Insert
    document.getElementById('insertCookTime').addEventListener('input', validateCookTimeLive);      //Insert
    document.getElementById('insertPrice').addEventListener('input', validatePriceLive);            //Insert
    document.getElementById('insertDietitianId').addEventListener('input', validateDietitianIdLive);//Insert
    document.getElementById("insertRecipeBtn").addEventListener("click", insertRecipe);     //Insert
    document.getElementById("loadRecipesBtn").addEventListener("click", loadRecipes);       //Update
    document.getElementById("updateRecipeBtn").addEventListener("click", updateRecipe);     //Update
    document.getElementById("cancelUpdateBtn").addEventListener("click", () => {            //Update
        document.getElementById('updateRecipeForm').style.display = 'none';
        document.getElementById('updateRecipeMsg').textContent = '';
    });
    
    document.getElementById("searchRecipesBtn").addEventListener("click", searchRecipes);   //Selection
    document.getElementById("clearConditionsBtn").addEventListener("click", () => {         //Selection
        conditionCount = 1;
        document.getElementById('conditionsContainer').innerHTML = `
            <div class="condition-row" id="condition-0">
                <select class="condition-field" onchange="updateValueInput(this)">
                    <option value="name">Name</option>
                    <option value="cookTime">Cook Time</option>
                    <option value="spiceLevel">Spice Level</option>
                    <option value="price">Price</option>
                </select>
                <select class="condition-operator">
                    <option value="=">=</option>
                    <option value="<">&lt;</option>
                    <option value=">">&gt;</option>
                    <option value="<=">&lt;=</option>
                    <option value=">=">&gt;=</option>
                </select>
                <span class="condition-value-container">
                    <input type="text" class="condition-value" placeholder="Enter value">
                </span>
                <span class="and-or-buttons">
                    <button type="button" onclick="addCondition('AND')">+ AND</button>
                    <button type="button" onclick="addCondition('OR')">+ OR</button>
                </span>
            </div>
        `;
        document.getElementById('searchRecipeMsg').textContent = '';
        document.getElementById('searchResultsContainer').innerHTML = '';
    });

};

//delete 3


// ==========================================================
// 🚀 JIYANG'S SECTION
// ==========================================================

// Insert
function setHelpMessage(elementId, message, color) {
    const elem = document.getElementById(elementId);
    elem.textContent = message;
    elem.style.color = color;
}

function resetInsertFieldHelpMessages() {
    setHelpMessage('insertRecipeIdHelp', 'Required. Whole numbers only.', '#666');
    setHelpMessage('insertRecipeNameHelp', 'Required. Up to 20 characters.', '#666');
    setHelpMessage('insertCookTimeHelp', 'Optional. Whole number of minutes only.', '#666');
    setHelpMessage('insertSpiceLevelHelp', 'Optional. Select a spice level.', '#666');
    setHelpMessage('insertPriceHelp', 'Optional. Valid number only, e.g. 12.99.', '#666');
    setHelpMessage('insertDietitianIdHelp', 'Required. Whole numbers only. Must match an existing Dietitian ID.', '#666');
}

function isPositiveInteger(value) {
    return /^\d+$/.test(value) && Number(value) > 0;
}

function isNonNegativeNumber(value) {
    return /^(?:\d+|\d+\.\d+)$/.test(value) && Number(value) >= 0;
}

function validateRecipeIdLive() {
    const value = document.getElementById('insertRecipeId').value.trim();

    if (value === '') {
        setHelpMessage('insertRecipeIdHelp', 'Recipe ID is required.', 'red');
        return false;
    }

    if (!isPositiveInteger(value)) {
        setHelpMessage('insertRecipeIdHelp', 'Recipe ID must be a positive integer.', 'red');
        return false;
    }

    setHelpMessage('insertRecipeIdHelp', 'Looks good.', 'green');
    return true;
}

function validateRecipeNameLive() {
    const value = document.getElementById('insertRecipeName').value.trim();

    if (value === '') {
        setHelpMessage('insertRecipeNameHelp', 'Recipe Name is required.', 'red');
        return false;
    }

    if (value.length > 20) {
        setHelpMessage('insertRecipeNameHelp', 'Recipe Name must be 20 characters or fewer.', 'red');
        return false;
    }

    setHelpMessage('insertRecipeNameHelp', 'Looks good.', 'green');
    return true;
}

function validateCookTimeLive() {
    const value = document.getElementById('insertCookTime').value.trim();

    if (value === '') {
        setHelpMessage('insertCookTimeHelp', 'Optional. Whole number of minutes only.', '#666');
        return true;
    }

    if (!isPositiveInteger(value)) {
        setHelpMessage('insertCookTimeHelp', 'Cook Time must be a positive integer.', 'red');
        return false;
    }

    setHelpMessage('insertCookTimeHelp', 'Looks good.', 'green');
    return true;
}

function validatePriceLive() {
    const value = document.getElementById('insertPrice').value.trim();

    if (value === '') {
        setHelpMessage('insertPriceHelp', 'Optional. Valid number only, e.g. 12.99.', '#666');
        return true;
    }

    if (!isNonNegativeNumber(value)) {
        setHelpMessage('insertPriceHelp', 'Price must be a valid non-negative number.', 'red');
        return false;
    }

    setHelpMessage('insertPriceHelp', 'Looks good.', 'green');
    return true;
}

function validateDietitianIdLive() {
    const value = document.getElementById('insertDietitianId').value.trim();

    if (value === '') {
        setHelpMessage('insertDietitianIdHelp', 'Dietitian ID is required.', 'red');
        return false;
    }

    if (!isPositiveInteger(value)) {
        setHelpMessage('insertDietitianIdHelp', 'Dietitian ID must be a positive integer.', 'red');
        return false;
    }

    setHelpMessage('insertDietitianIdHelp', 'Format looks good. It must also match an existing Dietitian ID.', 'green');
    return true;
}

function validateInsertRecipeInputs(recipe_id, name, cookTime, price, dietitian_id) {
    const recipeIdOk = validateRecipeIdLive();
    const nameOk = validateRecipeNameLive();
    const cookTimeOk = validateCookTimeLive();
    const priceOk = validatePriceLive();
    const dietitianIdOk = validateDietitianIdLive();

    if (!recipeIdOk) {
        if (recipe_id === '') return 'Recipe ID is required.';
        return 'Recipe ID must be a positive integer.';
    }

    if (!nameOk) {
        if (name === '') return 'Recipe Name is required.';
        return 'Recipe Name must be 20 characters or fewer.';
    }

    if (!cookTimeOk) {
        return 'Cook Time must be a positive integer.';
    }

    if (!priceOk) {
        return 'Price must be a valid non-negative number.';
    }

    if (!dietitianIdOk) {
        if (dietitian_id === '') return 'Dietitian ID is required.';
        return 'Dietitian ID must be a positive integer.';
    }

    return null;
}

async function insertRecipe() {
    const recipe_id = document.getElementById('insertRecipeId').value.trim();
    const name = document.getElementById('insertRecipeName').value.trim();
    const cookTime = document.getElementById('insertCookTime').value.trim();
    const spiceLevel = document.getElementById('insertSpiceLevel').value;
    const price = document.getElementById('insertPrice').value.trim();
    const dietitian_id = document.getElementById('insertDietitianId').value.trim();
    const messageElement = document.getElementById('insertRecipeMsg');

    const validationError = validateInsertRecipeInputs(
        recipe_id,
        name,
        cookTime,
        price,
        dietitian_id
    );

    if (validationError) {
        messageElement.style.color = 'red';
        messageElement.textContent = validationError;
        return;
    }

    try {
        const response = await fetch('/insert-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipe_id: Number(recipe_id),
                name,
                cookTime: cookTime ? Number(cookTime) : null,
                spiceLevel: spiceLevel || null,
                price: price ? Number(price) : null,
                dietitian_id: Number(dietitian_id)
            })
        });

        const responseData = await response.json();
        messageElement.style.color = responseData.success ? 'green' : 'red';
        messageElement.textContent = responseData.message;

        if (!responseData.success && responseData.message.includes('Dietitian')) {
            setHelpMessage('insertDietitianIdHelp', responseData.message, 'red');
        }

        if (responseData.success) {
            document.getElementById('insertRecipeId').value = '';
            document.getElementById('insertRecipeName').value = '';
            document.getElementById('insertCookTime').value = '';
            document.getElementById('insertSpiceLevel').value = '';
            document.getElementById('insertPrice').value = '';
            document.getElementById('insertDietitianId').value = '';

            resetInsertFieldHelpMessages();
        }
    } catch (error) {
        messageElement.style.color = 'red';
        messageElement.textContent = 'Server connection failed.';
    }
}

// Update
async function loadRecipes() {
    const response = await fetch('/recipes', { method: 'GET' });
    const responseData = await response.json();
    const recipes = responseData.data;
    const container = document.getElementById('recipesTableContainer');

    if (recipes.length === 0) {
        container.innerHTML = '<p>No recipes found.</p>';
        return;
    }

    let tableHTML = `
        <table border="1">
            <thead>
                <tr>
                    <th>Recipe ID</th>
                    <th>Name</th>
                    <th>Cook Time</th>
                    <th>Spice Level</th>
                    <th>Price</th>
                    <th>Dietitian ID</th>
                    <th>Select</th>
                </tr>
            </thead>
            <tbody>
    `;

    recipes.forEach(recipe => {
        tableHTML += `
            <tr>
                <td>${recipe[0]}</td>
                <td>${recipe[1]}</td>
                <td>${recipe[2]}</td>
                <td>${recipe[3]}</td>
                <td>${recipe[4]}</td>
                <td>${recipe[5]}</td>
                <td><button onclick="selectRecipe(${recipe[0]})">Select</button></td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

function selectRecipe(recipe_id) {
    document.getElementById('selectedRecipeId').textContent = recipe_id;
    document.getElementById('updateRecipeForm').style.display = 'block';
    document.getElementById('updateRecipeName').value = '';
    document.getElementById('updateCookTime').value = '';
    document.getElementById('updateSpiceLevel').value = '';
    document.getElementById('updatePrice').value = '';
    document.getElementById('updateDietitianId').value = '';
    document.getElementById('updateRecipeMsg').textContent = '';
}

async function updateRecipe() {
    const recipe_id    = document.getElementById('selectedRecipeId').textContent;
    const name         = document.getElementById('updateRecipeName').value.trim();
    const cookTime     = document.getElementById('updateCookTime').value.trim();
    const spiceLevel   = document.getElementById('updateSpiceLevel').value;
    const price        = document.getElementById('updatePrice').value.trim();
    const dietitian_id = document.getElementById('updateDietitianId').value.trim();
    const messageElement = document.getElementById('updateRecipeMsg');

    if (!name && !cookTime && !spiceLevel && !price && !dietitian_id) {
        messageElement.style.color = 'red';
        messageElement.textContent = "Please fill in at least one field to update.";
        return;
    }

    const response = await fetch('/update-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipe_id,
            name:         name         || null,
            cookTime:     cookTime     || null,
            spiceLevel:   spiceLevel   || null,
            price:        price        || null,
            dietitian_id: dietitian_id || null
        })
    });

    const responseData = await response.json();
    messageElement.style.color = responseData.success ? 'green' : 'red';
    messageElement.textContent = responseData.message;

    if (responseData.success) {
        loadRecipes();
    }
}

// Selection
let conditionCount = 1;

function updateValueInput(fieldSelect) {
    const row = fieldSelect.closest('.condition-row');
    const valueContainer = row.querySelector('.condition-value-container');
    const operatorSelect = row.querySelector('.condition-operator');

    if (fieldSelect.value === 'name') {
        operatorSelect.style.display = 'none';
        valueContainer.innerHTML = `
            <input type="text" class="condition-value" placeholder="Enter keyword (e.g. almond)">
        `;
    } else if (fieldSelect.value === 'spiceLevel') {
        operatorSelect.style.display = 'inline';
        operatorSelect.innerHTML = `<option value="=">=</option>`;
        valueContainer.innerHTML = `
            <select class="condition-value">
                <option value="None">None</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
        `;
    } else {
        operatorSelect.style.display = 'inline';
        operatorSelect.innerHTML = `
            <option value="=">=</option>
            <option value="<">&lt;</option>
            <option value=">">&gt;</option>
            <option value="<=">&lt;=</option>
            <option value=">=">&gt;=</option>
        `;
        valueContainer.innerHTML = `
            <input type="text" class="condition-value" placeholder="Enter value">
        `;
    }
}

function addCondition(connector) {

    const allRows = document.querySelectorAll('.condition-row');
    const lastRow = allRows[allRows.length - 1];
    const andOrButtons = lastRow.querySelector('.and-or-buttons');
    if (andOrButtons) {
        andOrButtons.innerHTML = `
            <button type="button" onclick="removeCondition('${lastRow.id}')">Remove</button>
        `;
    }

    const container = document.getElementById('conditionsContainer');
    const index = conditionCount;

    const div = document.createElement('div');
    div.className = 'condition-row';
    div.id = `condition-${index}`;

    div.innerHTML = `
        <span data-connector="${connector}" style="font-weight:bold;">${connector}</span>
        <select class="condition-field" onchange="updateValueInput(this)">
            <option value="name">Name</option>
            <option value="cookTime">Cook Time</option>
            <option value="spiceLevel">Spice Level</option>
            <option value="price">Price</option>
        </select>
        <select class="condition-operator" style="display:none;">
            <option value="=">=</option>
            <option value="<">&lt;</option>
            <option value=">">&gt;</option>
            <option value="<=">&lt;=</option>
            <option value=">=">&gt;=</option>
        </select>
        <span class="condition-value-container">
            <input type="text" class="condition-value" placeholder="Enter keyword (e.g. almond)">
        </span>
        <span class="and-or-buttons">
            <button type="button" onclick="addCondition('AND')">+ AND</button>
            <button type="button" onclick="addCondition('OR')">+ OR</button>
        </span>
    `;

    container.appendChild(div);
    conditionCount++;
}

function removeCondition(id) {
    const div = document.getElementById(id);
    if (div) {
        div.remove();
        const allRows = document.querySelectorAll('.condition-row');
        if (allRows.length > 0) {
            const newLastRow = allRows[allRows.length - 1];
            const andOrButtons = newLastRow.querySelector('.and-or-buttons');
            if (andOrButtons) {
                andOrButtons.innerHTML = `
                    <button type="button" onclick="addCondition('AND')">+ AND</button>
                    <button type="button" onclick="addCondition('OR')">+ OR</button>
                `;
            }
        }
    }
}

async function searchRecipes() {
    const messageElement = document.getElementById('searchRecipeMsg');
    const resultsContainer = document.getElementById('searchResultsContainer');

    const rows = document.querySelectorAll('.condition-row');
    const conditions = [];

    rows.forEach((row) => {
        const field = row.querySelector('.condition-field').value;
        const operatorElem = row.querySelector('.condition-operator');
        const valueElem = row.querySelector('.condition-value');

        const operator = operatorElem ? operatorElem.value : '=';
        const value = valueElem ? valueElem.value.trim() : '';

        if (!value) return;

        const connectorSpan = row.querySelector('span[data-connector]');
        const connector = connectorSpan ? connectorSpan.getAttribute('data-connector') : 'AND';

        conditions.push({ field, operator, value, connector });
    });

    if (conditions.length === 0) {
        messageElement.style.color = 'red';
        messageElement.textContent = "Please add at least one condition with a value.";
        resultsContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch('/search-recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conditions })
        });

        const responseData = await response.json();

        if (!responseData.success) {
            messageElement.style.color = 'red';
            messageElement.textContent = responseData.message || "Search failed.";
            resultsContainer.innerHTML = '';
            return;
        }

        const results = responseData.data;
        messageElement.style.color = 'green';
        messageElement.textContent = `Found ${results.length} result(s).`;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No recipes match your conditions.</p>';
            return;
        }

        let tableHTML = `
            <table border="1">
                <thead>
                    <tr>
                        <th>Recipe ID</th>
                        <th>Name</th>
                        <th>Cook Time</th>
                        <th>Spice Level</th>
                        <th>Price</th>
                        <th>Dietitian ID</th>
                    </tr>
                </thead>
                <tbody>
        `;

        results.forEach(recipe => {
            tableHTML += `
                <tr>
                    <td>${recipe[0]}</td>
                    <td>${recipe[1]}</td>
                    <td>${recipe[2]}</td>
                    <td>${recipe[3]}</td>
                    <td>${recipe[4]}</td>
                    <td>${recipe[5]}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        resultsContainer.innerHTML = tableHTML;
    } catch (error) {
        messageElement.style.color = 'red';
        messageElement.textContent = "Server connection failed.";
        resultsContainer.innerHTML = '';
    }
}


// ==========================================================
// 🎨 DALI'S SECTION
// ==========================================================

// Query 4: Projection

let selectedProjectionOrder = [];

function handleProjectionCheckboxChange(event) {
    const checkbox = event.target;
    const val = checkbox.value;

    if (checkbox.checked) {
        selectedProjectionOrder.push(val);
    } else {
        selectedProjectionOrder = selectedProjectionOrder.filter(item => item !== val);
    }
    document.querySelectorAll('.proj-checkbox').forEach(cb => {
        const currentVal = cb.value;
        const currentBadge = cb.parentElement.querySelector('.order-badge');
        const index = selectedProjectionOrder.indexOf(currentVal);

        if (index !== -1) {
            currentBadge.textContent = index + 1; 
            currentBadge.style.display = 'inline';
        } else {
            currentBadge.style.display = 'none'; 
        }
    });
}


async function fetchDynamicIngredients(event) {
    event.preventDefault(); 

    const msgDiv = document.getElementById("projectionMsg");
    
    const selectedColumns = selectedProjectionOrder;

    if (selectedColumns.length === 0) {
        msgDiv.textContent = "Please select at least one column!";
        msgDiv.style.color = "red";
        return;
    }

    msgDiv.textContent = "Loading data...";
    msgDiv.style.color = "blue";

    try {
        const response = await fetch(`/api/dali/projection?cols=${selectedColumns.join(',')}`, {
            method: 'GET'
        });

        const responseData = await response.json();

        if (responseData.success) {
            msgDiv.textContent = ""; 
            buildProjectionTable(selectedColumns, responseData.data);
        } else {
            msgDiv.textContent = "Error fetching data from database.";
            msgDiv.style.color = "red";
        }
    } catch (error) {
        msgDiv.textContent = "Server connection failed.";
        msgDiv.style.color = "red";
    }
}

function buildProjectionTable(columns, data) {
    const thead = document.getElementById("projectionTableHead");
    const tbody = document.getElementById("projectionTableBody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    const headerRow = document.createElement("tr");
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.toUpperCase(); 
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    data.forEach(rowData => {
        const tr = document.createElement("tr");
        rowData.forEach(cellData => {
            const td = document.createElement("td");
            td.textContent = cellData; 
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Query 5: Delete

async function fetchMaxRecipeId() {
    const displayElem = document.getElementById("maxRecipeIdDisplay");
    try {
        const response = await fetch('/api/dali/recipe/max-id', { method: 'GET' });
        const data = await response.json();
        
        if (data.success && data.maxId) {
            displayElem.textContent = data.maxId;
        } else {
            displayElem.textContent = "No recipes found (or DB empty)";
        }
    } catch (error) {
        displayElem.textContent = "Error loading";
    }
}


async function deleteRecipe(event) {
    event.preventDefault();

    const recipeId = document.getElementById('deleteRecipeId').value;
    const msgDiv = document.getElementById('deleteResultMsg');

    if (!confirm(`Are you sure you want to delete Recipe ID: ${recipeId}? \n\nNote: Its specific ingredient measurements will also be permanently removed.`)) {
        return; 
    }

    msgDiv.textContent = "Deleting...";
    msgDiv.style.color = "blue";

    try {
        const response = await fetch(`/api/dali/recipe/${recipeId}`, {
            method: 'DELETE' 
        });

        const responseData = await response.json();

        if (responseData.success) {
            msgDiv.textContent = `Success! Recipe ${recipeId} and its associated records have been removed.`;
            msgDiv.style.color = "green";
            document.getElementById('deleteRecipeId').value = ""; 
            
            fetchMaxRecipeId(); 
        } else {
            msgDiv.textContent = responseData.message || "Failed to delete. ID might not exist.";
            msgDiv.style.color = "red";
        }
    } catch (error) {
        msgDiv.textContent = "Server connection failed.";
        msgDiv.style.color = "red";
    }
}

// Query 6: Aggregation with GROUP BY
async function countDietitianRecipes() {
    const msgDiv = document.getElementById('dietitianCountMsg');
    const table = document.getElementById('dietitianCountTable');
    const tbody = document.getElementById('dietitianCountTableBody');

    msgDiv.textContent = "Loading data...";
    msgDiv.style.color = "blue";
    table.style.display = "none"; // Hide table while loading

    try {
        const response = await fetch('/api/dali/dietitian-recipe-count', {
            method: 'GET'
        });

        const responseData = await response.json();

        if (responseData.success) {
            tbody.innerHTML = ""; // Clear old data

            if (responseData.data.length === 0) {
                msgDiv.textContent = "No recipes found in the database.";
                msgDiv.style.color = "black";
                return;
            }

            responseData.data.forEach(row => {
                const tr = document.createElement("tr");
                
                const tdId = document.createElement("td");
                tdId.textContent = row[0]; // Dietitian ID

                const tdName = document.createElement("td");
                tdName.textContent = row[1]; //Dietition Name
                
                const tdCount = document.createElement("td");
                tdCount.textContent = row[2]; // Total Recipes
                
                tr.appendChild(tdId);
                tr.appendChild(tdName);
                tr.appendChild(tdCount);
                tbody.appendChild(tr);
            });

            msgDiv.textContent = "Successfully loaded dietitian contributions!";
            msgDiv.style.color = "green";
            table.style.display = "table"; // Reveal the table
        } else {
            msgDiv.textContent = "Error fetching data from the database.";
            msgDiv.style.color = "red";
        }
    } catch (error) {
        msgDiv.textContent = "Server connection failed.";
        msgDiv.style.color = "red";
    }
}

// Query 7: Nested Aggregation
async function findFastestDietitian() {
    const msgDiv = document.getElementById('fastestDietitianMsg');
    const resultDiv = document.getElementById('fastestDietitianResult');

    msgDiv.textContent = "Analyzing all recipes...";
    msgDiv.style.color = "blue";
    resultDiv.style.display = "none";

    try {
        const response = await fetch('/api/dali/dietitian/fastest', {
            method: 'GET'
        });

        const responseData = await response.json();

        if (responseData.success && responseData.data.length > 0) {
            const data = responseData.data[0]; // Expected format: [Dietitian Name, Avg Cook Time]
            const dietitianName = data[0];
            const avgTime = Number(data[1]).toFixed(1); // Format to 1 decimal place

            msgDiv.textContent = "Found our Quick Meal Expert!";
            msgDiv.style.color = "green";
            
            resultDiv.innerHTML = `<strong>Dietitian:</strong> ${dietitianName} <br> <strong>Average Cook Time:</strong> ${avgTime} minutes`;
            resultDiv.style.display = "block";
            // Add a little styling to make it pop like a highlighted expert
            resultDiv.style.backgroundColor = "#f0f8ff"; 
            resultDiv.style.padding = "10px";
            resultDiv.style.borderLeft = "4px solid #0056b3";
        } else {
            msgDiv.textContent = "No data found or empty database.";
            msgDiv.style.color = "red";
        }
    } catch (error) {
        msgDiv.textContent = "Server connection failed.";
        msgDiv.style.color = "red";
    }
}

// ==========================================================
// 🧠 ESTHER'S SECTION
// ==========================================================
async function searchByNutrient(event) {
    event.preventDefault();

    const nutrient = document.getElementById('nutrientInput').value;

    const response = await fetch('/search-ingredient-by-nutrient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nutrient })
    });

    const responseData = await response.json();
    const tableBody = document.querySelector('#nutrientResultTable tbody');
    const msg = document.getElementById('nutrientResultMsg');

    tableBody.innerHTML = '';

    if (responseData.success) {

        if (responseData.data.length === 0) {
            msg.textContent = "No matching ingredients.";
            return;
        }

        responseData.data.forEach(row => {
            const tr = tableBody.insertRow();
            const td = tr.insertCell(0);
            td.textContent = row[0];
        });
        msg.textContent = "Results loaded!";
    } else {
        msg.textContent = "No results or error.";
    }
}

// Query 9：Aggreagation with having
// This query finds ingredients that contain a high amount of a specific nutrient
// User inputs: nutrient name and minimum threshold
async function aggregationSearch(event) {
    event.preventDefault();

    const nutrient = document.getElementById('aggNutrient').value;
    const threshold = document.getElementById('aggThreshold').value;

    const response = await fetch('/aggregation-nutrient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nutrient, threshold })
    });

    const data = await response.json();
    const tableBody = document.querySelector('#aggResultTable tbody');
    const msg = document.getElementById('aggMsg');

    tableBody.innerHTML = '';

    if (data.success) {
        if (data.data.length === 0) {
            msg.textContent = "No results.";
            return;
        }

        data.data.forEach(row => {
            const tr = tableBody.insertRow();
            tr.insertCell(0).textContent = row[0];
            tr.insertCell(1).textContent = row[1];
        });

        msg.textContent = "Loaded!";
    }
}

// Query 10: Division
// Find ingredients that appear in every beverage recipe
async function divisionQuery(event) {
    event.preventDefault();

    const response = await fetch('/division-common-beverages', {
        method: 'GET'
    });

    const responseData = await response.json();
    const tableBody = document.querySelector('#divisionResultTable tbody');
    const msg = document.getElementById('divisionMsg');

    tableBody.innerHTML = '';

    if (responseData.success) {
        if (responseData.data.length === 0) {
            msg.textContent = "No common ingredients found in all beverages.";
            return;
        }

        responseData.data.forEach(row => {
            const tr = tableBody.insertRow();
            const td = tr.insertCell(0);
            td.textContent = row[0];
        });

        msg.textContent = "Results loaded!";
    } else {
        msg.textContent = "Error loading results.";
    }
}