const menusRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE ||
                                './database.sqlite');

module.exports = menusRouter;

menusRouter.param('menuId', (req, res, next, id) => {
  req.menuId=Number(id);
  db.get(`SELECT * From Menu WHERE id = ${req.menuId}`, (err, row)=>{
    if (err) {
      next(err);
    } else if (row) {
      req.menu = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.param('menuItemId', (req, res, next, id) => {
  req.menuItemId = Number(id);
  db.get(`SELECT * FROM MenuItem WHERE id = ${req.menuItemId}`, (err, row)=>{
    if (err) {
      next(err)
    } else if (row) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Menu", (err, rows)=>{
    if (err) {next(err)};
    res.status(200).send({menus : rows});
  })
});

menusRouter.post('/', (req, res, next) => {
  const newMenu = req.body.menu;
  if (!newMenu.title) {
    res.sendStatus(400);
  }
  db.run(`INSERT INTO Menu (title) VALUES ('${newMenu.title}')`, function (err) {
    if (err) {
      next(err)
    };
    db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
      if (err) {
        next(err)
      };
      res.status(201).send({menu : row});
    });
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).send({menu : req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
  const updatedMenu = req.body.menu;
  if (!updatedMenu.title) {
    res.sendStatus(400);
  }
  db.run(`UPDATE Menu SET TITLE = '${updatedMenu.title}' WHERE id = ${req.menu.id}`, (err)=>{
    if (err) {
      next(err)
    };
    db.get(`SELECT * FROM Menu WHERE id = ${req.menu.id}`, (err, row) => {
      if (err) {
        next(err)
      };
      res.status(200).send({menu : row});
    });
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.menu.id}`, (err, row) => {
    if (err) {
      next(err)
    } else if (row) {
      res.sendStatus(400);
    } else {
      db.run(`DELETE FROM Menu WHERE id = ${req.menu.id}`, (err) => {
        if (err) {
          next(err)
        };
        res.sendStatus(204);
      });
    }
  });
});

menusRouter.get('/:menuId/menu-items', (req, res, next) => {
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.menuId}`, (err, rows) => {
    if (err) {
      next(err)
    } else if (rows) {
      res.status(200).send({menuItems:rows});
    } else {
      res.status(200).send([]);
    }
  });
});

menusRouter.post('/:menuId/menu-items', (req, res, next) => {
  const newMenuItem=req.body.menuItem;
  if (!newMenuItem.name ||
      !newMenuItem.description ||
      !newMenuItem.inventory ||
      !newMenuItem.price) {
        res.sendStatus(400);
      }
  const sql = "INSERT INTO MenuItem (name, description, inventory, price, menu_id) \
                   VALUES ($name, $description, $inventory, $price, $menu_id)";
  const values = {$name:newMenuItem.name,
                $description:newMenuItem.description,
                $inventory:newMenuItem.inventory,
                $price:newMenuItem.price,
                $menu_id:req.menuId};
  db.run(sql, values, function(err){
    if (err) {
      next(err)
    };
    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
      if (err) {
        next(err)
      };
      res.status(201).send({menuItem:row});
    });
  });
});

menusRouter.put('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const updatedMenuItem=req.body.menuItem;
  if (!updatedMenuItem.name ||
      !updatedMenuItem.description ||
      !updatedMenuItem.inventory ||
      !updatedMenuItem.price) {
        res.sendStatus(400);
      }
  const sql = "update MenuItem set \
                    name=$name, \
                    description=$description, \
                    inventory=$inventory, \
                    price=$price, \
                    menu_id=$menu_id \
                   where id=$id";
  const values = {$name:updatedMenuItem.name,
                $description:updatedMenuItem.description,
                $inventory:updatedMenuItem.inventory,
                $price:updatedMenuItem.price,
                $menu_id:req.menuId,
                $id:req.menuItemId};
  db.run(sql, values, (err) => {
    if (err) {
      next(err)
    };
    db.get(`SELECT * FROM MenuItem WHERE id = ${req.menuItemId}`, (err, row) => {
      if (err) {
        next(err)
      };
      res.status(200).send({menuItem:row});
    });
  });
});

menusRouter.delete('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE id = ${req.menuItemId}`, (err) => {
    if (err) {next(err)};
    res.sendStatus(204);
  });
});
