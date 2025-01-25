

try {
    const formElem = document.getElementById("ingrForm");
    formElem.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(formElem);
        let obj = {
            name: formData.get("name"),
            description: formData.get("description"),
            servingSize: formData.get("servingsize"),
            servingUnit: formData.get("servingunit"),
            calories: formData.get("calories"),
            macros: {
                protein: formData.get("protein"),
                carbs: formData.get("carbs"),
                fats: formData.get("fats"),
            }
        }
        pantry.ingredients.push(obj);
        localStorage.setItem("pantry", JSON.stringify(pantry));
        formElem.reset();
    })
} catch (error) {

}

const getPantry = async () => {
    const url = "https://raw.githubusercontent.com/ringale95/meal-me/refs/heads/main/pantry.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        pantry = result;
        localStorage.setItem("pantry", JSON.stringify(pantry));
    } catch (error) {
        console.log("Error fetching data from github!");
        return { meals: [], ingredients: [] };
    }
}

let pantry = JSON.parse(localStorage.getItem("pantry"));
pantry || getPantry();

let weights = JSON.parse(localStorage.getItem("weights")) || {};


const createIngredientCard = (ingredient) => {
    return `<div class="card mb-3">
        <div class="card-body">
            <h2 class="card-title">${ingredient.name}</h5>
            <h6 class="card-subtitle mb-2 text-secondary">Kcal:${ingredient.calories} | P:${ingredient.macros.protein}g C:${ingredient.macros.carbs}g F:${ingredient.macros.fats}g | Serving Size: ${ingredient.servingSize} ${ingredient.servingUnit}</h6>
            <p class="card-text mt-3">${ingredient.description}</p>
        </div>
    </div>`
}

try {
    const ingredientContainer = document.getElementById("ingredient-container");
    pantry.ingredients.forEach((ingredient) => {
        ingredientContainer.innerHTML += createIngredientCard(ingredient);
    })
} catch (error) {
    console.error(error);
}


const createWeightRow = (weight, date) => {
    return `<tr>
        <td>${date}</td>
        <td>${weight} kg</td>
    </tr>`
}

const getSortedDates = () => Object.keys(weights).sort((date1, date2) => {
    const [day1, month1, year1] = date1.split('-').map(Number);
    const [day2, month2, year2] = date2.split('-').map(Number);

    const parsedDate1 = new Date(year1, month1, day1);
    const parsedDate2 = new Date(year2, month2, day2);

    return parsedDate2 - parsedDate1; // Sort in descending order
});

const loadWeightTable = () => {
    const tableBody = document.getElementById("weight-tablebody");
    tableBody.innerHTML = '';
    if (getSortedDates().length == 0) {
        Array.of(1, 2, 3, 4, 5).forEach(_ => {
            tableBody.innerHTML += createWeightRow('NA', `NA`);
        });
        return;
    }

    getSortedDates().splice(0, 5).forEach((date) => {
        const [day, month, year] = date.split('-');
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        tableBody.innerHTML += createWeightRow(weights[date], `${day}-${months[month]}-${year}`);
    })
}
const lastSevenAverage = () => {
    const weekWeight = document.getElementById("avg-week-weight");
    weekWeight.innerText = '';
    let sum = 0;
    let count = 1;
    getSortedDates().splice(0, 7).forEach((date) => {
        sum += Number(weights[date]);
        count++;
    })
    let average = sum / count;

    weekWeight.innerText += `Last 7 entry average weight: ${average.toPrecision(4)} kg`;
}
try {
    const wtForm = document.getElementById("weight-form");
    wtForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(wtForm);
        let date = new Date();
        let currentDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
        if (weights[currentDate] != undefined) {
            alert("Weight already registered for today!");
            return;
        }
        weights[currentDate] = formData.get("weight");
        localStorage.setItem("weights", JSON.stringify(weights));
        alert('Weight logged successfully');
        loadWeightTable();
        lastSevenAverage();
    })
} catch (error) {
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("weight-tablebody") && loadWeightTable();
    document.getElementById("weight-tablebody") && lastSevenAverage()
});

