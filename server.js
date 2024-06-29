import express from 'express';
import bodyParser from 'body-parser';
import connect from './database.js';
import dotenv from 'dotenv'

import cors from 'cors'
dotenv.config()

let connection;



(async () => {
    try {
        connection = await connect();
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
})();






const app = express();

app.use(bodyParser.json());
app.use(cors());





app.post('/users', async (req, res) => {

    console.log(req.body);
    let { firstName, lastName, gender, email, contactNumber, password, role } = req.body;

    password = password || '123456'

    console.log(role);



    if (!firstName || !lastName || !gender || !email || !contactNumber || !password || !role || !role) {
        console.log('hvgjhvbhj');
        return res.status(400).json({
            timestamp: Date.now(),
            status: 400,
            error: 'Bad Request',
            message: 'Missing required fields',
            data: null
        });
    }

    try {
        // Check if the email already exists
        const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        // console.log(existingUser);

        if (existingUser.length != 0) {
            return res.status(409).json({
                timestamp: Date.now(),
                status: 409,
                error: 'Conflict',
                message: 'Email already exists',
                data: null
            });
        }

        // Insert the new user
        const [result] = await connection.query(
            'INSERT INTO users (first_name, last_name, gender, email, phone_number, password, user_role_id, created_time, last_modified_time, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), TRUE)',
            [firstName, lastName, gender, email, contactNumber, password, role]
        );

        const userId = result.insertId;

        // Retrieve the created user (uncomment if needed)
        // const [user] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);

        res.status(201).json({
            timestamp: Date.now(),
            status: 201,
            error: null,
            message: 'User Created',
            data: {
                userId,
                firstName,
                lastName,
                gender,
                email,
                contactNumber,
                role: {
                    roleId: role.roleId,
                    name: role.name
                },
                createdTime: new Date(),
                lastModifiedTime: new Date(),
                isActive: true
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while creating the user',
            data: null
        });
    }
});

// Get user by ID
app.get('/user/:userId', async (req, res) => {


    const userId = req.params.userId;

    try {

        const [user] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        console.log(user);

        if (user.length === 0) {
            return res.status(404).json({
                timestamp: Date.now(),
                status: 404,
                error: 'Not Found',
                message: 'User not found',
                data: null
            });
        }

        const [role] = await connection.query('SELECT * FROM user_roles WHERE user_role_id = ?', [user[0].user_role_id]);



        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'User Fetched',
            data: {
                userId: user[0].user_id,
                firstName: user[0].first_name,
                lastName: user[0].last_name,
                gender: user[0].gender,
                email: user[0].email,
                contactNumber: user[0].phone_number,
                role: {
                    roleId: role[0].user_role_id,
                    name: role[0].role_name
                },
                createdTime: user[0].created_time,
                lastModifiedTime: user[0].last_modified_time,
                isActive: user[0].is_active
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while fetching the user',
            data: null
        });
    }
});





app.get('/users', async (req, res) => {

    console.log('jbkjnkj');
    try {
        const [rows] = await connection.query(
            `SELECT * from users`
        );
        const [roles] = await connection.query(
            `SELECT * from user_roles`
        );

        console.log(rows);

        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'Users Fetched',
            data: rows.map(user => ({
                userId: user.user_id,
                firstName: user.first_name,
                lastName: user.last_name,
                gender: user.gender,
                email: user.email,
                contactNumber: user.phone_number,
                role: {
                    roleId: user.user_role_id,
                    roleName: roles.filter((r) => r.user_role_id == user.user_role_id ? r.role_name : '')
                },
                createdTime: user.created_time,
                lastModifiedTime: user.last_modified_time,
                isActive: user.is_active
            }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while fetching users',
            data: null
        });
    }
});



// login and signup




















// Update Business
app.put('/business/:businessId', async (req, res) => {
    const businessId = req.params.businessId;

    console.log(req.body);
    const { businessName: name, email, contactNumber, city, createdTime, lastModifiedTime } = req.body;

    console.log(name, email, contactNumber, city, createdTime, lastModifiedTime);



    // Validate the request body
    // if (!name || !email || !contactNumber || !city || !createdTime || !lastModifiedTime) {
    //   return res.status(400).json({
    //     timestamp: Date.now(),
    //     status: 400,
    //     error: 'Bad Request',
    //     message: 'Missing required fields',
    //     data: null
    //   });
    // }

    try {


        // Update the business
        await connection.query(
            'UPDATE businesses SET business_name = ?, business_email = ?, contact_number = ?, city = ? WHERE business_id = ?',
            [name, email, contactNumber, city, businessId]
        );

        // Retrieve the updated business
        const [business] = await connection.query('SELECT * FROM businesses WHERE business_id = ?', [businessId]);



        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'Business Updated',
            data: {
                businessId: business[0].business_id,
                name: business[0].business_name,
                email: business[0].business_email,
                contactNumber: business[0].contact_number,
                city: business[0].city,
                createdTime: business[0].created_time,
                lastModifiedTime: business[0].last_modified_time
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while updating the business',
            data: null
        });
    }
});




