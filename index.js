
// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // 1. MySQL Connection with SSL (Aiven)
// const db = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT,
//     ssl: { rejectUnauthorized: false },
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// // 2. Auto-Create Tables (Database Schema)
// const initDB = () => {
//     const createCasesTable = `
//         CREATE TABLE IF NOT EXISTS cases (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             case_id VARCHAR(20) UNIQUE NOT NULL,
//             originator_name VARCHAR(255) NOT NULL,
//             status ENUM('active', 'frozen', 'resolved') DEFAULT 'active',
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         );`;

//     const createSubmissionsTable = `
//         CREATE TABLE IF NOT EXISTS submissions (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             case_id VARCHAR(20),
//             full_name VARCHAR(255) NOT NULL,
//             bank_name VARCHAR(100) NOT NULL,
//             account_details VARCHAR(100) NOT NULL,
//             amount DECIMAL(15, 2) NOT NULL,
//             tx_datetime DATETIME NOT NULL,
//             sender_info VARCHAR(255),
//             receiver_info VARCHAR(255),
//             bank_ref_id VARCHAR(100),
//             description TEXT,
//             user_role ENUM('Originator', 'Member') NOT NULL,
//             FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
//         );`;

//     db.query(createCasesTable, (err) => {
//         if (err) console.log("❌ Cases Table Error:", err.message);
//         else console.log("✅ Cases Table Ready");
//     });

//     db.query(createSubmissionsTable, (err) => {
//         if (err) console.log("❌ Submissions Table Error:", err.message);
//         else console.log("✅ Submissions Table Ready");
//     });
// };

// initDB();

// // --- 3. API ROUTES ---

// // A. Create New Case (User A - Originator)
// app.post('/api/cases/create', (req, res) => {
//     const { originatorName, bankName, accountDetails, amount, txDatetime, description } = req.body;
    
//     // Generate Unique Case ID (e.g., CT-7A2B9C)
//     const caseId = 'CT-' + Math.random().toString(36).substr(2, 7).toUpperCase();

//     // 1. Insert into Cases table
//     const sqlCase = "INSERT INTO cases (case_id, originator_name) VALUES (?, ?)";
    
//     db.query(sqlCase, [caseId, originatorName], (err) => {
//         if (err) return res.status(500).json({ error: err.message });

//         // 2. Insert into Submissions table as Originator
//         const sqlSub = `INSERT INTO submissions 
//             (case_id, full_name, bank_name, account_details, amount, tx_datetime, description, user_role) 
//             VALUES (?, ?, ?, ?, ?, ?, ?, 'Originator')`;
        
//         db.query(sqlSub, [caseId, originatorName, bankName, accountDetails, amount, txDatetime, description], (err) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.status(200).json({ success: true, caseId: caseId });
//         });
//     });
// });

// // B. Join Existing Case (User B, C, D)
// app.post('/api/cases/join', (req, res) => {
//     const { caseId, fullName, bankName, accountDetails, amount, txDatetime, senderInfo, receiverInfo, description } = req.body;

//     // Pehle check karein ke Case ID exist karti hai ya nahi
//     const checkSql = "SELECT * FROM cases WHERE case_id = ?";
//     db.query(checkSql, [caseId], (err, results) => {
//         if (err) return res.status(500).json({ error: "Database Error" });
//         if (results.length === 0) return res.status(404).json({ error: "Invalid Case ID. Please check and try again." });

//         // Agar Case ID sahi hai, toh Join karwayein
//         const sqlJoin = `INSERT INTO submissions 
//             (case_id, full_name, bank_name, account_details, amount, tx_datetime, sender_info, receiver_info, description, user_role) 
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Member')`;

//         db.query(sqlJoin, [caseId, fullName, bankName, accountDetails, amount, txDatetime, senderInfo, receiverInfo, description], (err) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.status(200).json({ success: true, message: "Joined Chain Successfully" });
//         });
//     });
// });

// // C. Get Chain Flow (Visual Linking Logic)
// app.get('/api/cases/flow/:caseId', (req, res) => {
//     const { caseId } = req.params;
    
//     // Requirement ke mutabiq chronological order (A -> B -> C) mein data dena
//     const sql = "SELECT * FROM submissions WHERE case_id = ? ORDER BY tx_datetime ASC";

//     db.query(sql, [caseId], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(200).json(results);
//     });
// });

// // D. Admin Dashboard - Get All Submissions with Advanced Search
// app.get('/api/admin/all-submissions', (req, res) => {
//     const { search } = req.query; 
//     let sql = "SELECT * FROM submissions";
//     let params = [];
    
//     if (search) {
//         sql += " WHERE full_name LIKE ? OR bank_name LIKE ? OR case_id LIKE ?";
//         const searchWildcard = `%${search}%`;
//         params = [searchWildcard, searchWildcard, searchWildcard];
//     }
    
//     sql += " ORDER BY tx_datetime DESC";

