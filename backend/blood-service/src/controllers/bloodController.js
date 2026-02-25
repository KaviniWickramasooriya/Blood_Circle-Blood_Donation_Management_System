const { Blood } = require("../config/db").models;
//const bcrypt = require('bcrypt');

exports.createBlood = async (req, res) => {
  try {
    const blood = await Blood.create(req.body);
    res.status(201).json(blood);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get single blood record by ID
exports.getBloodRecordById = async (req, res) => {
  try {
    const bloodRecord = await Blood.findByPk(req.params.id);
    console.log(bloodRecord);

    if (!bloodRecord) {
     return res.status(404).json({ message: "Blood record not :(" });
    }
    res.json(bloodRecord);
  } catch (err) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllBloodRecords = async (req, res) => {
  try {
    const bloodRecords = await Blood.findAll(); // Sequelize → findAll(), not find()
    res.json(bloodRecords);
  } catch (err) {
    res.status(500).json({ error: error.message });
  }
};
// Update blood record
exports.updateBloodRecord = async (req, res) => {
  try {
    const bloodRecord = await Blood.findByPk(req.params.id);
    if (!bloodRecord) return res.status(404).json({ message: "Not found" });

    await bloodRecord.update(req.body);
    res.json(bloodRecord);
  } catch (err) {
    res.status(500).json({ error: error.message });
  }
};

// Delete blood record
exports.deleteBloodRecord = async (req, res) => {
  try {
    const bloodRecord = await Blood.findByPk(req.params.id);
    if (!bloodRecord) return res.status(404).json({ message: "Not found" });

    await bloodRecord.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: error.message });
  }
};

exports.addBloodQuantity = async (req, res) => {
  const { id } = req.params;
  const quantityToAdd = Number(req.body.quantity);

  if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
    return res
      .status(400)
      .json({ error: "Quantity must be a positive number" });
  }

  try {
    const blood = await Blood.findByPk(id);
    if (!blood)
      return res.status(404).json({ message: "Blood type not found" });

    await blood.increment("quantity", { by: quantityToAdd });
    await blood.reload();

    res.status(200).json({
      message: `Added ${quantityToAdd} units to blood type ${blood.type}`,
      blood,
    });
  } catch (error) {
    console.error("Error adding blood quantity:", error);
    res.status(500).json({ error: "Server error" });
  }
};