// Update users
app.put('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { firstName, lastName, email, contactNumber, gender } = req.body;

    // console.log(firstName, lastName, email, contactNumber, gender);




    try {


        // Update the users
        await connection.query(
            'UPDATE users SET first_name = ?, last_name = ?, gender = ?, email = ?, phone_number = ? WHERE user_id = ?',
            [firstName, lastName, gender, email, contactNumber, userId]
        );

        // Retrieve the updated users
        const [user] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);





        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'user Updated',
            data: {
                userId: user[0].user_id,
                firstName: user[0].first_name,
                lastName: user[0].last_name,
                email: user[0].email,
                contactNumber: user[0].phone_number,
                city: user[0].gender,
                createdTime: user[0].created_time,
                lastModifiedTime: user[0].last_modified_time
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while updating the business',
            data: null
        });
    }
});










// Add Business
app.post('/business', async (req, res) => {


    const { name, email, contactNumber, city, businessId, adminUserId } = req.body;

    console.log(name);




    try {


        // Insert the new business
        const [result] = await connection.query(
            'INSERT INTO businesses (business_name, business_email, contact_number, city,admin_user_id) VALUES (?, ?, ?, ?,?)',
            [name, email, contactNumber, city, adminUserId]
        );

        const businessId = result.insertId;

        // Retrieve the created business
        const [business] = await connection.query('SELECT * FROM businesses WHERE business_id = ?', [businessId]);



        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'Business Added',
            data: {
                businessId: business[0].business_id,
                name: business[0].business_name,
                email: business[0].business_email,
                contactNumber: business[0].contact_number,
                city: business[0].city,
                createdTime: business[0].created_time,
                lastModifiedTime: business[0].last_modified_time
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while adding the business',
            data: null
        });
    }
});





app.get('/business/:businessId', async (req, res) => {

    const businessId = req.params.businessId;
    console.log(businessId);

    try {
        const [business] = await connection.query('SELECT * FROM businesses WHERE business_id = ?', [businessId]);

        if (business.length === 0) {
            return res.status(404).json({
                timestamp: Date.now(),
                status: 404,
                error: 'Not Found',
                message: 'User not found',
                data: null
            });
        }

        console.log(business);


        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'User Fetched',
            data: {
                businessId: business[0].business_id,
                businessName: business[0].business_name,
                email: business[0].business_email,
                contactNumber: business[0].contact_number,
                city: business[0].city,
                adminUserId: business[0].admin_user_id,
                createdTime: business[0].created_time,
                lastModifiedTime: business[0].last_modified_time,

            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while fetching the user',
            data: null
        });

    }

});








