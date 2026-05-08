const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

//delete 5

// ==========================================================
// 🚀 JIYANG'S SECTION: Recipe Management & Filtering Routes
// ==========================================================

//Insert
router.post("/insert-recipe", async (req, res) => {
    const { recipe_id, name, cookTime, spiceLevel, price, dietitian_id } = req.body;

    // checking 
    if (!recipe_id || !name || !dietitian_id) {
        return res.status(400).json({
            success: false,
            message: "Recipe ID, Name, and Dietitian ID are required."
        });
    }

    // checking if dietitian exsits
    const dietitianExists = await appService.checkDietitianExists(dietitian_id);
    if (!dietitianExists) {
        return res.status(400).json({
            success: false,
            message: `Dietitian with ID ${dietitian_id} does not exist. Please enter a valid Dietitian ID.`
        });
    }

    // execute insert
    const insertResult = await appService.insertRecipe(
        recipe_id, name, cookTime || null, spiceLevel || null, price || null, dietitian_id
    );

    if (insertResult) {
        res.json({ success: true, message: "Recipe inserted successfully!" });
    } else {
        res.status(500).json({
            success: false,
            message: "Insert failed. Recipe ID may already exist."
        });
    }
});

//Update
router.get('/recipes', async (req, res) => {
    const recipes = await appService.fetchAllRecipes();
    res.json({ data: recipes });
});

router.post('/update-recipe', async (req, res) => {
    const { recipe_id, name, cookTime, spiceLevel, price, dietitian_id } = req.body;

    if (!recipe_id) {
        return res.status(400).json({
            success: false,
            message: "Recipe ID is required."
        });
    }

    if (dietitian_id) {
        const dietitianExists = await appService.checkDietitianExists(dietitian_id);
        if (!dietitianExists) {
            return res.status(400).json({
                success: false,
                message: `Dietitian with ID ${dietitian_id} does not exist.`
            });
        }
    }

    const updateResult = await appService.updateRecipe(
        recipe_id, name, cookTime, spiceLevel, price, dietitian_id
    );

    if (updateResult) {
        res.json({ success: true, message: "Recipe updated successfully!" });
    } else {
        res.status(500).json({
            success: false,
            message: "Update failed. Please check your inputs."
        });
    }
});

//Selection
router.post('/search-recipes', async (req, res) => {
    const { conditions } = req.body;

    if (!Array.isArray(conditions)) {
        return res.status(400).json({
            success: false,
            message: "Invalid input format."
        });
    }

    const results = await appService.searchRecipes(conditions);
    res.json({ success: true, data: results });
});



// ==========================================================
// 🎨 DALI'S SECTION: Ingredient & Staff Statistics Routes
// ==========================================================

// Query 4: Projection - Dynamic Ingredient Columns
router.get('/api/dali/projection', async (req, res) => {
    const { cols } = req.query;
    
    if (!cols) {
        return res.status(400).json({ success: false, message: "No columns selected" });
    }

    const columnArray = cols.split(',');

    const data = await appService.getDynamicIngredients(columnArray);

    if (data !== null) {
        res.json({ success: true, data: data });
    } else {
        res.status(500).json({ success: false });
    }
});

// Helper: Fetch the maximum Recipe ID for frontend UI
router.get('/api/dali/recipe/max-id', async (req, res) => {
    const maxId = await appService.getMaxRecipeId();
    if (maxId !== null) {
        res.json({ success: true, maxId: maxId });
    } else {
        res.status(500).json({ success: false });
    }
});

// Query 5: Delete a Recipe by ID (Triggers ON DELETE CASCADE)
router.delete('/api/dali/recipe/:id', async (req, res) => {
    const recipeId = req.params.id;
    
    const success = await appService.deleteRecipe(recipeId);

    if (success) {
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "Delete failed. The ID might not exist." });
    }
});

// Query 6: Aggregation with GROUP BY
router.get('/api/dali/dietitian-recipe-count', async (req, res) => {
    const result = await appService.countRecipesByDietitian();

    if (result) {
        res.json({ success: true, data: result });
    } else {
        res.status(500).json({ success: false, message: "Failed to fetch aggregation data." });
    }
});

// Query 7: Nested Aggregation
router.get('/api/dali/dietitian/fastest', async (req, res) => {
    const result = await appService.getFastestDietitian();

    if (result) {
        res.json({ success: true, data: result });
    } else {
        res.status(500).json({ success: false, message: "Failed to fetch fastest dietitian." });
    }
});

// ==========================================================
// 🧠 ESTHER'S SECTION: Advanced Nutrition Analysis Routes
// ==========================================================
router.post('/search-ingredient-by-nutrient', async (req, res) => {
    const { nutrient } = req.body;
    const result = await appService.searchIngredientByNutrient(nutrient);

    if (result) {
        res.json({ success: true, data: result });
    } else {
        res.status(500).json({ success: false });
    }
});

// Query 9: Aggregation with having
router.post('/aggregation-nutrient', async (req, res) => {
    const { nutrient, threshold } = req.body;
    const result = await appService.aggregationNutrient(nutrient, threshold);

    if (result) {
        res.json({ success: true, data: result });
    } else {
        res.status(500).json({ success: false });
    }
});

//Query 10: Division
router.get('/division-common-beverages', async (req, res) => {
    const result = await appService.findCommonIngredientsInAllBeverages();

    if (result) {
        res.json({ success: true, data: result });
    } else {
        res.status(500).json({ success: false });
    }
});

//default last sentence
module.exports = router;