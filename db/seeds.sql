USE company_db

INSERT INTO department (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("HR");       

INSERT INTO position (title, salary, department_id)
VALUES ("Lead Salesperson",  140000, 1),
       ("Salesperson", 80000, 1),
       ("Lead Engineer", 150000, 2),
       ("Software Engineer", 120000, 2),
       ("Account Manager", 160000, 3),
       ("Accountant", 125000, 3),
       ("Legal Team Lead", 250000, 4),
       ("Lawyer", 190000, 4),
       ("Coach", 210000, 5);

INSERT INTO employee (first_name, last_name, position_id, manager_id)
VALUES ("John", "Doe", 1, null), 
       ("Mike", "Chan", 2, 1), 
       ("Ashley", "Rodriguez", 3, null), 
       ("Kevin", "Tupik", 4, 3), 
       ("Kunal", "Singh", 5, null), 
       ("Malia", "Brown", 6, 5), 
       ("Sarah", "Lourd", 7, null), 
       ("Tom", "Allen", 8, 7),
       ("Tony", "Robbins", 9, null);
       
