-- Drop old tables to reset the database and avoid "table already exists" errors.
DROP TABLE VeganMeal CASCADE CONSTRAINTS;
DROP TABLE ChildrenMeal CASCADE CONSTRAINTS;
DROP TABLE MealType CASCADE CONSTRAINTS;
DROP TABLE NutrientGoal CASCADE CONSTRAINTS;
DROP TABLE MealSet CASCADE CONSTRAINTS;
DROP TABLE Beverage CASCADE CONSTRAINTS;
DROP TABLE RecipeIncludesIngredient CASCADE CONSTRAINTS;
DROP TABLE Recipe CASCADE CONSTRAINTS;
DROP TABLE Dietitian CASCADE CONSTRAINTS;
DROP TABLE Member CASCADE CONSTRAINTS;
DROP TABLE IngredientSubstitutesIngredient CASCADE CONSTRAINTS;
DROP TABLE IngredientContainsNutrient CASCADE CONSTRAINTS;
DROP TABLE Ingredient CASCADE CONSTRAINTS;
DROP TABLE Nutrient CASCADE CONSTRAINTS;

-- Table: Nutrient
-- Stores nutrient information
CREATE TABLE Nutrient (
    nutrient_id INT,
    nutrient_name VARCHAR(100) NOT NULL,
    unit VARCHAR(50),
    dailyMaxIntake INT,
    essentialFlag NUMBER(1),
    PRIMARY KEY (nutrient_id)
);

-- Table: Ingredient
-- Stores ingredient information
CREATE TABLE Ingredient (
    ingredient_id INT,
    name VARCHAR(100) NOT NULL,
    calories INT,
    originRegion VARCHAR(100),
    allergenFlag NUMBER(1),
    PRIMARY KEY (ingredient_id)
);

-- Table: IngredientContainsNutrient
-- Junction table between Ingredient and Nutrient
CREATE TABLE IngredientContainsNutrient (
    nutrient_id INT,
    ingredient_id INT,
    quantity_g DECIMAL NOT NULL,
    PRIMARY KEY (nutrient_id, ingredient_id),
    FOREIGN KEY (nutrient_id) REFERENCES Nutrient(nutrient_id)
        ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
        ON DELETE CASCADE
);
-- ON DELETE CASCADE: if a nutrient is deleted, all ingredientcontainsnutrient rows referencing it are removed.
-- ON DELETE CASCADE: if an ingredient is deleted, all ingredientcontainsnutrient rows referencing it are removed.
-- We do not set ON UPDATE because Oracle does not support it; primary keys are immutable, so updates are not needed

-- Table: IngredientSubstitutesIngredient
-- Stores 1:1 substitution relationships between ingredients
CREATE TABLE IngredientSubstitutesIngredient (
    original_ingredient_id INT,
    substitute_ingredient_id INT,
    PRIMARY KEY (original_ingredient_id),
    UNIQUE (substitute_ingredient_id),
    FOREIGN KEY (original_ingredient_id) REFERENCES Ingredient(ingredient_id)
        ON DELETE CASCADE,
    FOREIGN KEY (substitute_ingredient_id) REFERENCES Ingredient(ingredient_id)
        ON DELETE CASCADE
);
-- ON DELETE CASCADE: if either ingredient is deleted, the substitution row is removed.
-- We do not set ON UPDATE because Oracle does not support it; primary keys are immutable, so updates are not needed

-- Table: Member
-- Stores member information
CREATE TABLE Member (
    member_id INT,
    name VARCHAR(100) NOT NULL,
    birth_date DATE,
    email VARCHAR(150) NOT NULL,
    PRIMARY KEY (member_id),
    UNIQUE (email)
);

-- Table: Dietitian
-- Stores dietitian information
CREATE TABLE Dietitian (
    dietitian_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    credential_level VARCHAR(30),
    year_of_experience INT
);

-- Table: Recipe
-- Stores recipe information, including Dietitian FK
CREATE TABLE Recipe(
    recipe_id    INTEGER,
    name         VARCHAR(20) NOT NULL,
    cookTime     INTEGER,
    spiceLevel   VARCHAR(20),
    price       DECIMAL,
    dietitian_id INTEGER,
    PRIMARY KEY (recipe_id),
    FOREIGN KEY (dietitian_id) REFERENCES Dietitian(dietitian_id)
);
-- We do not set ON DELETE CASCADE here because if a Dietitian is removed from the system, we want to retain their Recipes

