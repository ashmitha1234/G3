// --- Configuration ---
const DATA_STORAGE_KEY = 'messData'; // Key for localStorage
const COST_PER_PLAN_MEAL = 60;           // Cost per meal in your currency
const MONTHLY_PLAN_BASE_CHARGE = 0;  // Optional: Add a fixed monthly base charge if needed

// --- Data Structures (Global Array & Menu) ---
let studentsData = [];

// Define the food menu
const menu = [
    { id: 'breakfast', name: 'Breakfast', price: 60 },
    { id: 'lunch', name: 'Lunch', price: 100 },
    { id: 'dinner', name: 'Dinner', price: 100 },
    { id: 'snacks', name: 'Snacks (Tea/Coffee + 1 item)', price: 30 },
    { id: 'juice', name: 'Fresh Juice', price: 40 },
    // Add more menu items here
];


// --- DOM Elements ---
const messagesDiv = document.getElementById('messages');
const studentsTableBody = document.querySelector('#students-table tbody');
const menuItemsContainer = document.getElementById('menu-items-container'); // New DOM element
const orderOutputDiv = document.getElementById('order-output'); // New DOM element
const recordRollNoInput = document.getElementById('record-roll-no'); // Added reference
const recordStudentInfoDiv = document.getElementById('record-student-info'); // Added reference


// --- File Operations (using localStorage) ---
function loadData() {
    const data = localStorage.getItem(DATA_STORAGE_KEY);
    if (data) {
        try {
            studentsData = JSON.parse(data);
            // Ensure data types are correct after loading from string
            studentsData.forEach(student => {
                student.mess_enrolled = student.mess_enrolled === true || student.mess_enrolled === 'true'; // Handle boolean
                student.meals_taken_this_month = parseInt(student.meals_taken_this_month) || 0; // Handle integer
                // Add new property if it doesn't exist (for backward compatibility)
                student.individual_charges_this_month = parseFloat(student.individual_charges_this_month) || 0;
            });
             showMessage('Data loaded from local storage.', 'success');
        } catch (e) {
            console.error("Error loading data from localStorage:", e);
            studentsData = []; // Start fresh if data is corrupted
             showMessage('Error loading data. Starting fresh.', 'error');
        }
    } else {
         studentsData = [];
         showMessage('No data found in local storage. Starting fresh.', 'info');
    }
     renderStudentsTable(); // Render table after loading
}

function saveData() {
    try {
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(studentsData));
        // showMessage('Data saved to local storage.', 'success'); // Optional: too many messages
    } catch (e) {
         console.error("Error saving data to localStorage:", e);
         showMessage('Error saving data!', 'error');
    }
}

// --- UI Functions ---
function showMessage(message, type = 'info') {
    messagesDiv.textContent = message;
    messagesDiv.className = 'messages ' + type; // Clear previous classes and add new type
    messagesDiv.style.display = 'block';
    // Optional: Hide message after a few seconds
    // setTimeout(() => { messagesDiv.style.display = 'none'; }, 5000);
}

function clearMessages() {
    messagesDiv.textContent = '';
    messagesDiv.className = 'messages';
    messagesDiv.style.display = 'none';
}


function showSection(sectionId) {
    // Hide all sections first
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
     clearMessages(); // Clear messages when switching sections
     // Clear specific info divs
     document.getElementById('manage-student-info').innerHTML = '';
     document.getElementById('record-student-info').innerHTML = '';
     document.getElementById('bill-details').innerHTML = '';
     document.getElementById('student-details').innerHTML = '';
     // Clear order output when navigating away or to order section
     if(orderOutputDiv) { // Check if element exists
       orderOutputDiv.innerHTML = '';
}

// Special actions when showing specific sections
    if (sectionId === 'order-food-section') {
        renderMenuForOrdering(); // Render the menu when the order section is shown
        // Clear any previous quantity inputs
        document.querySelectorAll('#menu-items-container input[type="number"]').forEach(input => input.value = 0);
        document.getElementById('order-roll-no').value = ''; // Clear roll no input
    } else if (sectionId === 'view-all-section') {
        renderStudentsTable(); // Ensure table is updated when viewing all
    } else if (sectionId === 'record-meal-section') {
        recordRollNoInput.value = ''; // Clear roll no input
    }
}


