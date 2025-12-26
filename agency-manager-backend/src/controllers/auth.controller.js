const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { generateToken } = require("../utils/jwt");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      passwordHash
    });

    const token = generateToken({ userId: user._id });

    const refreshTokenValue = crypto.randomBytes(64).toString("hex");
    const refreshToken = await RefreshToken.create({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      token,
      refreshToken: refreshToken.token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ userId: user._id });

    const refreshTokenValue = crypto.randomBytes(64).toString("hex");
    const refreshToken = await RefreshToken.create({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      token,
      refreshToken: refreshToken.token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= REFRESH TOKEN ================= */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    const stored = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const token = generateToken({ userId: stored.userId });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Refresh failed" });
  }
};

/* ================= LOGOUT ================= */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { revoked: true }
    );

    res.json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

/* ================= ME ================= */
exports.me = async (req, res) => {
  res.json(req.user);
};
