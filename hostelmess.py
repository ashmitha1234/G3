import csv
import os

# --- Configuration ---
DATA_FILE = 'mess_data.csv'
COST_PER_MEAL = 60  # Cost per meal in your currency

# --- Data Structure ---
# Each student will be a dictionary:
# {
#   'roll_no': '101',
#   'name': 'Amit Kumar',
#   'room_no': 'A101',
#   'mess_enrolled': True, # or False
#   'meals_taken_this_month': 0
# }
students_data = []

def load_data():
    #Loads student data from the CSV file.
    global students_data
    students_data = [] # Clear existing data before loading
    if not os.path.exists(DATA_FILE):
        # Create the file with headers if it doesn't exist
        with open(DATA_FILE, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['roll_no', 'name', 'room_no', 'mess_enrolled', 'meals_taken_this_month'])
        return

    try:
        with open(DATA_FILE, 'r', newline='') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Convert relevant fields to correct types
                row['mess_enrolled'] = row['mess_enrolled'].lower() == 'true'
                row['meals_taken_this_month'] = int(row['meals_taken_this_month'])
                students_data.append(row)
    except FileNotFoundError:
        print(f"Data file '{DATA_FILE}' not found. A new one will be created.")
    except Exception as e:
        print(f"Error loading data: {e}")

def save_data():
    """Saves the current student data to the CSV file."""
    global students_data
    try:
        with open(DATA_FILE, 'w', newline='') as file:
            if not students_data: # Handle case where students_data might be empty
                # Write only headers if no data
                writer = csv.writer(file)
                writer.writerow(['roll_no', 'name', 'room_no', 'mess_enrolled', 'meals_taken_this_month'])
                return

            # Ensure fieldnames are derived from the first student dict or a default set
            fieldnames = students_data[0].keys() if students_data else ['roll_no', 'name', 'room_no', 'mess_enrolled', 'meals_taken_this_month']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(students_data)
    except Exception as e:
        print(f"Error saving data: {e}")

# --- Core Functions ---
def find_student(roll_no):
    """Finds a student by their roll number."""
    for student in students_data:
        if student['roll_no'] == roll_no:
            return student
    return None

def add_student():
    """Adds a new student to the system."""
    print("\n--- Add New Student ---")
    roll_no = input("Enter Roll Number: ").strip()
    if not roll_no:
        print("Roll Number cannot be empty.")
        return
    if find_student(roll_no):
        print(f"Student with Roll Number {roll_no} already exists.")
        return

    name = input("Enter Name: ").strip()
    if not name:
        print("Name cannot be empty.")
        return
    room_no = input("Enter Room Number: ").strip()

    new_student = {
        'roll_no': roll_no,
        'name': name,
        'room_no': room_no,
        'mess_enrolled': False, # Default to not enrolled
        'meals_taken_this_month': 0
    }
    students_data.append(new_student)
    save_data() # Save after adding
    print(f"Student '{name}' added successfully.")

def enroll_student_in_mess():
    """Enrolls or un-enrolls a student in the mess."""
    print("\n--- Enroll/Un-enroll Student in Mess ---")
    roll_no = input("Enter Roll Number of the student: ").strip()
    student = find_student(roll_no)

    if not student:
        print(f"Student with Roll Number {roll_no} not found.")
        return

    print(f"Student: {student['name']}, Currently Enrolled: {student['mess_enrolled']}")
    choice = input("Enroll in mess? (yes/no): ").strip().lower()

    if choice == 'yes':
        student['mess_enrolled'] = True
        print(f"{student['name']} is now enrolled in the mess.")
    elif choice == 'no':
        student['mess_enrolled'] = False
        print(f"{student['name']} is now un-enrolled from the mess.")
    else:
        print("Invalid choice. Please enter 'yes' or 'no'.")
    save_data() # Save changes

def record_meal():
    """Records a meal taken by an enrolled student."""
    print("\n--- Record Meal ---")
    roll_no = input("Enter Roll Number of the student: ").strip()
    student = find_student(roll_no)

    if not student:
        print(f"Student with Roll Number {roll_no} not found.")
        return

    if not student['mess_enrolled']:
        print(f"Student {student['name']} is not enrolled in the mess. Cannot record meal.")
        return

    student['meals_taken_this_month'] += 1
    save_data() # Save changes
    print(f"Meal recorded for {student['name']}. Total meals this month: {student['meals_taken_this_month']}.")

