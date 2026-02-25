const Role = require('../models/Role');

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    const role = await Role.create({ name });
    res.status(201).json({ data: role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json({ data: roles });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(200).json({ data: role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    role.name = name;
    await role.save();
    res.status(200).json({ data: role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    await role.destroy();
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRoleNameById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      attributes: ['name']
    });
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(200).json({ data: role.name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};