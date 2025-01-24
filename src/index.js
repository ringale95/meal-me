

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
        console.log(pantry.ingredients);

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

    weekWeight.innerText += `Last 7 entry average weight: ${average.toPrecision(4) } kg`;
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