-- Table: RecipeIncludesIngredient
-- Junction table for Recipe and Ingredient with amount per 100g
CREATE TABLE RecipeIncludesIngredient(
    recipe_id       INTEGER,
    ingredient_id   INTEGER,
    amount_per_100g DECIMAL NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id) 
        ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id)
);
-- ON DELETE CASCADE: if a recipe is deleted, the corresponding rows in this table are removed.
-- We do not set ON UPDATE because Oracle does not support it; primary keys are immutable, so updates are not needed

-- Table: Beverage
-- Subclass of Recipe storing beverage-specific attributes
CREATE TABLE Beverage(
    recipe_id         INTEGER,
    servingSizeMl     DECIMAL,
    caffeineMg        DECIMAL,
    servedTemperature VARCHAR(20),
    PRIMARY KEY (recipe_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipe(recipe_id)
        ON DELETE CASCADE
);
-- ON DELETE CASCADE: if a recipe is deleted, the corresponding beverage row is removed.
-- We do not set ON UPDATE because Oracle does not support it; primary keys are immutable, so updates are not needed

-- Table: MealSet
-- Stores meal set information
CREATE TABLE MealSet(
    set_name           VARCHAR(20),
    total_calorie_goal INTEGER,
    target_audience    VARCHAR(20),
    price              DECIMAL,
    PRIMARY KEY (set_name)
);

-- Table: NutrientGoal
-- Stores target health goal for a priority nutrient
CREATE TABLE NutrientGoal (
    priority_nutrient VARCHAR(50) PRIMARY KEY,
    target_health_goal VARCHAR(100) 
);

-- Table: MealType
-- Stores health meal type information
CREATE TABLE MealType (
    type_name VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255),
    priority_nutrient VARCHAR(50),
    FOREIGN KEY (priority_nutrient)
        REFERENCES NutrientGoal(priority_nutrient)
);
-- No ON DELETE CASCADE: deleting a NutrientGoal should not automatically remove related MealType records to prevent unintended data loss.
-- We do not set ON UPDATE because Oracle does not support it; primary keys are immutable, so updates are not needed

-- Table: ChildrenMeal
-- Stores children-specific meal information
CREATE TABLE ChildrenMeal (
    type_name VARCHAR(50) PRIMARY KEY,
    recommendedAgeMin INT,
    recommendedAgeMax INT,
    textureLevel VARCHAR(50),
    FOREIGN KEY (type_name)
        REFERENCES MealType(type_name)
        ON DELETE CASCADE
);
-- ON DELETE CASCADE: if a meal type is deleted from MealType, the corresponding row in this table is removed.
-- We do not set ON UPDATE because Oracle does not support it; primary keys are immutable, so updates are not needed

-- Table: VeganMeal
-- Stores vegan meal-specific information
CREATE TABLE VeganMeal (
    type_name VARCHAR(50) PRIMARY KEY,
    plantProteinPerServing DECIMAL,
    requiresVeganCertification NUMBER(1),
    containsEgg NUMBER(1),
    FOREIGN KEY (type_name)
        REFERENCES MealType(type_name)
        ON DELETE CASCADE
);
-- ON DELETE CASCADE: if a meal type is deleted from MealType, the corresponding row in this table is removed.
-- We do not set ON UPDATE because Oracle does not support it; primary keys are immutable, so updates are not needed.



/* ========================= */
/* INSERT TEST DATA          */
/* ========================= */

/* Nutrient */
INSERT INTO Nutrient VALUES (1, 'Protein', 'g', 200, 1);
INSERT INTO Nutrient VALUES (2, 'Carbohydrate', 'g', 300, 1);
INSERT INTO Nutrient VALUES (3, 'Fat', 'g', 70, 1);
INSERT INTO Nutrient VALUES (4, 'Vitamin C', 'mg', 1000, 1);
INSERT INTO Nutrient VALUES (5, 'Sodium', 'mg', 2300, 0);

/* Ingredient */
INSERT INTO Ingredient VALUES (1, 'Chicken Breast', 165, 'Canada', 0);
INSERT INTO Ingredient VALUES (2, 'Broccoli', 55, 'USA', 0);
INSERT INTO Ingredient VALUES (3, 'Almond Milk', 40, 'USA', 1);
INSERT INTO Ingredient VALUES (4, 'Brown Rice', 216, 'China', 0);
INSERT INTO Ingredient VALUES (5, 'Egg', 78, 'Canada', 1);
INSERT INTO Ingredient VALUES (6, 'Tofu', 60, 'Canada', 1);
INSERT INTO Ingredient VALUES (7, 'Matcha Powder', 320, 'Japan', 0);
INSERT INTO Ingredient VALUES (8, 'Coffee Beans', 2, 'Brazil', 0);
INSERT INTO Ingredient VALUES (9, 'Cocoa Powder', 228, 'Ghana', 0);
INSERT INTO Ingredient VALUES (10, 'Mixed Berries', 50, 'Canada', 0);


