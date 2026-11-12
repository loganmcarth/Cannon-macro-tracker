const now = new Date();

const today =
    `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}-${String(
        now.getDate()
    ).padStart(2, "0")}`;

let dailyData = JSON.parse(
    localStorage.getItem("dailyData")
) || {};

let totals = JSON.parse(
    localStorage.getItem("totals")
) || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
};

let addedFoods = JSON.parse(
    localStorage.getItem("addedFoods")
) || [];

const savedDate =
    localStorage.getItem("currentDate");

if (savedDate !== today) {

    localStorage.setItem(
        "currentDate",
        today
    );

    totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    addedFoods = [];

    localStorage.setItem(
        "totals",
        JSON.stringify(totals)
    );

    localStorage.setItem(
        "addedFoods",
        JSON.stringify([])
    );
}

let calorieGoal =
    Number(
        localStorage.getItem(
            "calorieGoal"
        )
    ) || 2500;

let proteinGoal =
    Number(
        localStorage.getItem(
            "proteinGoal"
        )
    ) || 180;

const foods = {
    "Buffalo Chicken Tacos": {
        calories: 495,
        protein: 18,
        carbs: 31,
        fat: 31
    },

    "Yellow Corn": {
        calories: 132,
        protein: 4,
        carbs: 29,
        fat: 2
    },

    "White Dinner Roll": {
        calories: 160,
        protein: 5,
        carbs: 30,
        fat: 2
    }
};

function addFood() {

    const foodName =
        document.getElementById("foodName").value;

    const food = foods[foodName];

    if (!food) {
        alert("Food not found");
        return;
    }

    totals.calories += food.calories;
    totals.protein += food.protein;
    totals.carbs += food.carbs;
    totals.fat += food.fat;

    updateTotals();
    saveTotals();

    addFoodCard(foodName, food);
}

function updateTotals() {

    if (!document.getElementById("calories"))
    return;


    document.getElementById("calories").textContent =
        Math.round(totals.calories);

    document.getElementById("protein").textContent =
        Math.round(totals.protein);
    
    updateGoals();
}

function addFoodCard(name, food) {

    const foodList =
        document.getElementById("foodList");

    const div =
        document.createElement("div");

    div.className = "food-item";

    div.innerHTML = `
        <strong>${name}</strong><br>
        Calories: ${food.calories}<br>
        Protein: ${food.protein}g<br>
        Carbs: ${food.carbs}g<br>
        Fat: ${food.fat}g
    `;

    foodList.appendChild(div);
}

function saveTotals() {

    localStorage.setItem(
        "totals",
        JSON.stringify(totals)
    );

    saveDay();
}

function renderAddedFoods() {

    const container =
        document.getElementById("addedFoods");

    if (!container) return;

    container.innerHTML = "";

    addedFoods.forEach(food => {

        const div =
            document.createElement("div");

        div.innerHTML = `
            ${food.name}
            <button class="remove-btn">
                Remove
            </button>
        `;

        const removeButton =
            div.querySelector(".remove-btn");

        removeButton.addEventListener(
            "click",
            () => {

                totals.calories -= food.calories;
                totals.protein -= food.protein;
                totals.carbs -= food.carbs;
                totals.fat -= food.fat;

                addedFoods =
                    addedFoods.filter(
                        item => item !== food
                    );

                updateTotals();

                localStorage.setItem(
                    "addedFoods",
                    JSON.stringify(addedFoods)
                );

                saveTotals();
                saveDay();

                renderAddedFoods();
            }
        );

        container.appendChild(div);

    });
}

function saveDay() {

    dailyData[today] = {
        totals: totals,
        foods: addedFoods
    };

    localStorage.setItem(
        "dailyData",
        JSON.stringify(dailyData)
    );
}

function renderHistory() {

    const container =
        document.getElementById("history");

    if (!container) return;

    container.innerHTML = "";

    Object.entries(dailyData)
        .reverse()
        .forEach(([date, day]) => {

            const dayCard =
                document.createElement("div");

            dayCard.className =
                "history-day";

            const header =
                document.createElement("h3");

            header.textContent =
                "[+] " + date;

            header.style.cursor =
                "pointer";

            const details =
                document.createElement("div");

            details.style.display =
                "none";

            details.innerHTML = `
                Calories:
                ${Math.round(day.totals.calories)}
                <br>

                Protein:
                ${Math.round(day.totals.protein)}g
                <br><br>

                Foods:
                <br>

                ${day.foods
                    .map(
                        food =>
                            `• ${food.name}`
                    )
                    .join("<br>")}
            `;

            header.addEventListener(
                "click",
                () => {

                    if (
                        details.style.display ===
                        "none"
                    ) {

                        details.style.display =
                            "block";

                        header.textContent =
                            "[-] " + date;

                    } else {

                        details.style.display =
                            "none";

                        header.textContent =
                            "[+] " + date;
                    }
                }
            );

            dayCard.appendChild(header);
            dayCard.appendChild(details);

            container.appendChild(dayCard);
        });
}

