const express = require('express');
const bodyParser = require('body-parser');
const staffRouter = require('./routes/staffRouter');
const admission_patient_medicalhxRouter = require('./routes/admission_patient_medicalhxRouter');
const treatment_investigationRouter = require('./routes/treatment_investigationRouter');
const analysisRouter= require('./routes/analysisRouter')
const exportRouter = require('./routes/exportRoutes')
const cors = require('cors');
const { sequelize } = require('./models');  // Import the sequelize instance
const nodemailer = require('nodemailer')
const passport = require('./Config/passport')
const jwtStrategy =require('./Config/passport');  // Import the JWT strategy you defined
const { GoogleGenerativeAI } = require('@google/generative-ai');// import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

app.use(bodyParser.json());
app.use(cors());

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'gyntngv@gmail.com', // replace with your email
    pass: 'ymee fufl synm cknk', // replace with your email password
  },
});

// Use the staffRouter for handling /staff-related routes
app.use('/staff', staffRouter);
app.use('/patient', admission_patient_medicalhxRouter);
app.use('/visit',treatment_investigationRouter)
app.use('/analysis',analysisRouter)
app.use('/export',exportRouter)

app.post('/chat', async (req, res) => {
  const { userMessage } = req.body;
  console.log(userMessage)

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat();
    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.post('/contact_us', (req, res) => {
  const { email, username, complaints } = req.body;
  console.log(req.body);
  if (!email || !username || !complaints) {
    return res.status(400).send({ error: 'All fields are required.' });
  }

  const mailOptions = {
    from: email,
    to: 'gyntngv@gmail.com', 
    subject: `Complaint from ${username}`,
    text: `Username: ${username}\n Email: ${email}\n Complaint:\n${complaints}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send({ error: 'Failed to send email.' });
    }
    res.send({ message: 'Complaint submitted successfully!' });
  });
});

// Sync models with the database
sequelize.sync()  // Make sure models and associations are synced
  .then(() => {
    console.log('Database synced successfully');
    // Start the server only after syncing
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // console.error('Error syncing database:', err);
});

