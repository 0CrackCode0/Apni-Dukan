const express = require("express")
const cors = require("cors")
require("dotenv").config()
const path = require("path")

require("./db-connect")


const Router = require("./routes")
var corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
}


const app = express()
app.use(cors(corsOptions))
app.use(express.json())
app.use("/public", express.static("./public"))
app.use(express.static(path.join(__dirname, 'dist')))
app.use("/api", Router)

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

let port = process.env.PORT || 8000
app.listen(port, console.log(`Server is running at http://localhost:${port}`))