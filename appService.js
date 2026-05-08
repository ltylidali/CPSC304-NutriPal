const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}


//delete 6


// ==========================================================
// 🚀 JIYANG'S SECTION: 
// ==========================================================

// Insert
async function checkDietitianExists(dietitianId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(*) FROM Dietitian WHERE dietitian_id = :dietitian_id`,
            [dietitianId]
        );
        return result.rows[0][0] > 0;
    }).catch(() => false);
}

async function insertRecipe(recipe_id, name, cookTime, spiceLevel, price, dietitian_id) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Recipe (recipe_id, name, cookTime, spiceLevel, price, dietitian_id)
             VALUES (:recipe_id, :name, :cookTime, :spiceLevel, :price, :dietitian_id)`,
            [recipe_id, name, cookTime, spiceLevel, price, dietitian_id],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => false);
}

// Update
async function fetchAllRecipes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT recipe_id, name, cookTime, spiceLevel, price, dietitian_id
             FROM Recipe
             ORDER BY recipe_id ASC`
        );
        return result.rows;
    }).catch(() => []);
}

async function updateRecipe(recipe_id, name, cookTime, spiceLevel, price, dietitian_id) {
    return await withOracleDB(async (connection) => {
        const fields = [];
        const values = [];

        if (name !== null && name !== '') {
            fields.push('name = :name');
            values.push(name);
        }
        if (cookTime !== null && cookTime !== '') {
            fields.push('cookTime = :cookTime');
            values.push(cookTime);
        }
        if (spiceLevel !== null && spiceLevel !== '') {
            fields.push('spiceLevel = :spiceLevel');
            values.push(spiceLevel);
        }
        if (price !== null && price !== '') {
            fields.push('price = :price');
            values.push(price);
        }
        if (dietitian_id !== null && dietitian_id !== '') {
            fields.push('dietitian_id = :dietitian_id');
            values.push(dietitian_id);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(recipe_id);

        const result = await connection.execute(
            `UPDATE Recipe SET ${fields.join(', ')} WHERE recipe_id = :recipe_id`,
            values,
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => false);
}

// Selection
function buildRecipeConditionClause(condition, bindIndex) {
    const allowedFields = ['name', 'cookTime', 'spiceLevel', 'price'];
    const allowedOperators = ['=', '<', '>', '<=', '>='];

    if (!allowedFields.includes(condition.field)) {
        return null;
    }

    if (condition.field === 'name') {
        return {
            clause: `LOWER(name) LIKE LOWER(:val${bindIndex})`,
            bindValue: `%${condition.value}%`
        };
    }

    if (condition.field === 'spiceLevel') {
        return {
            clause: `spiceLevel = :val${bindIndex}`,
            bindValue: condition.value
        };
    }

    if (!allowedOperators.includes(condition.operator)) {
        return null;
    }

    return {
        clause: `${condition.field} ${condition.operator} :val${bindIndex}`,
        bindValue: condition.value
    };
}

async function searchRecipes(conditions) {
    return await withOracleDB(async (connection) => {
        const baseSql = `
            SELECT recipe_id, name, cookTime, spiceLevel, price, dietitian_id
            FROM Recipe
        `;

        if (!Array.isArray(conditions) || conditions.length === 0) {
            const result = await connection.execute(baseSql);
            return result.rows;
        }

        const validConditions = [];
        const bindObj = {};
        let bindIndex = 0;

        for (const condition of conditions) {
            const built = buildRecipeConditionClause(condition, bindIndex);
            if (!built) {
                continue;
            }

            const normalizedConnector =
                condition.connector && condition.connector.toUpperCase() === 'OR' ? 'OR' : 'AND';

            validConditions.push({
                connector: normalizedConnector,
                clause: built.clause,
                bindKey: `val${bindIndex}`
            });

            bindObj[`val${bindIndex}`] = built.bindValue;
            bindIndex++;
        }

        if (validConditions.length === 0) {
            const result = await connection.execute(baseSql);
            return result.rows;
        }

        // Step 1: group consecutive OR clauses together
        const groups = [];
        let currentGroup = {
            connectorToPreviousGroup: null,
            clauses: [validConditions[0].clause]
        };

        for (let i = 1; i < validConditions.length; i++) {
            const current = validConditions[i];

            if (current.connector === 'OR') {
                currentGroup.clauses.push(current.clause);
            } else {
                groups.push(currentGroup);
                currentGroup = {
                    connectorToPreviousGroup: 'AND',
                    clauses: [current.clause]
                };
            }
        }

        groups.push(currentGroup);

        // Step 2: build grouped WHERE clause
        let whereClause = '';

        groups.forEach((group, index) => {
            const groupedClause =
                group.clauses.length > 1
                    ? `(${group.clauses.join(' OR ')})`
                    : group.clauses[0];

            if (index === 0) {
                whereClause += groupedClause;
            } else {
                whereClause += ` AND ${groupedClause}`;
            }
        });

        const finalSql = `${baseSql} WHERE ${whereClause}`;

        const result = await connection.execute(finalSql, bindObj);
        return result.rows;
    }).catch((err) => {
        console.error("Error in searchRecipes:", err);
        return [];
    });
}


// ==========================================================
// 🎨 DALI'S SECTION: 
// ==========================================================
// Query 4: Dynamic Projection 
async function getDynamicIngredients(columns) {
    return await withOracleDB(async (connection) => {
        const allowedColumns = ['name', 'calories', 'originRegion', 'allergenFlag'];
        const safeColumns = columns.filter(col => allowedColumns.includes(col));

        if (safeColumns.length === 0) return [];

        const sql = `SELECT ${safeColumns.join(', ')} FROM Ingredient`;
        
        console.log("Executing SQL: ", sql); 

        const result = await connection.execute(sql);
        return result.rows;
    }).catch((err) => {
        console.error("Error in getDynamicIngredients:", err);
        return null;
    });
}

// Helper: Fetch the maximum Recipe ID for the frontend UI
async function getMaxRecipeId() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT MAX(recipe_id) FROM Recipe`);
        return result.rows[0][0]; // Returns the max ID, or null if the table is empty
    }).catch((err) => {
        console.error("Error in getMaxRecipeId:", err);
        return null;
    });
}