function renderStudentsTable() {
    studentsTableBody.innerHTML = ''; // Clear current table body

    if (studentsData.length === 0) {
        studentsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No students registered yet.</td></tr>';
        return;
    }

    studentsData.forEach(student => {
        const row = studentsTableBody.insertRow();
        row.insertCell(0).textContent = student.roll_no;
        row.insertCell(1).textContent = student.name;
        row.insertCell(2).textContent = student.room_no;
        row.insertCell(3).textContent = student.mess_enrolled ? 'Yes' : 'No';
        row.insertCell(4).textContent = student.meals_taken_this_month;
        row.insertCell(5).textContent = student.individual_charges_this_month.toFixed(2); // Display with 2 decimal places
        
         // Add Delete button
         const actionsCell = row.insertCell(6);
         const deleteButton = document.createElement('button');
         deleteButton.textContent = 'Delete';
         deleteButton.classList.add('delete-btn'); // Add a class for styling
         deleteButton.onclick = () => deleteStudent(student.roll_no); // Use arrow function to pass roll_no
         actionsCell.appendChild(deleteButton);
    });
}

// --- Core Functions ---
function findStudent(rollNo) {
    return studentsData.find(student => student.roll_no.toLowerCase() === rollNo.toLowerCase()); // Case-insensitive search
}  

function findStudentIndex(rollNo) {
    return studentsData.findIndex(student => student.roll_no.toLowerCase() === rollNo.toLowerCase()); // Case-insensitive search
}

function addStudent(event) {
    event.preventDefault(); // Prevent default form submission

    const rollNoInput = document.getElementById('add-roll-no');
    const nameInput = document.getElementById('add-name');
    const roomNoInput = document.getElementById('add-room-no');

    const roll_no = rollNoInput.value.trim();
    const name = nameInput.value.trim();
    const room_no = roomNoInput.value.trim();

    if (!roll_no || !name) {
        showMessage("Roll Number and Name are required.", 'error');
        return;
    }

    if (findStudent(roll_no)) {
        showMessage(`Student with Roll Number ${roll_no} already exists.`, 'error');
        return;
    }

    const newStudent = {
        roll_no: roll_no,
        name: name,
        room_no: room_no,
        mess_enrolled: false, // Default to not enrolled
        meals_taken_this_month: 0, // Plan meals taken
        individual_charges_this_month: 0 // Charges for individual orders
    };

    studentsData.push(newStudent);
    saveData();
    renderStudentsTable();
    showMessage(`Student '${name}' added successfully.`, 'success');

    // Clear form
    rollNoInput.value = '';
    nameInput.value = '';
    roomNoInput.value = '';
}

function deleteStudent(rollNo) {
    const studentIndex = findStudentIndex(rollNo);

    if (studentIndex === -1) {
        showMessage(`Student with Roll Number ${rollNo} not found.`, 'error');
        return;
    }

    const student = studentsData[studentIndex];

    const confirmDeletion = confirm(`Are you sure you want to delete student "${student.name}" (Roll No: ${student.roll_no})? This action cannot be undone.`);

    if (confirmDeletion) {
        studentsData.splice(studentIndex, 1); // Remove the student from the array
        saveData();
        renderStudentsTable();
        showMessage(`Student "${student.name}" deleted successfully.`, 'success');
    } else {
        showMessage(`Deletion of student "${student.name}" cancelled.`, 'info');
    }
}


function updateRecordMealInfo(student) {
    // Helper function to update the info div in the record meal section
    recordStudentInfoDiv.innerHTML = `
        <p>Student: ${student.name}</p>
        <p>Monthly Plan Enrolled: ${student.mess_enrolled ? 'Yes' : 'No'}</p>
        <p>Plan Meals Taken This Month: ${student.meals_taken_this_month}</p>
    `;
}


function recordMeal() {
    // This function is now specifically for recording a meal consumed under the monthly plan.
    const roll_no = recordRollNoInput.value.trim();
    recordStudentInfoDiv.innerHTML = ''; // Clear previous info

    if (!roll_no) {
        showMessage("Please enter a Roll Number.", 'error');
        return;
    }

    const student = findStudent(roll_no);

    if (!student) {
        showMessage(`Student with Roll Number ${roll_no} not found.`, 'error');
        return;
    }

     updateRecordMealInfo(student); // Show initial info

    if (!student.mess_enrolled) {
        showMessage(`Student ${student.name} is not enrolled in the mess. Cannot record plan meal.`, 'warning');
        return;
    }

    student.meals_taken_this_month++;
    saveData();
    renderStudentsTable();
    showMessage(`Plan meal recorded for ${student.name}.`, 'success');

     updateRecordMealInfo(student); // Update info after recording meal

    // Optional: Clear input after successful operation
    // recordRollNoInput.value = '';
}

function reduceMealFromInput() {
    // Helper function to get roll number and call reduceMeal
    const roll_no = recordRollNoInput.value.trim();
    reduceMeal(roll_no);
}

