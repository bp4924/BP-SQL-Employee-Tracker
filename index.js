const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");

let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "<REPLACE WITH YOUR MYSQL PASSWORD>",
  database: "company_db",
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;

  menuOptions();
});

function menuOptions() {
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
        "Update an Employee's Manager",
        "Remove a Department",
        "Remove a Role",
        "Remove an Employee",
        "End",
      ],
    })
    .then(function ({ task }) {
      switch (task) {
        // views
        case "View Departments":
          viewDepartments();
          break;
        case "View Roles":
          viewRoles();
          break;
        case "View Employees":
          viewEmployees();
          break;
        case "View Budget by Department":
          viewBudgetByDepartment();
          break;

        // sdditions
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmployee();
          break;

        // updates
        case "Update an Employee's Role":
          updateEmployeeRole();
          break;
        case "Update an Employee's Manager":
          updateEmployeeManager();
          break;

        // removals
        case "Remove a Department":
          removeDepartment();
          break;
        case "Remove a Role":
          removeRole();
          break;
        case "Remove an Employee":
          removeEmployee();
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

    menuOptions();
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

    menuOptions();
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
          viewEmployeesByManager();
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

    menuOptions();
  });
}

function viewEmployeesByManager() {
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

          menuOptions();
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

          menuOptions();
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

          menuOptions();
        });
      });
  });
}

// add functions
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "Department to add?",
      },
    ])

    .then(function (answer) {
      let query = `INSERT INTO department SET ?`;
      connection.query(
        query,
        {
          name: answer.department,
        },
        function (err, res) {
          if (err) throw err;

          viewDepartments();
        }
      );
    });
}

function addRole() {
  let query = `SELECT *
  FROM department`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentChoices = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));

    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "Role title?",
        },
        {
          type: "input",
          name: "salary",
          message: "Role Salary",
        },
        {
          type: "list",
          name: "department",
          message: "Which Department?",
          choices: departmentChoices,
        },
      ])
      .then(function (answer) {
        let query = `INSERT INTO role SET ?`;

        connection.query(
          query,
          {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.department,
          },
          function (err, res) {
            if (err) throw err;

            viewRoles();
          }
        );
      });
  });
}

function addEmployee() {
  let query = `SELECT * 
  FROM role`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleChoices = res.map((data) => ({
      value: data.id,
      name: data.title,
    }));

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
          name: "title",
          message: "What is the employee's role?",
          choices: roleChoices,
        },
        {
          type: "input",
          name: "manager_id",
          message: "What is the manager's id?",
          default: 0,
        },
      ])
      .then(function (answer) {
        console.log(answer);

        let query = `INSERT INTO employee SET ?`;
        connection.query(
          query,
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: answer.title,
            manager_id: answer.manager_id,
          },
          function (err, res) {
            if (err) throw err;

            viewAllEmployees();
          }
        );
      });
  });
}

// remove
function removeDepartment() {
  let query = `SELECT * 
  FROM department`;

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
          name: "departmentId",
          message: "Which department do you want to remove?",
          choices: departmentChoices,
        },
      ])
      .then(function (answer) {
        let query = `DELETE FROM department WHERE ?`;

        connection.query(
          query,
          { id: answer.departmentId },
          function (err, res) {
            if (err) throw err;

            viewDepartments();
          }
        );
      });
  });
}

function removeRole() {
  let query = `SELECT *
      FROM role r`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleChoices = res.map((data) => ({
      value: data.id,
      name: data.title,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "roleId",
          message: "Which role do you want to remove?",
          choices: roleChoices,
        },
      ])
      .then(function (answer) {
        let query = `DELETE FROM role WHERE ?`;

        connection.query(query, { id: answer.roleId }, function (err, res) {
          if (err) throw err;

          viewRoles();
        });
      });
  });
}

function removeEmployee() {
  let query = `SELECT e.id, e.first_name, e.last_name
      FROM employee e`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const removeEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));

    console.table(res);

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee do you want to remove?",
          choices: removeEmployeeChoices,
        },
      ])
      .then(function (answer) {
        let query = `DELETE FROM employee WHERE ?`;

        connection.query(query, { id: answer.employeeId }, function (err, res) {
          if (err) throw err;

          viewAllEmployees();
        });
      });
  });
}

// update records
function updateEmployeeRole() {
  // strings for option queries
  let employeeChoiceString = `SELECT id, first_name, last_name
  FROM employee`;
  let roleChoiceString = `SELECT id, title 
  FROM role`;

  let employeeChoices;
  let roleChoices;
  // option queries
  connection.query(employeeChoiceString, function (err, res) {
    if (err) throw err;

    employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));
  });

  connection.query(roleChoiceString, function (err, res) {
    if (err) throw err;

    roleChoices = res.map((data) => ({
      value: data.id,
      name: data.title,
    }));

    roleUpdate(employeeChoices, roleChoices);
  });
}

function roleUpdate(employeeChoices, roleChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to update?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the new role?",
        choices: roleChoices,
      },
    ])
    .then(function (answer) {
      let query = `UPDATE employee SET role_id = ? WHERE id = ?`;
      connection.query(
        query,
        [answer.roleId, answer.employeeId],
        function (err, res) {
          if (err) throw err;

          viewAllEmployees();
        }
      );
    });
}

function updateEmployeeManager() {
  // strings for option queries
  let employeeChoiceString = `SELECT id, first_name, last_name
  FROM employee`;
  let managerChoiceString = `SELECT id, CONCAT(first_name, ' ', last_name) AS manager 
  FROM employee
  WHERE isnull(manager_id)`;

  let employeeChoices;
  let managerChoices;
  // option queries
  connection.query(employeeChoiceString, function (err, res) {
    if (err) throw err;

    employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));
  });

  connection.query(managerChoiceString, function (err, res) {
    if (err) throw err;

    managerChoices = res.map((data) => ({
      value: data.id,
      name: data.manager,
    }));

    managerUpdate(employeeChoices, managerChoices);
  });
}

function managerUpdate(employeeChoices, managerChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to update?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "manager",
        message: "What is the new manager's id?",
        choices: managerChoices,
        default: 0,
      },
    ])
    .then(function (answer) {
      let query = `UPDATE employee SET manager_id = ? WHERE id = ?`;
      connection.query(
        query,
        [answer.manager, answer.employeeId],
        function (err, res) {
          if (err) throw err;

          viewAllEmployees();
        }
      );
    });
}