/* IngredientContainsNutrient */
INSERT INTO IngredientContainsNutrient VALUES (1, 1, 31);
INSERT INTO IngredientContainsNutrient VALUES (2, 4, 45);
INSERT INTO IngredientContainsNutrient VALUES (3, 1, 3);
INSERT INTO IngredientContainsNutrient VALUES (4, 2, 89);
INSERT INTO IngredientContainsNutrient VALUES (5, 5, 62);

/* IngredientSubstitutesIngredient */
INSERT INTO IngredientSubstitutesIngredient VALUES (1, 3);
INSERT INTO IngredientSubstitutesIngredient VALUES (3, 1);
INSERT INTO IngredientSubstitutesIngredient VALUES (4, 2);
INSERT INTO IngredientSubstitutesIngredient VALUES (2, 4);
INSERT INTO IngredientSubstitutesIngredient VALUES (6, 5);

/* Member */
INSERT INTO Member VALUES (1, 'Alice Chen', DATE '1995-04-12', 'alice@email.com');
INSERT INTO Member VALUES (2, 'Bob Li', DATE '1990-08-23', 'bob@email.com');
INSERT INTO Member VALUES (3, 'Cathy Wang', DATE '1988-11-15', 'cathy@email.com');
INSERT INTO Member VALUES (4, 'David Zhang', DATE '2000-01-05', 'david@email.com');
INSERT INTO Member VALUES (5, 'Eva Liu', DATE '1993-07-19', 'eva@email.com');

/* Dietitian */
INSERT INTO Dietitian VALUES (1, 'Dr. Green', 'Senior', 15);
INSERT INTO Dietitian VALUES (2, 'Dr. Brown', 'Intermediate', 8);
INSERT INTO Dietitian VALUES (3, 'Dr. White', 'Junior', 3);
INSERT INTO Dietitian VALUES (4, 'Dr. Black', 'Senior', 12);
INSERT INTO Dietitian VALUES (5, 'Dr. Blue', 'Intermediate', 6);

/* Recipe */
INSERT INTO Recipe VALUES (1, 'Chicken Bowl', 30, 'Medium', 12.99, 1);
INSERT INTO Recipe VALUES (2, 'Veggie Rice', 25, 'Low', 10.50, 2);
INSERT INTO Recipe VALUES (3, 'Almond Shake', 10, 'None', 6.99, 3);
INSERT INTO Recipe VALUES (4, 'Egg Stir Fry', 20, 'High', 11.25, 4);
INSERT INTO Recipe VALUES (5, 'Rice Soup', 40, 'Low', 9.75, 5);
INSERT INTO Recipe VALUES (6, 'Matcha Latte', 5, 'None', 5.50, 1);
INSERT INTO Recipe VALUES (7, 'Ginger Tea', 8, 'Low', 4.00, 2);
INSERT INTO Recipe VALUES (8, 'Iced Coffee', 3, 'None', 4.50, 3);
INSERT INTO Recipe VALUES (9, 'Hot Cocoa', 10, 'None', 5.00, 4);
INSERT INTO Recipe VALUES (10, 'Berry Smoothie', 12, 'None', 6.50, 5);

/* RecipeIncludesIngredient */
-- 1. Chicken Bowl: 
INSERT INTO RecipeIncludesIngredient VALUES (1, 1, 150); 
INSERT INTO RecipeIncludesIngredient VALUES (1, 4, 100);

-- 2. Veggie Rice: 
INSERT INTO RecipeIncludesIngredient VALUES (2, 2, 120);
INSERT INTO RecipeIncludesIngredient VALUES (2, 4, 100);
INSERT INTO RecipeIncludesIngredient VALUES (2, 6, 50);

-- 3. Almond Shake: 
INSERT INTO RecipeIncludesIngredient VALUES (3, 3, 200);

-- 4. Egg Stir Fry: 
INSERT INTO RecipeIncludesIngredient VALUES (4, 5, 80);
INSERT INTO RecipeIncludesIngredient VALUES (4, 2, 100);

-- 5. Rice Soup: 
INSERT INTO RecipeIncludesIngredient VALUES (5, 4, 50);

-- 6. Matcha Latte: 
INSERT INTO RecipeIncludesIngredient VALUES (6, 3, 180);/* 3 is almond milk, will appear in divison */
INSERT INTO RecipeIncludesIngredient VALUES (6, 7, 10); /* Division: findCommonIngredientsInAllBeverages */

-- 7. Ginger Tea: 
INSERT INTO RecipeIncludesIngredient VALUES (7, 3, 150); 

