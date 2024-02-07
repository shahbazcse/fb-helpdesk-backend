require("./db/db.connection");

const Client = require("./models/client.model");
const bcrypt = require("bcrypt");

const express = require("express");
const app = express();
app.use(express.json());

const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:3000', 'https://localhost:3000', 'https://fb-helpdesk-pro.vercel.app'],
  credentials: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Signup

app.post("/signup", async (req, res) => {
  try {
    const userData = req.body;
    const user = await signup(userData);

    res.status(201).json({
      message: "Client Registered",
      user,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function signup(userData) {
  try {
    const foundEmail = await Client.findOne({ email: userData.email });
    if (foundEmail) {
      throw new Error("Client already registered");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new Client({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    return user;
  } catch (error) {
    throw error;
  }
}

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await login(email, password);
    res.status(200).json({
      message: "User Logged In",
      user,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function login(email, password) {
  try {
    const user = await Client.findOne({ email: email });
    if (!user) {
      throw new Error("User Not Found or Incorrect Email Entered");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return user;
    } else {
      throw new Error("Incorrect Password");
    }
  } catch (error) {
    throw error;
  }
}

// Update ClientID
app.post("/add-client-id", async (req, res) => {
  try {
    const { email, clientID } = req.body;
    const user = await updateClientID(email, clientID);
    res.status(200).json({
      message: "Client ID Updated",
      user,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function updateClientID(email, clientID) {
  try {
    const user = await Client.findOne({ email: email });

    user.clientID = clientID;
    const updatedUser = await user.save();
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

// Update Conversations
app.post("/update-conversations", async (req, res) => {
  try {
    const { email, conversations } = req.body;
    const user = await updateConversations(email, conversations);
    res.status(200).json({
      message: "Conversations Updated",
      conversations: user.conversations,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function updateConversations(email, conversations) {
  try {
    const user = await Client.findOne({ email: email });

    user.conversations = conversations;
    const updatedUser = await user.save();

    return updatedUser;
  } catch (error) {
    throw error;
  }
}

// Get User

app.get("/get-user", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUser(email);
    res.status(200).json({
      message: "User Fetched",
      user,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function getUser(email) {
  try {
    const user = await Client.findOne({ email: email });

    if(!user) throw new Error("User Not Found");
    
    return user;
  } catch (error) {
    throw error;
  }
}