//     db.query(sql, params, (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(200).json(results);
//     });
// });

// // E. Admin Dashboard - Get Summary of all Cases
// app.get('/api/admin/all-cases', (req, res) => {
//     const sql = "SELECT * FROM cases ORDER BY created_at DESC";
//     db.query(sql, (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(200).json(results);
//     });
// });

// app.get('/', (req, res) => {
//     res.send("🚀 ChainTrace API is running with Aiven MySQL Support!");
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 ChainTrace Backend running on port ${PORT}`);
// });





const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. SETTINGS: Images ke liye limit barhayi hai ---
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- 2. DATABASE CONNECTION (Aiven MySQL) ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- 3. AUTO-TABLE CREATION ---
const initDB = () => {
    const createCasesTable = `
        CREATE TABLE IF NOT EXISTS cases (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id VARCHAR(20) UNIQUE NOT NULL,
            originator_name VARCHAR(255) NOT NULL,
            status ENUM('active', 'frozen', 'resolved') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;

    const createSubmissionsTable = `
        CREATE TABLE IF NOT EXISTS submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id VARCHAR(20),
            full_name VARCHAR(255) NOT NULL,
            bank_name VARCHAR(100) NOT NULL,
            account_details VARCHAR(100) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            tx_datetime DATETIME NOT NULL,
            sender_info VARCHAR(255),
            receiver_info VARCHAR(255),
            bank_ref_id VARCHAR(100),
            description TEXT,
            proof_image LONGTEXT, 
            user_role ENUM('Originator', 'Member') NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
        );`;

    db.query(createCasesTable, (err) => {
        if (err) console.log("❌ Cases Table Error:", err.message);
        else console.log("✅ Cases Table Ready");
    });

    db.query(createSubmissionsTable, (err) => {
        if (err) console.log("❌ Submissions Table Error:", err.message);
        else console.log("✅ Submissions Table Ready");
    });
};

initDB();

// --- 4. API ROUTES ---

// A. Login Route (Admin Security)
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Simple logic: Aap apne mutabiq credentials badal sakte hain
    if (username === 'admin' && password === 'admin123') {
        res.status(200).json({ success: true, message: "Welcome Admin" });
    } else {
        res.status(401).json({ success: false, error: "Invalid Credentials" });
    }
});

// B. Create New Case (User A)
app.post('/api/cases/create', (req, res) => {
    const { originatorName, bankName, accountDetails, amount, txDatetime, description, proofImage } = req.body;
    const caseId = 'CT-' + Math.random().toString(36).substr(2, 7).toUpperCase();

    const sqlCase = "INSERT INTO cases (case_id, originator_name) VALUES (?, ?)";
    db.query(sqlCase, [caseId, originatorName], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const sqlSub = `INSERT INTO submissions 
            (case_id, full_name, bank_name, account_details, amount, tx_datetime, description, proof_image, user_role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Originator')`;
        
        db.query(sqlSub, [caseId, originatorName, bankName, accountDetails, amount, txDatetime, description, proofImage], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ success: true, caseId: caseId });
        });
    });
});

// C. Join Case (User B, C, D)
app.post('/api/cases/join', (req, res) => {
    const { caseId, fullName, bankName, accountDetails, amount, txDatetime, senderInfo, receiverInfo, description, proofImage } = req.body;

    db.query("SELECT * FROM cases WHERE case_id = ?", [caseId], (err, results) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        if (results.length === 0) return res.status(404).json({ error: "Invalid Case ID" });

        const sqlJoin = `INSERT INTO submissions 
            (case_id, full_name, bank_name, account_details, amount, tx_datetime, sender_info, receiver_info, description, proof_image, user_role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Member')`;

        db.query(sqlJoin, [caseId, fullName, bankName, accountDetails, amount, txDatetime, senderInfo, receiverInfo, description, proofImage], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ success: true });
        });
    });
});

// D. Get Chain Flow
app.get('/api/cases/flow/:caseId', (req, res) => {
    const sql = "SELECT * FROM submissions WHERE case_id = ? ORDER BY tx_datetime ASC";
    db.query(sql, [req.params.caseId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// E. Admin: All Submissions with Search
app.get('/api/admin/all-submissions', (req, res) => {
    const { search } = req.query; 
    let sql = "SELECT * FROM submissions";
    let params = [];
    if (search) {
        sql += " WHERE full_name LIKE ? OR bank_name LIKE ? OR case_id LIKE ?";
        const sw = `%${search}%`;
        params = [sw, sw, sw];
    }
    sql += " ORDER BY tx_datetime DESC";
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// F. Admin: Delete Case (Clean up logic)
app.delete('/api/admin/case/:caseId', (req, res) => {
    db.query("DELETE FROM cases WHERE case_id = ?", [req.params.caseId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ success: true, message: "Case Deleted" });
    });
});

app.get('/', (req, res) => res.send("🚀 ChainTrace API Active"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));