const removeRow = (id) => {
    const [name, calories,] = id.split("-");
    const getRow = document.getElementById(id);
    let previousSize = getRow.getAttribute('value');

    getRow.remove();
    console.log(previousSize);
    renderTotalCalories(-calories * previousSize);
}

const updateServingSize = (event, id, calories) => {

    const inputServingSize = document.getElementById(id);
    let newSize = event.target.value || 0;

    // Compute Total calories and render it
    let previousServingSize = inputServingSize.getAttribute('value')
    let previousCalories = calories * previousServingSize;
    let newCalories = calories * newSize;

    renderTotalCalories(- previousCalories + newCalories);


    // Update the new Previous value
    inputServingSize.setAttribute('value', newSize);
}

const renderSelectedItemAsRow = (name, calories, size, unit) => {
    return `<tr id="${name}-${calories}-${size}" value="${size}">
                <td>${name}</td>
                <td>${calories} kcal</td>
                <td>
                    <input oninput="updateServingSize(event, '${name}-${calories}-${size}', '${calories}')" style="width: 40%;" type="number" name="serving-size-${name}" value="${size}"></input>
                </td>
                <td>${unit}</td>
                <td onclick="removeRow('${name}-${calories}-${size}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                </svg></td>
            </tr>`
}


let totalCalories = 0;

const renderTotalCalories = (calories) => {
    totalCalories += calories;
    const totalCalorieSpan = document.getElementById("total-calories");
    totalCalorieSpan.innerText = `Total Calories : ${totalCalories} Kcal`;
}

const addSelectedIngredientToTable = (name, calories, size, unit) => {
    const tableSelectedIngredient = document.getElementById("selected-ingredient-table");
    tableSelectedIngredient.innerHTML += renderSelectedItemAsRow(name, calories, size, unit);
    renderTotalCalories(calories * size);
}

const displayListIngredient = (ingredient) => {
    return ` <li onclick="addSelectedIngredientToTable('${ingredient.name}','${ingredient.calories}', '${ingredient.servingSize}', '${ingredient.servingUnit}' )" class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
            <div class="fw-bold">${ingredient.name}</div>
            ${ingredient.description}
            </div>
            <span class="badge bg-primary rounded-pill">${ingredient.calories} kcal</span>
        </li>`
}

const displayFilteredIngredients = (ingredients) => {
    const ingredientContainer = document.getElementById("filtered-ingredients");
    ingredientContainer.innerHTML = '';
    ingredients.forEach(ingredient =>
        ingredientContainer.innerHTML += displayListIngredient(ingredient))
}

const searchIngredientByKeyword = (keyword) => {
    if (!keyword)
        return [];
    const filteredIngredients = pantry.ingredients
        .filter(ingredient => ingredient.name.toLowerCase().includes(keyword.toLowerCase()));
    return filteredIngredients;
}

try {
    const filterInput = document.getElementById("keyword");
    filterInput.addEventListener("input", (event) => {
        let keyword = event.target.value;
        const filteredIngredients = searchIngredientByKeyword(keyword);
        displayFilteredIngredients(filteredIngredients);
    })
} catch (error) {
}

try {

    const mealFormElem = document.getElementById("mealForm");
    mealFormElem.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(mealFormElem);
        let meal = {
            mealName: formData.get("mealname"),
            description: formData.get("description"),
            servingSize: formData.get("servingsize"),
            ingredients: [],
        }
        //processing dynamic ingredients:
        for (const pair of formData.entries()) {
            const key = pair[0];
            const servingSize = pair[1];
            if (key.includes("serving-size-")) {
                const name = key.split("-")[2];
                let ingredient = {
                    name,
                    servingSize
                };
                meal.ingredients.push(ingredient);
            }
        }

        pantry.meals.push(meal);
        localStorage.setItem("pantry", JSON.stringify(pantry));
        mealFormElem.reset();
        alert('Meal added succesfully!');

    })

} catch (error) {

}




