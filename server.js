require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect((err) => {
    if (err) {
        console.error(`Erro ao conectar ao banco de dados: ${err}`);
        return;
    }

    console.log(`Conectado ao mysql na porta ${process.env.DB_PORT}`);
});

app.get("/", (req, res) => {
    res.send("API conectada ao MySQL!");
});

app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            res.status(500).json({ erro: "Erro ao buscar usuários" });
            return;
        }
        res.json(result);
    });
});

app.post("/users", (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ error: "Username e email são obrigatórios" });
    }

    const sql = "INSERT INTO users (username, email) VALUES (?, ?)";

    db.query(sql, [username, email], (err, result) => {
        if (err) {
            console.error("Erro ao criar usuário:", err);
            return res.status(500).json({ error: "Erro ao criar usuário no banco de dados" });
        }

        res.status(201).json({ message: "Usuário criado com sucesso", id: result.insertId });
    });
});

app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ error: "Username e email são obrigatórios" });
    }

    const sql = "UPDATE users SET username = ?, email = ? WHERE id = ?";

    db.query(sql, [username, email, id], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar usuário:", err);
            return res.status(500).json({ error: "Erro ao atualizar usuário no banco de dados" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    });
});

app.delete("/users/:id", (req, res) => {
    const userId = req.params.id;

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Erro ao deletar usuário:", err);
            return res.status(500).json({ error: "Erro ao deletar usuário" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json({ message: "Usuário deletado com sucesso!" });
    });
});

app.listen(PORT, () => {
    console.log(`servidor rodando em http://localhost:${PORT}`);
});
