var express = require('express');

module.exports = function(db, app){
    var apiroute = express.Router();

    apiroute.post('/atlas', (req,res) => {
        var atlas_id;
        var sql = "INSERT INTO atlas (name, description, location, latitude, longitude, website, email, patients) VALUES ?";
        var values = [
          [req.body.name, req.body.description, req.body.location, req.body.latitude, req.body.longitude, req.body.website, req.body.email, req.body.patients]
        ]

        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('latitude', 'Name is required').notEmpty();
        req.checkBody('longitude', 'Name is required').notEmpty();

        var errors = req.validationErrors();
        if(errors){
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/admin');
        }else{
            req.session.success = true;
            db.query(sql, [values], function(err,data){
                if (err) throw err;
                console.log("Number of records inserted: " + data.affectedRows);
                atlas_id = data.insertId;
                console.log(atlas_id);
                var productsql = "INSERT INTO versionatlas (atlas_id, version_id) VALUES ?";
                if(atlas_id){
                    if(req.body.products){
                    if(Array.isArray(req.body.products)){
                        for(var i =0; i<req.body.products.length; i++){
                        let productvalues = [
                            [atlas_id,req.body.products[i]]
                        ]
                        db.query(productsql, [productvalues], function(err,data){
                            if (err) throw err;
                        });
                        }  
                    }else{
                        let productvalues = [
                        [atlas_id,req.body.products]
                        ]
                        db.query(productsql, [productvalues], function(err,data){
                        if (err) throw err;
                        });
                    }
                    }
                }  
                res.redirect('/admin');
                });      
        }
    });
    
    apiroute.get('/atlas', (req,res) => {
    db.getConnection(function(err,connection){
        if (err) throw err;
        connection.query('SELECT * FROM atlas ', function (error, rows, fields) {
        if(rows=== undefined){
        res.send("DB Error")
        }else{
        var objs=[];
        var pending = rows.length;
        for(var i = 0; i <rows.length; i++){
            let products = [];
            let currentRow = rows[i];
            connection.query('SELECT product_name, version_name, VA.version_id FROM versionatlas As VA INNER JOIN versions AS V on V.version_id = VA.version_id INNER JOIN products AS P on P.product_id = V.product_id where atlas_id = ?',[[currentRow.id]], function (error2, rows2, fields2) {
            if(rows2 === undefined){
                console.log("can't access product database");
            }else{
    
                for(var j = 0; j <rows2.length; j++){
                products.push({name: rows2[j].product_name, version_id: rows2[j].version_id, version: rows2[j].version_name});
                }
                var currentJson = currentRow;
                currentJson["products"] = products;
                objs.push(currentJson);  
                if( 0 === --pending ){
                res.end(JSON.stringify(objs));
                }
            }
            });
        }
        }
        connection.release();
        if(error){
        res.send(error);
        }
    
        });
    });
    });
    
    
    apiroute.get('/atlas/:id', (req,res) => {
    var id = req.params.id;
    db.getConnection(function(err,connection){
        if (err) throw err;
        connection.query('SELECT * FROM atlas WHERE ID = ?',[[id]], function (error, rows, fields) {
        if(rows=== undefined){
        res.send("DB Error")
        }else{
        var objs=[];
        var pending = rows.length;
    
        for(var i = 0; i <rows.length; i++){
            let products = [];
            let currentRow = rows[i];
            connection.query('SELECT version_name, product_name FROM versionatlas As VA INNER JOIN versions AS V on V.version_id = VA.version_id INNER JOIN products AS P on P.product_id = V.product_id where atlas_id = ?',[[currentRow.id]], function (error2, rows2, fields2) {
            console.log(currentRow);
            if(rows2 === undefined){
                console.log("can't access product database");
            }else{
    
                for(var j = 0; j <rows2.length; j++){
                products.push({name: rows2[j].product_name, version: rows2[j].version_name});
                }
                var currentJson = currentRow;
                currentJson["products"] = products;
                objs.push(currentJson);  
                if( 0 === --pending ){
                res.end(JSON.stringify(objs));
                }
            }
            });
        }
        }
        connection.release();
        if(error){
        res.send(error);
        }
    
        });
    });
    });
    
    apiroute.delete('/atlas/:id', (req,res) => {
    var id = req.params.id;
    db.query('DELETE FROM atlas WHERE ID = ?',[[req.params.id]], (error2,rows2,fields2) => {
        if(error2) throw error2;
        res.end(JSON.stringify({status: 'success'}));
    });
    });
    
    apiroute.put('/atlas/:id', (req,res) => {  
    var qdata = [req.body.name, req.body.description, req.body.location, req.body.latitude, req.body.longitude, req.body.website, req.body.patients, req.body.email, req.params.id];
    console.log(req.params.id);
    if(req.params.id){
        db.getConnection(function(err,connection){
        connection.query('UPDATE Atlas SET name =?, description =?, location=?, latitude=?, longitude=?, website=?, patients=?, email=? WHERE ID = ?', qdata, function (error, rows, fields) {
            var objs=[];
            if (error) throw error;
            var values = [];
            if(Array.isArray(req.body.products)){
                for(var i = 0; i < req.body.products.length; i++){
                values.push([req.params.id, req.body.products[i]]);
                }  
            }else{
                values.push([req.params.id, req.body.products])
            }
            console.log(values);
            connection.query('DELETE FROM versionatlas WHERE atlas_id = ?',[[req.params.id]],(error2,rows2,fields2) => {
                if(error2){
                throw error2;
                }
                connection.query('INSERT INTO versionatlas (atlas_id, version_id) VALUES ?', [values], (error3,rows3,fields3) => {
                if (error3) throw error3;
                console.log('inserted');
                });
            });
            connection.release();
            res.end(JSON.stringify(objs));
        })
        });
    }
    
    });
    
    apiroute.get('/products', (req,res) => {
    db.getConnection(function(err,connection){
        if (err) throw err;
        connection.query('SELECT * FROM products', function (error, rows, fields) {
        if(rows=== undefined || error){
            res.end("DB Error");
        }else{
            var objs=[];
            var pending = rows.length;
            if(!rows.length){
            objs.push({status: "not found"});
            }
            for(var i = 0; i <rows.length; i++){
            let currentRow = rows[i];
            let versions = [];
            connection.query('SELECT version_id, version_name FROM versions where product_id = ?',[[currentRow.product_id]], function (error2, rows2, fields2) {
                if(rows2 === undefined){
                console.log("can't access product database");
                }else{
                for(var j = 0; j <rows2.length; j++){
                    versions.push({id: rows2[j].version_id, name: rows2[j].version_name});
                }
                var currentJson = currentRow;
                currentJson["versions"] = versions;
                objs.push(currentJson);  
                if( 0 === --pending ){
                    res.end(JSON.stringify(objs));
                }
                }
            });
            }
        }
        })
    });
    });
    
apiroute.post('/products', (req,res) => {
    req.checkBody('name', 'Product Name is required').trim().notEmpty();
    
    var errors = req.validationErrors();
    if(errors){
        req.session.errors = errors;
        req.session.success = false;
        res.redirect('/admin/products');
    }else{
        var sql = "INSERT INTO products (product_name, product_desc, marker_pcolor, marker_scolor) VALUES ?";
        var values = [
            [req.body.name, req.body.description, req.body.marker_pcolor, req.body.marker_scolor]
        ]
        db.query(sql, [values], function(err,data){
            if (err) throw err;
            res.redirect('/admin');
            console.log("Number of records inserted: " + data.affectedRows);
        });
    }
});
    
apiroute.put('/products/:id', (req,res) => {
    qdata = [req.body.name, req.body.description, req.body.marker_pcolor, req.body.marker_scolor, req.params.id];
    db.query('UPDATE products SET product_name = ?, product_desc = ?, marker_pcolor = ?, marker_scolor = ? WHERE product_id = ?', qdata, function (error, rows, fields) {
        if(error) throw error;
        res.end("SUCCESS!");
    });
    })
    
    
apiroute.get('/versions/:productid', (req,res) => {
    var id = req.params.productid;
    db.query('SELECT * FROM versions WHERE product_id = ?',[[id]], function (err, rows, fields) {
        var objs=[];
        if(rows === undefined){
        res.send("DB Error")
        }else{
        if(!rows.length){
            objs.push({status: "not found"});
        }
        for(var i = 0; i <rows.length; i++){
            objs.push({id: rows[i].version_id, name: rows[i].version_name});
        }
        res.end(JSON.stringify(objs));  
        }
    })
})
    
    apiroute.post('/versions/:productid', (req,res) => {
        var id = req.params.productid;
        var sql = 'INSERT INTO versions (product_id, version_name) VALUES ?';
        console.log(id);

        req.checkBody('name', 'Product Name is required').trim().notEmpty();
        var errors = req.validationErrors();

        var values = [
            [id, req.body.versionname]
        ]
        db.query(sql, [values], function(err,data){
            if (err) {
                res.end("Error, Make sure target product has been selected");
            }else{
                res.redirect('/admin');
                console.log("Number of records inserted: " + data.affectedRows);    
            }
        });
    });
    return apiroute;
};