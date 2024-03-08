const { authService } = require("../services");

const loginController = async (req, res) => {
  try {
    const result = await authService.loginUser(
      res,
      req.body.username,
      req.body.password
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logoutController = async (req, res) => {
  try {
    const result = authService.logoutUser(res);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const registerUserController = async (req, res) => {
  try {
    const userData = req.body;
    const result = await authService.registerUser(userData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const checkPermissionsController = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "UserID is required" });
  }

  try {
    const result = await authService.checkUserPermissions(userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  loginController,
  logoutController,
  registerUserController,
  checkPermissionsController,
};