app.get('/business', async (req, res) => {
    try {
        const [business] = await connection.query(
            `select * from businesses`
        );



        console.log(business);

        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'Businesses Fetched',
            data: business
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while fetching users',
            data: null
        });
    }
});






app.post('/sales', async (req, res) => {
    const { invoiceNumber, businessId, amount } = req.body;


    try {
        const [result] = await connection.query(
            `INSERT INTO sales (invoice_number, business_id, amount)
         VALUES (?, ?, ?)`,
            [invoiceNumber, businessId, amount]
        );

        const [newSale] = await connection.query(`SELECT * FROM sales WHERE sales_id = ?`, [result.insertId]);

        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'Sales Added',
            data: newSale[0]
        });
    } catch (error) {
        console.error('Error adding sales:', error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while adding the sale',
            data: null
        });
    }
});










app.get('/sales/:salesId', async (req, res) => {

    const salesId = req.params.salesId;
    console.log(salesId);

    try {
        let [sales] = await connection.query('SELECT * FROM sales WHERE sales_id = ?', [salesId]);

        if (sales.length === 0) {
            return res.status(404).json({
                timestamp: Date.now(),
                status: 404,
                error: 'Not Found',
                message: 'User not found',
                data: null
            });
        }


        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'sales Fetched',
            data: {
                salesId: sales[0].sales_id,
                invoiveNumber: sales[0].invoice_number,
                businessId: sales[0].business_id,
                amount: sales[0].amount,
                createdTime: sales[0].created_time,
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while fetching the user',
            data: null
        });

    }

});








app.get('/sales', async (req, res) => {
    const { startDate, businessId, invoiceNumber, city } = req.query;

    console.log(req.query);

    let que = `SELECT b.business_id, 
b.business_name, 
b.city, 
s.sales_id, 
s.invoice_number, 
s.amount, 
s.created_time
FROM 
businesses b
JOIN 
sales s 
ON 
b.business_id = s.business_id;`

    // if (startDate) {
    //     query += ' AND s.created_time >= ?';
    //     queryParams.push(startDate);
    // }

    // if (endDate) {
    //   query += ' AND b.last_modified_time <= ?';
    //   queryParams.push(endDate);
    // }

    // if (businessId) {
    //     query += ' AND s.business_id = ?';
    //     queryParams.push(businessId);
    // }

    // if (invoiceNumber) {
    //     query += ' AND s.invoice_number = ?';
    //     queryParams.push(invoiceNumber);
    // }

    // if (city) {
    //     query += ' AND b.city = ?';
    //     queryParams.push(city);
    // }

    try {
        const [results] = await connection.query(que);

        console.log('sdgdrgdrcg',results);

        res.status(200).json({
            timestamp: Date.now(),
            status: 200,
            error: null,
            message: 'Sales Fetched',
            data: results
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while fetching sales',
            data: null
        });
    }
});






app.post('/signup', async (req, res) => {

    console.log(req.body);
    const { name, email, password } = req.body;



    try {
        // Check if the email already exists
        const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUser.length != 0) {
            return res.status(409).json({
                timestamp: Date.now(),
                status: 409,
                error: 'Conflict',
                message: 'Email already exists',
                data: null
            });
        }

        // Insert the new user
        const [result] = await connection.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );

        const userId = result.insertId;


        res.status(201).json({
            timestamp: Date.now(),
            status: 201,
            error: null,
            message: 'Signup Completed',
            data: {
                userId,
                name,
                email,
                password,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            timestamp: Date.now(),
            status: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while creating the user',
            data: null
        });
    }
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await connection.query(
            'SELECT * from users WHERE email=?',
            [email]
        );

        [user] = user[0];


        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // const isMatch = await bcrypt.compare(password, user.password);

        if (password != user.password) {
            return res.status(401).json({ error: 'Invalid email or password', loginStatus: false });
        }

        // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'login successful', data: user, loginStatus: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to login user' });
    }
});






const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