def calculate_bill():
    """Calculates and displays the mess bill for a student."""
    print("\n--- Calculate Mess Bill ---")
    roll_no = input("Enter Roll Number of the student: ").strip()
    student = find_student(roll_no)

    if not student:
        print(f"Student with Roll Number {roll_no} not found.")
        return

    if not student['mess_enrolled']:
        print(f"Student {student['name']} was not enrolled in the mess for billing purposes based on meals.")
        # You might still want to show a fixed bill if they were enrolled at some point
        # Or handle this based on specific mess rules (e.g., fixed monthly charge if ever enrolled)
        # For this basic version, we'll just state they aren't enrolled for meal-based billing.
        return


    total_bill = student['meals_taken_this_month'] * COST_PER_MEAL
    print(f"\n--- Bill for {student['name']} (Roll: {student['roll_no']}) ---")
    print(f"Meals Taken This Month: {student['meals_taken_this_month']}")
    print(f"Cost Per Meal: ${COST_PER_MEAL}")
    print(f"Total Bill: ${total_bill}")
    print("------------------------------------")

def view_student_details():
    """Displays details of a specific student."""
    print("\n--- View Student Details ---")
    roll_no = input("Enter Roll Number of the student: ").strip()
    student = find_student(roll_no)

    if not student:
        print(f"Student with Roll Number {roll_no} not found.")
        return

    print("\n--- Student Information ---")
    print(f"Roll Number: {student['roll_no']}")
    print(f"Name: {student['name']}")
    print(f"Room Number: {student['room_no']}")
    print(f"Mess Enrolled: {'Yes' if student['mess_enrolled'] else 'No'}")
    print(f"Meals Taken This Month: {student['meals_taken_this_month']}")
    print("---------------------------")

def view_all_students():
    """Displays a summary of all registered students."""
    print("\n--- All Registered Students ---")
    if not students_data:
        print("No students registered yet.")
        return

    print(f"{'Roll No.':<10} | {'Name':<20} | {'Room No.':<10} | {'Mess Enrolled':<15} | {'Meals Taken':<12}")
    print("-" * 75)
    for student in students_data:
        enrolled_status = "Yes" if student['mess_enrolled'] else "No"
        print(f"{student['roll_no']:<10} | {student['name']:<20} | {student['room_no']:<10} | {enrolled_status:<15} | {student['meals_taken_this_month']:<12}")
    print("-" * 75)

def reset_monthly_meals():
    """Resets meals_taken_this_month for all students (e.g., at the start of a new month)."""
    print("\n--- Reset Monthly Meal Counts ---")
    if not students_data:
        print("No students to reset.")
        return

    confirm = input("Are you sure you want to reset meal counts for ALL students to 0? (yes/no): ").strip().lower()
    if confirm == 'yes':
        for student in students_data:
            student['meals_taken_this_month'] = 0
        save_data()
        print("Monthly meal counts have been reset for all students.")
    else:
        print("Meal count reset cancelled.")


# --- Main Menu ---
def main_menu():
    """Displays the main menu and handles user input."""
    load_data() # Load data when the program starts

    while True:
        print("\n===== Hostel Mess Management System =====")
        print("1. Add New Student")
        print("2. Enroll/Un-enroll Student in Mess")
        print("3. Record Meal for Student")
        print("4. Calculate Mess Bill for Student")
        print("5. View Student Details")
        print("6. View All Students")
        print("7. Reset All Monthly Meal Counts")
        print("8. Exit")
        print("========================================")

        choice = input("Enter your choice (1-8): ").strip()

        if choice == '1':
            add_student()
        elif choice == '2':
            enroll_student_in_mess()
        elif choice == '3':
            record_meal()
        elif choice == '4':
            calculate_bill()
        elif choice == '5':
            view_student_details()
        elif choice == '6':
            view_all_students()
        elif choice == '7':
            reset_monthly_meals()
        elif choice == '8':
            print("Exiting system. Goodbye!")
            save_data() # Ensure data is saved before exiting
            break
        else:
            print("Invalid choice. Please enter a number between 1 and 8.")
        
        input("\nPress Enter to continue...") # Pause for readability

if __name__ == "__main__":
    main_menu()

