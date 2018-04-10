const employeesRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE ||
                                './database.sqlite');

module.exports = employeesRouter;

employeesRouter.param('employeeId', (req, res, next, id) => {
  req.employeeId = Number(id);
  db.get(`select * from Employee where id=${req.employeeId}`, (err, employee)=>{
    if (err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.param('timesheetId', (req, res, next, id) => {
  req.timesheetId = Number(id);
  db.get(`select * from Timesheet where id=${req.timesheetId}`, (err, timesheet) => {
    if (err) {
      next(err)
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    };
  });
});

employeesRouter.get('/', (req, res, next) => {
  db.all('select * from Employee where is_current_employee = 1', (err, employees)=>{
    if (err) {next(err)};
    res.status(200).send({employees : employees});
  });
});

employeesRouter.post('/', (req, res, next) => {
  const newEmployee=req.body.employee;
  if (!newEmployee.name ||
      !newEmployee.position ||
      !newEmployee.wage) {
        res.sendStatus(400);
      }
  const statement="insert into Employee (name, position, wage) \
                   values ($name, $position, $wage)";
  const values={$name:newEmployee.name,
                $position:newEmployee.position,
                $wage:newEmployee.wage};
  db.run(statement, values, function(err){
    if (err) {next(err)};
    db.get(`select * From Employee where id=${this.lastID}`, (err, employee)=>{
      if (err) {next(err)};
      res.status(201).send({employee : employee});
    });
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({employee:req.employee});
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const updatedEmployee=req.body.employee;
  if (!updatedEmployee.name ||
      !updatedEmployee.position ||
      !updatedEmployee.wage) {
        res.sendStatus(400);
      }
  const statement="update Employee set name=$name, position=$position, wage=$wage \
                   where id=$id";
  const values={$name:updatedEmployee.name,
                $position:updatedEmployee.position,
                $wage:updatedEmployee.wage,
                $id:req.employee.id};
  db.run(statement, values, (err)=>{
    if (err) {next(err)};
    db.get(`select * From Employee where id=${req.employee.id}`, (err, employee)=>{
      if (err) {next(err)};
      res.status(200).send({employee : employee});
    });
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run(`update Employee set is_current_employee=0 where id=${req.employee.id}`, (err)=>{
    if (err) {next(err)};
    db.get(`select * from Employee where id=${req.employee.id}`, (err, employee)=>{
      if (err) {next(err)};
      res.status(200).send({employee : employee});
    });
  });
});

employeesRouter.get('/:employeeId/timesheets', (req, res, next) => {
  db.all(`select * from Timesheet where employee_id=${req.employee.id}`, (err, rows)=> {
    if (err) {next(err)} ;
    res.status(200).send({timesheets:rows});
  });
});

employeesRouter.post('/:employeeId/timesheets', (req, res, next) => {
  const newTimesheet=req.body.timesheet;
  if (!newTimesheet.hours ||
      !newTimesheet.rate ||
      !newTimesheet.date) {
        res.sendStatus(400);
      };
  const statement="insert into Timesheet (hours, rate, date, employee_id) \
                   values ($hours, $rate, $date, $employee_id)";
  const values={$hours:newTimesheet.hours,
                $rate:newTimesheet.rate,
                $date:newTimesheet.date,
                $employee_id:req.employee.id};
  db.run(statement, values, function(err) {
    if (err) {next(err)};
    db.get(`select * from Timesheet where id=${this.lastID}`, (err, row)=>{
      if (err) {next(err)};
      res.status(201).send({timesheet:row});
    });
  });
});

employeesRouter.put('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  const updatedTimesheet=req.body.timesheet;
  if (!updatedTimesheet.hours ||
      !updatedTimesheet.rate ||
      !updatedTimesheet.date) {
        res.sendStatus(400);
      };
  const statement="update Timesheet set hours=$hours, rate=$rate, date=$date where id=$id";
  const values={$hours:updatedTimesheet.hours,
                $rate:updatedTimesheet.rate,
                $date:updatedTimesheet.date,
                $id:req.timesheet.id};
  db.run(statement, values, (err)=>{
    if (err) {next(err)};
    db.get(`select * From Timesheet where id=${req.timesheet.id}`, (err, row)=>{
      if (err) {next(err)};
      res.status(200).send({timesheet:row});
    });
  });
});

employeesRouter.delete('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  db.run(`delete from Timesheet where id=${req.timesheet.id}`, (err)=>{
    if (err) {next(err)};
    res.sendStatus(204);
  });
});
