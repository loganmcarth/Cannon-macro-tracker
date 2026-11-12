async function getMenu() {
    
    try {

        const menuResponse =
            await fetch(
                "https://cannon-macro-backend.onrender.com/menu"
            );

        console.log("Menu status:", menuResponse.status);

        const menuData = await menuResponse.json();

        const container =
            document.getElementById("foodContainer");

        container.innerHTML = "";

        console.log(menuData[0].location_id);
        console.log(menuData[0].serve_date);


        for (const meal of menuData) {
        
            for (const category of meal.categories) {

                const stationSection =
                    document.createElement("div");

                stationSection.dataset.station =
                    (
                        meal.meal_name +
                        " " +
                        category.name
                        ).toLowerCase();
                    
                stationSection.className =
                    "station-section";

                const categoryHeader =
                    document.createElement("h2");

                categoryHeader.textContent =
                    "[+] " + meal.meal_name + " - " + category.name;

                categoryHeader.style.cursor = "pointer";

                stationSection.appendChild(categoryHeader);

                const foodsContainer =
                    document.createElement("div");

                foodsContainer.style.display =
                    "none";
                    
                stationSection.appendChild(foodsContainer);

                categoryHeader.addEventListener(
                    "click",
                    () => {

                        if (
                            foodsContainer.style.display ===
                            "none"
                        ) {

                            foodsContainer.style.display =
                                "block";

                            categoryHeader.textContent =
                                "[-] " +
                                meal.meal_name +
                                " - " +
                                category.name;

                        } else {

                            foodsContainer.style.display =
                                "none";

                            categoryHeader.textContent =
                                "[+] " +
                                meal.meal_name +
                                " - " +
                                category.name;

                        }

                    }
                );

                for (const food of category.menu_items) {
                    
                    const foodDiv =
                        document.createElement("div");

                    const macros = getMacros(food);

                    foodDiv.innerHTML = `
                        <h3>${food.name}</h3>

                        <p>
                            Calories:
                            ${Math.round(macros.calories)}
                        </p>

                        <p>
                            Protein:
                            ${Math.round(macros.protein)}g
                        </p>

                        <label>Portion:</label>

                        <select class="portion-select">
                            <option value="1">1 Serving</option>
                            <option value="0.5">1/2 Serving</option>
                            <option value="0.33">1/3 Serving</option>
                            <option value="0.25">1/4 Serving</option>
                            <option value="2">2 Servings</option>
                        </select>

                        <button class="add-btn">
                            Add
                        </button>
                    `;

                    const addButton =
                        foodDiv.querySelector(".add-btn");

                    const portionSelect =
                        foodDiv.querySelector(".portion-select");

                    addButton.addEventListener("click", () => {

                        const multiplier =
                            Number(portionSelect.value);

                        const adjustedMacros = {
                            calories:
                                macros.calories * multiplier,

                            protein:
                                macros.protein * multiplier,

                            carbs:
                                macros.carbs * multiplier,

                            fat:
                                macros.fat * multiplier
                        };

                        addToTotals(adjustedMacros);

                        addedFoods.push({
                            name: `${food.name} (${multiplier}x)`,
                            calories: adjustedMacros.calories,
                            protein: adjustedMacros.protein,
                            carbs: adjustedMacros.carbs,
                            fat: adjustedMacros.fat
                        });
                        
                        localStorage.setItem(
                            "addedFoods",
                            JSON.stringify(addedFoods)
                        );

                        renderAddedFoods();

                        saveDay();
                        
                        console.log(
                            `${food.name} added`
                        );
                    });
                                        
                    foodDiv.dataset.foodName =
                        food.name.toLowerCase();
                        
                    foodsContainer.appendChild(foodDiv);

                }
                
                container.appendChild(stationSection);
            }

        }

    } catch (error) {
        console.error("ERROR:", error);
    }
}

function addToTotals(macros) {

    totals.calories += macros.calories;
    totals.protein += macros.protein;
    totals.carbs += macros.carbs;
    totals.fat += macros.fat;

    updateTotals();
    saveTotals();
}

function getMacros(food) {

    const calories =
        food.nutrients.find(
            n => n.name === "Calories"
        )?.amount || 0;

    const protein =
        food.nutrients.find(
            n => n.name === "Protein"
        )?.amount || 0;

    const carbs =
        food.nutrients.find(
            n => n.name === "Carbohydrates"
        )?.amount || 0;

    const fat =
        food.nutrients.find(
            n => n.name === "Total Fat"
        )?.amount || 0;

    return {
        calories,
        protein,
        carbs,
        fat
    };

}

document.addEventListener("input", (event) => {

    if (event.target.id !== "searchBox")
        return;

    const search =
        event.target.value.toLowerCase();

    const stations =
        document.querySelectorAll(
            ".station-section"
        );

    stations.forEach(station => {

        let hasMatch = false;

        const foods =
            station.querySelectorAll(
                "[data-food-name]"
            );

        foods.forEach(food => {

            const name =
                food.dataset.foodName || "";

            if (
                name.includes(search)
            ) {

                food.style.display = "";

                hasMatch = true;

            } else {

                food.style.display = "none";
            }
        });

        if (search === "") {

            station.style.display = "";

            const foodsContainer =
                station.querySelector("div");

            if (foodsContainer) {

                foodsContainer.style.display =
                    "none";
            }

        } else if (hasMatch) {

            station.style.display = "";

            const foodsContainer =
                station.querySelector("div");

            if (foodsContainer) {

                foodsContainer.style.display =
                    "block";
            }

        } else {

            station.style.display =
                "none";
        }

    });

});