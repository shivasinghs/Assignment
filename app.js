try {
  const express = require("express")
  const cors = require('cors');
  const corsOptions = require("./config/security")

  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cors(corsOptions));


  app.get("/", (req, res) => {
    res.send("Hello from the backend!")
  })

  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
} catch (error) {
  throw error
}
