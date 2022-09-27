// acceptance criteria
/*
GIVEN a command-line application that accepts user input


WHEN I choose to view all departments
THEN I am presented with a formatted table showing department names and department ids

WHEN I choose to view all roles
THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role

WHEN I choose to view all employees
THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to

WHEN I choose to add a department
THEN I am prompted to enter the name of the department and that department is added to the database

WHEN I choose to add a role
THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database

WHEN I choose to add an employee
THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database

WHEN I choose to update an employee role
THEN I am prompted to select an employee to update and their new role and this information is updated in the database

Try to add some additional functionality to your application, such as the ability to do the following:
Update employee managers.
View employees by manager.
View employees by department.
Delete departments, roles, and employees.
View the total utilized budget of a department—in other words, the combined salaries of all employees in that department.
*/

const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Sett-Sql-4924",
  database: "company_db",
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  firstPrompt();
});

/* WHEN I start the application
THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role


*/

function firstPrompt() {
  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "Choose an option",
      choices: [
        "View Departments",
        "View Roles",
        "View Employees",
        // "View Employees by Manager",
        "View Employees by Department",
        "View Budget by Department",
        "Add a Department",
        "Add a Role",
        "Add an Employee",
        "Update an Employee's Role",
        // "Update Employee Manager",
        "Remove a Department",
        "Remove an Employee",
        // "Remove a Role",
        "End",
      ],
    })
    .then(function ({ task }) {
      switch (task) {
        // views
        case "View Departments": // DONE!!
          viewDepartments();
          break;
        case "View Roles": // DONE!!
          viewRoles();
          break;
        case "View Employees": // DONE!!
          viewEmployees();
          break;
        case "View Employees by Manager":
          console.log("pending");
          viewEmployeeByManager();
          break;
        case "View Employees by Department":
          viewEmployeesByDepartment();
          break;
        case "View Budget by Department":
          console.log("pending");
          viewBudgetByDepartment();
          break;

        // Add
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        // update
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Update Employee Manager":
          console.log("pending");
          //   updateEmployeeManager();
          break;
        case "Remove a Department":
          removeDepartment();
          break;
        case "Remove an Employee":
          removeEmployees();
          break;
        case "Remove a Role":
          console.log("pending");
          //   removeRole();
          break;
        case "End":
          connection.end();
          break;
      }
    });
}

// View functions

function viewDepartments() {
  let query = `SELECT id, name AS Department
  FROM department`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);

    firstPrompt();
  });
}

function viewRoles() {
  let query = `SELECT p.title AS Title, p.id AS ID, d.name As Department, p.salary AS Salary
  FROM position p
  LEFT JOIN department d
  ON p.department_id = d.id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);

    firstPrompt();
  });
}

function viewEmployees() {
  console.log("Viewing employees\n");

  let query = `SELECT e.id AS ID, e.first_name AS "First Name", e.last_name AS "Last Name", p.title AS Title, d.name AS Department, p.salary As Salary, CONCAT(m.first_name, ' ', m.last_name) AS Manager
  FROM employee e
  LEFT JOIN position p
	ON e.position_id = p.id
  LEFT JOIN department d
  ON d.id = p.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Employees viewed!\n");

    firstPrompt();
  });
}

// 3."View Employees by Manager"

function viewEmployeesByDepartment() {
  let query = `SELECT d.id, d.name, p.salary AS budget
  FROM employee e
  LEFT JOIN position p
	ON e.position_id = p.id
  LEFT JOIN department d
  ON d.id = p.department_id
  GROUP BY d.id, d.name`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentChoices = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));

    //    console.table(res);

    promptDepartment(departmentChoices);
  });
}

function viewBudgetByDepartment(departmentChoices) {
  let query = `SELECT SUM(p.salary) AS "Budget"
    FROM position p
    LEFT JOIN department d
    ON p.department_id = d.id
    WHERE d.name= "Sales"`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentChoices = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));

    console.table(res);

    promptDepartment(departmentChoices);
  });
}