function reduceMeal(rollNo) {
    const roll_no = rollNo.trim(); // Ensure rollNo is trimmed
    recordStudentInfoDiv.innerHTML = ''; // Clear previous info

    if (!roll_no) {
        showMessage("Please enter a Roll Number.", 'error');
        return;
    }

    const student = findStudent(roll_no);

    if (!student) {
        showMessage(`Student with Roll Number ${roll_no} not found.`, 'error');
        return;
    }

    updateRecordMealInfo(student); // Show initial info

    if (student.meals_taken_this_month <= 0) {
        showMessage(`${student.name} has no plan meals recorded to reduce.`, 'warning');
        return;
    }

    student.meals_taken_this_month--;
    saveData();
    renderStudentsTable();
    showMessage(`Plan meal count reduced by 1 for ${student.name}.`, 'success');

    updateRecordMealInfo(student); // Update info after reducing meal
}


// --- Menu and Ordering Functions ---
function renderMenuForOrdering() {
    if (!menuItemsContainer) return; // Exit if container element not found

    menuItemsContainer.innerHTML = ''; // Clear previous menu

    menu.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('menu-item');

        const itemNameSpan = document.createElement('span');
        itemNameSpan.textContent = `${item.name} (${item.price.toFixed(2)})`;

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '0';
        quantityInput.value = '0';
        quantityInput.dataset.itemId = item.id; // Store item ID to retrieve later
        quantityInput.dataset.itemPrice = item.price; // Store price for calculation

        itemDiv.appendChild(itemNameSpan);
        itemDiv.appendChild(quantityInput);

        menuItemsContainer.appendChild(itemDiv);
    });
}

function placeOrder() {
    const rollNoInput = document.getElementById('order-roll-no');
    const roll_no = rollNoInput.value.trim();
    orderOutputDiv.innerHTML = ''; // Clear previous output

    if (!roll_no) {
        showMessage("Please enter your Roll Number to place an order.", 'error');
        return;
    }

    const student = findStudent(roll_no);

    if (!student) {
        showMessage(`Student with Roll Number ${roll_no} not found.`, 'error');
        return;
    }

    const quantityInputs = document.querySelectorAll('#menu-items-container input[type="number"]');
    let currentOrderCost = 0;
    let itemsOrderedCount = 0;
    const orderedItemsSummary = [];

    quantityInputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const price = parseFloat(input.dataset.itemPrice);
        const itemId = input.dataset.itemId;
        const menuItem = menu.find(item => item.id === itemId); // Find original menu item for name

        if (quantity > 0 && menuItem) {
            currentOrderCost += quantity * price;
            itemsOrderedCount += quantity; // Count total number of items
            orderedItemsSummary.push(`${menuItem.name} x ${quantity}`);
        }
    });

    if (currentOrderCost === 0) {
        showMessage("Please select items and specify quantity to order.", 'warning');
        return;
    }

    // Simulate Payment Confirmation
    const confirmOrder = confirm(`Confirm order for ${student.name}?\n\nItems: ${orderedItemsSummary.join(', ')}\nTotal Cost: ${currentOrderCost.toFixed(2)}`);

    if (confirmOrder) {
        // Update student's individual charges
        student.individual_charges_this_month += currentOrderCost;

        saveData();
        renderStudentsTable(); // Update table to show new charges

        orderOutputDiv.innerHTML = `
            <p>--- Order Confirmation ---</p>
            <p><strong>Student:</strong> ${student.name} (Roll: ${student.roll_no})</p>
            <p><strong>Items Ordered:</strong> ${orderedItemsSummary.join(', ')}</p>
            <p><strong>Order Total:</strong> ${currentOrderCost.toFixed(2)}</p>
            <p>This amount has been added to your individual mess charges for the month.</p>
            <p>---------------------------</p>
        `;
        showMessage("Order placed successfully!", 'success');

        // Clear the form inputs after successful order
        rollNoInput.value = '';
        quantityInputs.forEach(input => input.value = 0);

    } else {
        showMessage("Order cancelled.", 'info');
    }
}

