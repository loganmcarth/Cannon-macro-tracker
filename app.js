// =====================================================
// Cannon Macro Tracker - app code (Supabase version)
// Requires auth.js to load first (it creates supabaseClient)
// =====================================================

const now = new Date();

const today =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

// ---------- STATE (all of this comes from Supabase now) ----------

let currentUserId = null;

let allEntries = [];      // every food entry for this user
let dailyData = {};       // built from allEntries, used by history + stats
let addedFoods = [];      // today's entries
let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

let calorieGoal = 2500;
let proteinGoal = 180;

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

// ---------- HELPERS ----------

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Rebuilds dailyData, addedFoods and totals from allEntries
function rebuildFromEntries() {

    dailyData = {};

    allEntries.forEach(entry => {

        if (!dailyData[entry.date]) {
            dailyData[entry.date] = {
                totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                foods: []
            };
        }

        const day = dailyData[entry.date];

        day.foods.push(entry);
        day.totals.calories += entry.calories;
        day.totals.protein += entry.protein;
        day.totals.carbs += entry.carbs;
        day.totals.fat += entry.fat;
    });

    addedFoods = allEntries.filter(entry => entry.date === today);

    totals = dailyData[today]
        ? dailyData[today].totals
        : { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

// Redraws everything that exists on the current page
function refreshViews() {

    rebuildFromEntries();

    updateTotals();
    renderAddedFoods();

    if (document.getElementById("history")) {
        renderHistory();
    }

    if (document.getElementById("avgCalories")) {
        renderStats();
    }
}

// ---------- LOADING DATA ----------

async function loadData() {

    const { data: entries, error } = await supabaseClient
        .from("entries")
        .select("*")
        .order("date", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) {
        alert("Could not load your data: " + error.message);
        return;
    }

    allEntries = entries;

    const { data: goals } = await supabaseClient
        .from("settings")
        .select("*")
        .maybeSingle();

    if (goals) {
        calorieGoal = goals.calorie_goal;
        proteinGoal = goals.protein_goal;
    }

    refreshViews();
}

// ---------- LOGIN STATE ----------

async function handleSession(session) {

    const userId = session ? session.user.id : null;

    // ignore repeat events for the same user
    if (userId === currentUserId) return;

    currentUserId = userId;

    const authSection = document.getElementById("authSection");

    if (authSection) {
        authSection.style.display = userId ? "none" : "block";
    }

    if (userId) {

        await loadData();

    } else {

        // logged out: clear everything on screen
        allEntries = [];
        calorieGoal = 2500;
        proteinGoal = 180;
        refreshViews();
    }
}

// Fires once on page load (with any saved session) and again on login/logout
supabaseClient.auth.onAuthStateChange((event, session) => {
    setTimeout(() => handleSession(session), 0);
});

// ---------- ADDING FOOD ----------

async function addFoodEntry(name, macros) {

    if (!currentUserId) {
        alert("Please log in first");
        return null;
    }

    const { data, error } = await supabaseClient
        .from("entries")
        .insert({
            name: name,
            date: today,
            calories: Math.round(macros.calories),
            protein: Math.round(macros.protein),
            carbs: Math.round(macros.carbs),
            fat: Math.round(macros.fat)
        })
        .select()
        .single();

    if (error) {
        alert("Could not save food: " + error.message);
        return null;
    }

    allEntries.push(data);
    refreshViews();

    return data;
}

async function addFood() {

    const foodName =
        document.getElementById("foodName").value;

    const food = foods[foodName];

    if (!food) {
        alert("Food not found");
        return;
    }

    const saved = await addFoodEntry(foodName, food);

    if (saved) {
        addFoodCard(foodName, food, saved.id);
    }
}

async function addManualFood() {

    const name =
        document.getElementById("manualName").value;

    if (!name) {
        alert("Enter a food name");
        return;
    }

    const macros = {
        calories: Number(document.getElementById("manualCalories").value),
        protein: Number(document.getElementById("manualProtein").value),
        carbs: Number(document.getElementById("manualCarbs").value),
        fat: Number(document.getElementById("manualFat").value)
    };

    const saved = await addFoodEntry(name, macros);

    if (!saved) return;

    document.getElementById("manualName").value = "";
    document.getElementById("manualCalories").value = "";
    document.getElementById("manualProtein").value = "";
    document.getElementById("manualCarbs").value = "";
    document.getElementById("manualFat").value = "";

    document.getElementById("manualEntryForm").style.display = "none";
}

// ---------- REMOVING FOOD ----------

async function removeFood(food) {

    const { error } = await supabaseClient
        .from("entries")
        .delete()
        .eq("id", food.id);

    if (error) {
        alert("Could not remove food: " + error.message);
        return;
    }

    allEntries = allEntries.filter(entry => entry.id !== food.id);

    // also remove the card from the "foodList" area if it's showing
    const card = document.querySelector(
        `#foodList [data-id="${food.id}"]`
    );

    if (card) card.remove();

    refreshViews();
}

// ---------- DISPLAY ----------

function updateTotals() {

    if (!document.getElementById("calories"))
        return;

    document.getElementById("calories").textContent =
        Math.round(totals.calories);

    document.getElementById("protein").textContent =
        Math.round(totals.protein);

    updateGoals();
}

function addFoodCard(name, food, id) {

    const foodList =
        document.getElementById("foodList");

    if (!foodList) return;

    const div =
        document.createElement("div");

    div.className = "food-item";

    if (id !== undefined) {
        div.dataset.id = id;
    }

    div.innerHTML = `
        <strong>${escapeHTML(name)}</strong><br>
        Calories: ${food.calories}<br>
        Protein: ${food.protein}g<br>
        Carbs: ${food.carbs}g<br>
        Fat: ${food.fat}g
    `;

    foodList.appendChild(div);
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
            ${escapeHTML(food.name)}
            <button class="remove-btn">
                Remove
            </button>
        `;

        div.querySelector(".remove-btn")
            .addEventListener("click", () => removeFood(food));

        container.appendChild(div);
    });
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
                    .map(food => `• ${escapeHTML(food.name)}`)
                    .join("<br>")}
            `;

            header.addEventListener(
                "click",
                () => {

                    if (details.style.display === "none") {

                        details.style.display = "block";
                        header.textContent = "[-] " + date;

                    } else {

                        details.style.display = "none";
                        header.textContent = "[+] " + date;
                    }
                }
            );

            dayCard.appendChild(header);
            dayCard.appendChild(details);

            container.appendChild(dayCard);
        });
}

