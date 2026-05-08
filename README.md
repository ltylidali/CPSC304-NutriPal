# NutriPal Database Application

NutriPal is a full stack database web application built with Node.js, Express, JavaScript, HTML, CSS, and Oracle Database. It allows users to manage recipes, view ingredient information, and perform advanced nutrition analysis through an interactive web interface.

## Project Overview

This project is designed to demonstrate core database operations in a practical nutrition themed system. The application includes features for recipe insertion, update, deletion, selection, projection, aggregation, and division. It connects a frontend interface with an Express backend and an Oracle database.

## Tech Stack

Frontend: HTML, CSS, JavaScript

Backend: Node.js, Express.js

Database: Oracle Database

## Features

### 1. Recipe Management, Jiyang
This section supports recipe related operations.

Insert. Users can insert a new recipe by entering Recipe ID, name, cook time, spice level, price, and Dietitian ID. The system validates that the required fields are filled and checks whether the given Dietitian ID already exists.

Update. Users can load all existing recipes, choose one recipe, and update selected fields. Leaving a field blank keeps the original value unchanged.

Selection. Users can search recipes with multiple conditions. Conditions can be combined using AND and OR. Supported fields include name, cookTime, spiceLevel, and price.

### 2. Ingredient and Staff Statistics, Dali
This section supports ingredient viewing and recipe deletion.

Projection. Users can dynamically choose which columns of the Ingredient table to display, including name, calories, originRegion, and allergenFlag.

Delete. Users can delete a recipe by entering its Recipe ID. The system also displays the current maximum Recipe ID as a helper for the user interface.

### 3. Advanced Nutrition Analysis, Esther
This section supports nutrient based analysis.

Search by Nutrient. Users can enter a nutrient name and view all ingredients that contain that nutrient.

Aggregation with HAVING. Users can search for ingredients whose total amount of a specific nutrient exceeds a given threshold.

Division. Users can find ingredients that appear in every beverage recipe.

## Project Structure

appController.js handles routing and API endpoints.

appService.js contains Oracle database logic and SQL queries.

scripts.js handles frontend event listeners, form submission, fetch requests, and rendering results.

index.html provides the web page structure and user interface.

styles.css provides styling for the frontend.

.env stores database connection credentials.

## Main API Endpoints

### Connection
GET `/check-db-connection`  
Checks whether the backend can connect to the Oracle database.

### Jiyang Section
POST `/insert-recipe`  
Inserts a new recipe.

GET `/recipes`  
Fetches all recipes.

POST `/update-recipe`  
Updates an existing recipe.

POST `/search-recipes`  
Searches recipes based on multiple conditions.

### Dali Section
GET `/api/dali/projection?cols=name,calories`  
Fetches selected Ingredient columns dynamically.

GET `/api/dali/recipe/max-id`  
Fetches the maximum Recipe ID.

DELETE `/api/dali/recipe/:id`  
Deletes a recipe by ID.

### Esther Section
POST `/search-ingredient-by-nutrient`  
Finds ingredients containing a given nutrient.

POST `/aggregation-nutrient`  
Finds ingredients whose nutrient total exceeds a threshold.

GET `/division-common-beverages`  
Finds ingredients that appear in all beverages.

## Database Operations Demonstrated

Insert into Recipe

Update Recipe dynamically

Delete from Recipe

Projection on Ingredient with selected columns

Selection on Recipe with multiple conditions

Aggregation with GROUP BY and HAVING

Division using nested NOT EXISTS

## Setup Instructions

Run the following command:

./remote-start.sh

## Notes

This project originally started from a template that included DemoTable example code. The unused demo frontend routes, backend routes, and service functions were removed from the final NutriPal version, while the database connection status checker was kept for debugging.

The frontend uses JavaScript fetch requests to communicate with backend routes. The backend uses OracleDB connection pooling for efficient database access.

## Contributors

Jiyang, Recipe Management and Filtering

Dali, Ingredient Statistics and Recipe Deletion

Esther, Advanced Nutrition Analysis

## Summary

NutriPal is a database driven nutrition management application that demonstrates how a full stack system can integrate frontend interaction, backend routing, SQL queries, and Oracle database operations into one complete project.