function addManualFood() {

    const name =
        document.getElementById("manualName").value;

    const calories =
        Number(
            document.getElementById(
                "manualCalories"
            ).value
        );

    const protein =
        Number(
            document.getElementById(
                "manualProtein"
            ).value
        );

    const carbs =
        Number(
            document.getElementById(
                "manualCarbs"
            ).value
        );

    const fat =
        Number(
            document.getElementById(
                "manualFat"
            ).value
        );

    const macros = {
        calories,
        protein,
        carbs,
        fat
    };

    addToTotals(macros);

    addedFoods.push({
        name,
        calories,
        protein,
        carbs,
        fat
    });

    localStorage.setItem(
        "addedFoods",
        JSON.stringify(addedFoods)
    );

    renderAddedFoods();
    saveDay();

    document.getElementById("manualName").value = "";

    document.getElementById("manualCalories").value = "";

    document.getElementById("manualProtein").value = "";

    document.getElementById("manualCarbs").value = "";

    document.getElementById("manualFat").value = "";

    document.getElementById(
        "manualEntryForm"
    ).style.display = "none";
}

function updateGoals() {

    if (
        !document.getElementById(
            "remainingCalories"
        )
    ) {
        return;
    }

    const caloriesRemaining =
        calorieGoal - totals.calories;

    const proteinRemaining =
        proteinGoal - totals.protein;

    document.getElementById(
        "remainingCalories"
    ).textContent =
        Math.max(
            0,
            Math.round(caloriesRemaining)
        );

    document.getElementById(
        "remainingProtein"
    ).textContent =
        Math.max(
            0,
            Math.round(proteinRemaining)
        ) + "g";
}

function renderStats() {

    const days =
        Object.values(dailyData);

    if (days.length === 0)
        return;

    const avgCalories =
        days.reduce(
            (sum, day) =>
                sum + day.totals.calories,
            0
        ) / days.length;

    const avgProtein =
        days.reduce(
            (sum, day) =>
                sum + day.totals.protein,
            0
        ) / days.length;

    document.getElementById(
        "avgCalories"

    ).textContent =
        Math.round(avgCalories);

    document.getElementById(
        "avgProtein"
    ).textContent =
        Math.round(avgProtein) + "g";
}

function saveGoals() {

    calorieGoal =
        Number(
            document.getElementById(
                "calorieGoalInput"
            ).value
        );

    proteinGoal =
        Number(
            document.getElementById(
                "proteinGoalInput"
            ).value
        );

    localStorage.setItem(
        "calorieGoal",
        calorieGoal
    );

    localStorage.setItem(
        "proteinGoal",
        proteinGoal
    );

    updateGoals();

    document.getElementById(
        "calorieGoalInput"
    ).value = "";

    document.getElementById(
        "proteinGoalInput"
    ).value = "";

    document.getElementById(
        "goalSettings"
    ).style.display = "none";
}

function toggleGoals() {

    const settings =
        document.getElementById(
            "goalSettings"
        );

    if (
        settings.style.display ===
        "block"
    ) {

        settings.style.display =
            "none";

    } else {

        settings.style.display =
            "block";
    }
}

function toggleManualEntry() {

    const form =
        document.getElementById(
            "manualEntryForm"
        );

    if (
        form.style.display ===
        "block"
    ) {

        form.style.display =
            "none";

    } else {

        form.style.display =
            "block";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const goalSettings =
            document.getElementById(
                "goalSettings"
            );

        if (goalSettings) {

            goalSettings.style.display =
                "none";

        }

        const manualEntryForm =
            document.getElementById(
                "manualEntryForm"
            );

        if (manualEntryForm) {

            manualEntryForm.style.display =
                "none";

        }

    }
);

updateTotals();
renderAddedFoods();
updateGoals();
if (
    document.getElementById("history")
) {
    renderHistory();
}

if (
    document.getElementById("avgCalories")
) {
    renderStats();
}