-- 8. Iced Coffee: 
INSERT INTO RecipeIncludesIngredient VALUES (8, 3, 150);
INSERT INTO RecipeIncludesIngredient VALUES (8, 8, 15);

-- 9. Hot Cocoa:
INSERT INTO RecipeIncludesIngredient VALUES (9, 3, 180);
INSERT INTO RecipeIncludesIngredient VALUES (9, 9, 20);

-- 10. Berry Smoothie: 
INSERT INTO RecipeIncludesIngredient VALUES (10, 3, 150);
INSERT INTO RecipeIncludesIngredient VALUES (10, 10, 80);

/* Beverage */
INSERT INTO Beverage VALUES (6, 350, 20, 'Cold');
INSERT INTO Beverage VALUES (7, 250, 0, 'Hot');
INSERT INTO Beverage VALUES (8, 300, 5, 'Cold');
INSERT INTO Beverage VALUES (9, 200, 10, 'Hot');
INSERT INTO Beverage VALUES (10, 400, 15, 'Cold');

/* MealSet */
INSERT INTO MealSet VALUES ('Fitness Set', 1800, 'Adults', 29.99);
INSERT INTO MealSet VALUES ('Kids Set', 1200, 'Children', 19.99);
INSERT INTO MealSet VALUES ('Vegan Set', 1500, 'Vegan', 24.99);
INSERT INTO MealSet VALUES ('Low Carb Set', 1300, 'Adults', 22.50);
INSERT INTO MealSet VALUES ('Family Set', 2200, 'Family', 39.99);

/* NutrientGoal */
INSERT INTO NutrientGoal VALUES ('Protein', 'Muscle Growth');
INSERT INTO NutrientGoal VALUES ('Carbohydrate', 'Energy Supply');
INSERT INTO NutrientGoal VALUES ('Fat', 'Hormone Regulation');
INSERT INTO NutrientGoal VALUES ('Vitamin C', 'Immune Support');
INSERT INTO NutrientGoal VALUES ('Sodium', 'Electrolyte Balance');

/* MealType */
INSERT INTO MealType VALUES ('High Protein', 'Rich in protein foods', 'Protein');
INSERT INTO MealType VALUES ('Energy Boost', 'High carb meals', 'Carbohydrate');
INSERT INTO MealType VALUES ('Low Fat', 'Reduced fat content', 'Fat');
INSERT INTO MealType VALUES ('Immune Care', 'Vitamin C focused', 'Vitamin C');
INSERT INTO MealType VALUES ('Balanced Diet', 'Well balanced nutrition', 'Sodium');
INSERT INTO MealType VALUES ('Super Growth', 'High protein for growth', 'Protein');
INSERT INTO MealType VALUES ('Brain Fuel', 'Healthy fats for brain development', 'Fat');
INSERT INTO MealType VALUES ('Tummy Comfort', 'Gentle on digestion', 'Sodium');
INSERT INTO MealType VALUES ('Strong Bones', 'Micronutrients for bone health', 'Vitamin C');
INSERT INTO MealType VALUES ('Bright Vision', 'Essential vitamins for eyesight', 'Vitamin C');
INSERT INTO MealType VALUES ('Garden Fresh', 'Daily dose of greens', 'Vitamin C');
INSERT INTO MealType VALUES ('Nature Fuel', 'Plant-based energy source', 'Carbohydrate');
INSERT INTO MealType VALUES ('Green Power', 'High plant protein', 'Protein');
INSERT INTO MealType VALUES ('Harvest Bowl', 'Seasonal vegetable mix', 'Carbohydrate');
INSERT INTO MealType VALUES ('Pure Plant', 'Clean plant-based fats', 'Fat');

/* ChildrenMeal */
INSERT INTO ChildrenMeal VALUES ('Super Growth', 5, 11, 'Medium');
INSERT INTO ChildrenMeal VALUES ('Brain Fuel', 4, 10, 'Soft');
INSERT INTO ChildrenMeal VALUES ('Tummy Comfort', 2, 7, 'Smooth');
INSERT INTO ChildrenMeal VALUES ('Strong Bones', 6, 13, 'Medium');
INSERT INTO ChildrenMeal VALUES ('Bright Vision', 4, 9, 'Soft');

/* VeganMeal */
INSERT INTO VeganMeal VALUES ('Garden Fresh', 16, 1, 0);
INSERT INTO VeganMeal VALUES ('Nature Fuel', 24, 1, 1);
INSERT INTO VeganMeal VALUES ('Green Power', 19, 1, 0);
INSERT INTO VeganMeal VALUES ('Harvest Bowl', 21, 1, 0);
INSERT INTO VeganMeal VALUES ('Pure Plant', 14, 1, 0);

COMMIT;