// User choose the department list, then employees pop up

function promptDepartment(departmentChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Which Department?",
        choices: departmentChoices,
      },
    ])
    .then(function (answer) {
      console.log("answer ", answer.departmentId);

      let query = `SELECT e.id, e.first_name, e.last_name, p.title, d.name AS department 
  FROM employee e
  JOIN position p
	ON e.position_id = p.id
  JOIN department d
  ON d.id = p.department_id
  WHERE d.id = ?`;

      connection.query(query, answer.departmentId, function (err, res) {
        if (err) throw err;

        console.table("response ", res);

        firstPrompt();
      });
    });
}

//========================================= 4."Add Employee" / CREATE: INSERT INTO

// Make a employee array

function addEmployee() {
  console.log("Inserting an employee!");

  var query = `SELECT r.id, r.title, r.salary 
      FROM role r`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleChoices = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));

    console.table(res);
    console.log("RoleToInsert!");

    promptInsert(roleChoices);
  });
}

function promptInsert(roleChoices) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices,
      },
      // {
      //   name: "manager_id",
      //   type: "list",
      //   message: "What is the employee's manager_id?",
      //   choices: manager
      // }
    ])
    .then(function (answer) {
      console.log(answer);

      let query = `INSERT INTO employee SET ?`;
      connection.query(
        query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.insertedRows + "Inserted successfully!\n");

          firstPrompt();
        }
      );
    });
}

//========================================= 5."Remove Employees" / DELETE, DELETE FROM

// Make a employee array to delete

function removeEmployees() {
  console.log("Deleting an employee");

  var query = `SELECT e.id, e.first_name, e.last_name
      FROM employee e`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deleteEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${id} ${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("ArrayToDelete!\n");

    promptDelete(deleteEmployeeChoices);
  });
}

// User choose the employee list, then employee is deleted

function promptDelete(deleteEmployeeChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to remove?",
        choices: deleteEmployeeChoices,
      },
    ])
    .then(function (answer) {
      var query = `DELETE FROM employee WHERE ?`;

      connection.query(query, { id: answer.employeeId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Deleted!\n");

        firstPrompt();
      });
    });
}

//========================================= 6."Update Employee Role" / UPDATE,

function updateEmployeeRole() {
  employeeArray();
}

function employeeArray() {
  var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  JOIN employee m
	ON m.id = e.manager_id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("employeeArray To Update!\n");

    roleArray(employeeChoices);
  });
}

function roleArray(employeeChoices) {
  console.log("Updating an role");
  //change to position
  var query = `SELECT r.id, r.title, r.salary 
  FROM role r`;
  let roleChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleChoices = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));

    console.table(res);
    console.log("roleArray to Update!\n");

    promptEmployeeRole(employeeChoices, roleChoices);
  });
}

function promptEmployeeRole(employeeChoices, roleChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with the role?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to update?",
        choices: roleChoices,
      },
    ])
    .then(function (answer) {
      var query = `UPDATE employee SET role_id = ? WHERE id = ?`;
      connection.query(
        query,
        [answer.roleId, answer.employeeId],
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.affectedRows + "Updated successfully!");

          firstPrompt();
        }
      );
    });
}

function addRole() {
  var query = `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    // (callbackfn: (value: T, index: number, array: readonly T[]) => U, thisArg?: any)
    const departmentChoices = res.map(({ id, name }) => ({
      value: id,
      name: `${id} ${name}`,
    }));

    console.table(res);
    console.log("Department array!");

    promptAddRole(departmentChoices);
  });
}

function promptAddRole(departmentChoices) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Role title?",
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Role Salary",
      },
      {
        type: "list",
        name: "departmentId",
        message: "Department?",
        choices: departmentChoices,
      },
    ])
    .then(function (answer) {
      var query = `INSERT INTO role SET ?`;

      connection.query(
        query,
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.departmentId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Role Inserted!");

          firstPrompt();
        }
      );
    });
}

//========================================= 8."Remove Role"