function renderStats() {

    const days =
        Object.values(dailyData);

    if (days.length === 0)
        return;

    const avgCalories =
        days.reduce(
            (sum, day) => sum + day.totals.calories,
            0
        ) / days.length;

    const avgProtein =
        days.reduce(
            (sum, day) => sum + day.totals.protein,
            0
        ) / days.length;

    document.getElementById("avgCalories").textContent =
        Math.round(avgCalories);

    document.getElementById("avgProtein").textContent =
        Math.round(avgProtein) + "g";
}

// ---------- GOALS ----------

function updateGoals() {

    if (!document.getElementById("remainingCalories")) {
        return;
    }

    const caloriesRemaining =
        calorieGoal - totals.calories;

    const proteinRemaining =
        proteinGoal - totals.protein;

    document.getElementById("remainingCalories").textContent =
        Math.max(0, Math.round(caloriesRemaining));

    document.getElementById("remainingProtein").textContent =
        Math.max(0, Math.round(proteinRemaining)) + "g";
}

async function saveGoals() {

    if (!currentUserId) {
        alert("Please log in first");
        return;
    }

    const newCalorieGoal =
        Number(document.getElementById("calorieGoalInput").value);

    const newProteinGoal =
        Number(document.getElementById("proteinGoalInput").value);

    if (!newCalorieGoal || !newProteinGoal) {
        alert("Enter both goals");
        return;
    }

    const { error } = await supabaseClient
        .from("settings")
        .upsert({
            user_id: currentUserId,
            calorie_goal: Math.round(newCalorieGoal),
            protein_goal: Math.round(newProteinGoal)
        });

    if (error) {
        alert("Could not save goals: " + error.message);
        return;
    }

    calorieGoal = newCalorieGoal;
    proteinGoal = newProteinGoal;

    updateGoals();

    document.getElementById("calorieGoalInput").value = "";
    document.getElementById("proteinGoalInput").value = "";
    document.getElementById("goalSettings").style.display = "none";
}

// ---------- SHOW/HIDE TOGGLES ----------

function toggleGoals() {

    const settings =
        document.getElementById("goalSettings");

    settings.style.display =
        settings.style.display === "block" ? "none" : "block";
}

function toggleManualEntry() {

    const form =
        document.getElementById("manualEntryForm");

    form.style.display =
        form.style.display === "block" ? "none" : "block";
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const goalSettings =
            document.getElementById("goalSettings");

        if (goalSettings) {
            goalSettings.style.display = "none";
        }

        const manualEntryForm =
            document.getElementById("manualEntryForm");

        if (manualEntryForm) {
            manualEntryForm.style.display = "none";
        }
    }
);

// ---------- STARTUP ----------
// Draw an empty state first; the login listener above loads real data
refreshViews();