const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Sett-Sql-4924",
  database: "company_db",
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;

  firstPrompt();
});

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
        "View Budget by Department",
        "Add a Department",
        "Add a Role",
        "Add an Employee",
        "Update an Employee's Role",
        // "Update Employee Manager",
        //"Remove a Department",
        //"Remove an Employee",
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
          viewEmployeeByManager();
          break;
        case "View Employees by Department":
          viewEmployeesByDepartment();
          break;
        case "View Budget by Department":
          viewBudgetByDepartment();
          break;

        // Add
        case "Add a Department":
          console.log("Pending");
          //          addDepartment();
          break;
        case "Add a Role":
          console.log("Pending");
          //          addRole();
          break;
        case "Add an Employee":
          console.log("Pending");
          //          addEmployee();
          break;
        // update
        case "Update Employee Role":
          console.log("Pending");
          //          updateEmployeeRole();
          break;
        case "Update Employee Manager":
          console.log("pending");
          //   updateEmployeeManager();
          break;
        case "Remove a Department":
          console.log("Pending");
          //          removeDepartment();
          break;
        case "Remove an Employee":
          console.log("Pending");
          //          removeEmployees();
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
  let query = `SELECT r.title AS Title, r.id AS ID, d.name As Department, r.salary AS Salary
  FROM role r
  LEFT JOIN department d
  ON r.department_id = d.id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);

    firstPrompt();
  });
}

function viewEmployees() {
  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "Choose an option",
      choices: [
        "View All Employees",
        "View Employees by Manager",
        "View Employees by Department",
      ],
    })
    .then(function ({ task }) {
      switch (task) {
        case "View All Employees":
          viewAllEmployees();
          break;
        case "View Employees by Manager":
          viewEmployeeByManager();
          break;
        case "View Employees by Department":
          viewEmployeesByDepartment();
          break;
      }
    });
}

function viewAllEmployees() {
  let query = `SELECT e.id AS ID, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS Title, d.name AS Department, r.salary As Salary, CONCAT(m.first_name, ' ', m.last_name) AS Manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);

    firstPrompt();
  });
}

function viewEmployeeByManager() {
  let query = `SELECT id, CONCAT(first_name, ' ', last_name) AS manager 
  FROM employee
  WHERE isnull(manager_id)`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const managerChoices = res.map((data) => ({
      value: data.id,
      name: data.manager,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "manager",
          message: "Which Manager?",
          choices: managerChoices,
        },
      ])
      .then(function (answer) {
        const manager = answer.manager;
        let query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
          FROM employee e
          JOIN role r
          ON e.role_id = r.id
          JOIN department d
          ON d.id = r.department_id
          WHERE e.manager_id = ${manager}`;

        connection.query(query, answer.departmentId, function (err, res) {
          if (err) throw err;

          console.table(res);

          firstPrompt();
        });
      });
  });
}

function viewEmployeesByDepartment() {
  let query = `SELECT *
  FROM department d`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentChoices = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "dept",
          message: "Which Department?",
          choices: departmentChoices,
        },
      ])
      .then(function (answer) {
        const dept = answer.dept;
        let query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
          FROM employee e
          JOIN role r
          ON e.role_id = r.id
          JOIN department d
          ON d.id = r.department_id
          WHERE d.id = ${dept}`;

        connection.query(query, answer.departmentId, function (err, res) {
          if (err) throw err;

          console.table(res);

          firstPrompt();
        });
      });
  });
}

function viewBudgetByDepartment() {
  let query = `SELECT *
  FROM department d`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentChoices = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "dept",
          message: "Which Department?",
          choices: departmentChoices,
        },
      ])
      .then(function (answer) {
        const dept = answer.dept;
        console.log(dept);
        let query = `SELECT d.id, d.name AS Department, sum(r.salary) AS budget
        FROM employee e
        LEFT JOIN role r
        ON e.role_id = r.id
        LEFT JOIN department d
        ON d.id = r.department_id
        WHERE d.id = ${dept}
        GROUP BY d.id`;

        connection.query(query, answer.departmentId, function (err, res) {
          if (err) throw err;

          console.table(res);

          firstPrompt();
        });
      });
  });
}

/* function promptDepartment(departmentChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "dept",
        message: "Which Department?",
        choices: departmentChoices,
      },
    ])

    .then(function (answer) {
      const dept = answer.departmentId;
      let query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
        FROM employee e
        JOIN role r
      	ON e.role_id = r.id
        JOIN department d
        ON d.id = r.department_id
        WHERE d.id = ${dept}`;

      connection.query(query, answer.departmentId, function (err, res) {
        if (err) throw err;

        console.table(res);

        firstPrompt();
      });
    });
}
 */

function addEmployee() {
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
  //change to role
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