// Query 5: Delete a recipe by ID (Cascade delete applies automatically)
async function deleteRecipe(recipeId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Recipe WHERE recipe_id = :recipeId`,
            [recipeId],
            { autoCommit: true } // AutoCommit is strictly required for INSERT/UPDATE/DELETE
        );
        // Return true if at least one row was deleted
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.error("Error in deleteRecipe:", err);
        return false;
    });
}

// Query 6: Aggregation with GROUP BY
// Counts the number of recipes each dietitian has contributed
async function countRecipesByDietitian() {
    return await withOracleDB(async (connection) => {
        const sql = `
        SELECT r.dietitian_id, d.name, COUNT(r.recipe_id) 
        FROM Recipe r, Dietitian d
        WHERE r.dietitian_id = d.dietitian_id
        GROUP BY r.dietitian_id, d.name
    `;
        const result = await connection.execute(sql);
        return result.rows;
    }).catch((err) => {
        console.error("Error in countRecipesByDietitian:", err);
        return [];
    });
}

// Query 7: Nested Aggregation with GROUP BY
// Finds the dietitian with the lowest average cook time across their recipes.
async function getFastestDietitian() {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT d.name, AVG(r.cookTime) AS avg_cook_time
            FROM Dietitian d, Recipe r
            WHERE d.dietitian_id = r.dietitian_id
            GROUP BY d.dietitian_id, d.name
            HAVING AVG(r.cookTime) <= ALL (
                SELECT AVG(cookTime)
                FROM Recipe
                GROUP BY dietitian_id
            )
        `;
        const result = await connection.execute(sql);
        return result.rows;
    }).catch((err) => {
        console.error("Error in getFastestDietitian:", err);
        return null;
    });
}

// ==========================================================
// 🧠 ESTHER'S SECTION: 
// ==========================================================

async function searchIngredientByNutrient(nutrientName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT I.name
            FROM Nutrient N
            JOIN IngredientContainsNutrient ICN 
                ON N.nutrient_id = ICN.nutrient_id
            JOIN Ingredient I 
                ON ICN.ingredient_id = I.ingredient_id
            WHERE LOWER(N.nutrient_name) = LOWER(:nutrientName)
            `,
            [nutrientName]
        );

        return result.rows;
    }).catch(() => {
        return null;
    });
}

// Query 9
// This query finds ingredients that contain a high amount of a specific nutrient
// User inputs: nutrient name and minimum threshold
async function aggregationNutrient(nutrientName, threshold) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT I.name, SUM(ICN.quantity_g)
            FROM Nutrient N
            JOIN IngredientContainsNutrient ICN 
                ON N.nutrient_id = ICN.nutrient_id
            JOIN Ingredient I 
                ON ICN.ingredient_id = I.ingredient_id
            WHERE LOWER(N.nutrient_name) = LOWER(:nutrientName)
            GROUP BY I.name
            HAVING SUM(ICN.quantity_g) > :threshold
            `,
            { nutrientName: nutrientName, threshold: threshold }
        );

        return result.rows;
    }).catch(() => null);
}
//Query 10: Divison
async function findCommonIngredientsInAllBeverages() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT I.name
            FROM Ingredient I
            WHERE NOT EXISTS (
                SELECT B.recipe_id
                FROM Beverage B
                WHERE NOT EXISTS (
                    SELECT *
                    FROM RecipeIncludesIngredient RII
                    WHERE RII.recipe_id = B.recipe_id
                    AND RII.ingredient_id = I.ingredient_id
                )
            )
            `
        );

        return result.rows;
    }).catch(() => {
        return null;
    });
}

// ==========================================================
// 📦 MODULE EXPORTS (大家把写好的函数名字统加到这里导出)
// ==========================================================
module.exports = {
    testOracleConnection,
    //delete 7

    // --- Jiyang's Exports ---
    checkDietitianExists,   // Insert
    insertRecipe,           // Insert
    fetchAllRecipes,        // Update
    updateRecipe,           // Update
    searchRecipes,          // Selection
    
    // --- Dali's Exports ---
    getDynamicIngredients,  // Projection
    getMaxRecipeId,         // Delete (Helper)
    deleteRecipe,           // Delete
    countRecipesByDietitian,// Aggregation (GROUP BY)
    getFastestDietitian,    // Nested Aggregation with GROUP BY

    // --- Esther's Exports ---
    searchIngredientByNutrient, //
    aggregationNutrient, //Aggregation with having
    findCommonIngredientsInAllBeverages, //Division
};