function calculateBill() {
    const rollNoInput = document.getElementById('bill-roll-no');
    const roll_no = rollNoInput.value.trim();
    const billDetailsDiv = document.getElementById('bill-details');
    billDetailsDiv.innerHTML = ''; // Clear previous details

     if (!roll_no) {
        showMessage("Please enter a Roll Number.", 'error');
        return;
    }

    const student = findStudent(roll_no);

    if (!student) {
        showMessage(`Student with Roll Number ${roll_no} not found.`, 'error');
        return;
    }

    let planMealCost = 0;
    if (student.mess_enrolled) {
        planMealCost = student.meals_taken_this_month * COST_PER_PLAN_MEAL;
    }

    const individualMealCost = student.individual_charges_this_month;
    const totalBill = MONTHLY_PLAN_BASE_CHARGE + planMealCost + individualMealCost; // Include base charge if any

    let billSummary = `
        <p>--- Mess Bill for ${student.name} (Roll: ${student.roll_no}) ---</p>
        <p>Monthly Plan Enrolled: ${student.mess_enrolled ? 'Yes' : 'No'}</p>
    `;

    if (student.mess_enrolled) {
      billSummary += `
        <p>Plan Meals Taken This Month: ${student.meals_taken_this_month}</p>
        <p>Cost Per Plan Meal: ${COST_PER_PLAN_MEAL.toFixed(2)}</p>
        <p>Total Plan Meal Cost: ${planMealCost.toFixed(2)}</p>
      `;
    } else {
        // If not on plan, display meals taken for context if any were recorded
        if (student.meals_taken_this_month > 0) {
             billSummary += `
                <p>Plan Meals Taken This Month (while potentially enrolled): ${student.meals_taken_this_month}</p>
                <p>Note: Plan meal cost applies only if currently enrolled in the monthly plan.</p>
              `;
        } else {
             billSummary += `<p>No plan meals recorded this month.</p>`;
         }
    }

    if (MONTHLY_PLAN_BASE_CHARGE > 0) {
      billSummary += `
        <p>Monthly Base Charge: ${MONTHLY_PLAN_BASE_CHARGE.toFixed(2)}</p>
      `;
    }


    billSummary += `
        <p>Individual Order Charges This Month: ${individualMealCost.toFixed(2)}</p>
        <p><strong>Total Monthly Bill: ${totalBill.toFixed(2)}</strong></p>
        <p>------------------------------------</p>
    `;


    billDetailsDiv.innerHTML = billSummary;
    showMessage(`Bill calculated for ${student.name}.`, 'success');

    // Optional: Clear input after successful operation
    // rollNoInput.value = '';
}

function viewStudentDetails() {
    const rollNoInput = document.getElementById('view-roll-no');
    const roll_no = rollNoInput.value.trim();
    const studentDetailsDiv = document.getElementById('student-details');
    studentDetailsDiv.innerHTML = ''; // Clear previous details

     if (!roll_no) {
        showMessage("Please enter a Roll Number.", 'error');
        return;
    }

    const student = findStudent(roll_no);

    if (!student) {
        showMessage(`Student with Roll Number ${roll_no} not found.`, 'error');
        return;
    }

    studentDetailsDiv.innerHTML = `
        <p>--- Student Information ---</p>
        <p><strong>Roll Number:</strong> ${student.roll_no}</p>
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Room Number:</strong> ${student.room_no}</p>
        <p><strong>Monthly Plan Enrolled:</strong> ${student.mess_enrolled ? 'Yes' : 'No'}</p>
        <p><strong>Plan Meals Taken This Month:</strong> ${student.meals_taken_this_month}</p>
        <p><strong>Individual Order Charges This Month:</strong> ${student.individual_charges_this_month.toFixed(2)}</p>
        <p>---------------------------</p>
    `;
    showMessage(`Details displayed for ${student.name}.`, 'success');

    // Optional: Clear input after successful operation
    // rollNoInput.value = '';
}

function resetMonthlyMeals() {
    // Renamed to reflect that it resets more than just meals
    if (!studentsData || studentsData.length === 0) {
        showMessage("No students to reset.", 'info');
         return;
    }

    const confirmReset = confirm("Are you sure you want to reset monthly meal counts AND individual charges for ALL students to 0? This is typically done at the start of a new billing cycle.");

    if (confirmReset) {
        studentsData.forEach(student => {
            student.meals_taken_this_month = 0;
            student.individual_charges_this_month = 0; // Reset individual charges
        });
        saveData();
        renderStudentsTable();
        showMessage("Monthly meal counts and individual charges have been reset for all students.", 'success');
    } else {
        showMessage("Meal count reset cancelled.", 'info');
    }
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadData(); // Load data when the page is fully loaded
    // Set up form submission listener for adding student
    document.getElementById('add-student-form').addEventListener('submit', addStudent);

    // Initially show the "Add Student" section or "View All"
    showSection('view-all-section');
});

// Note: Other button clicks are handled via inline onclick attributes in HTML for simplicity,
// but addEventListener is generally preferred in larger applications.
