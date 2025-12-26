const Client = require("../models/Client");

/**
 * Create client
 */
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const orgId = req.query.orgId || req.body.orgId;
    
    console.log('Creating client - orgId:', orgId, 'name:', name);

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Client name is required" });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      orgId
    });
    
    console.log('Client created successfully:', client._id, 'for orgId:', client.orgId);

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: "Failed to create client" });
  }
};

/**
 * List clients
 */
exports.getClients = async (req, res) => {
  try {
    const orgId = req.query.orgId;
    
    console.log('Getting clients for orgId:', orgId);
    
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { orgId };

    const clients = await Client.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    console.log('Found', clients.length, 'clients for orgId:', orgId);

    const total = await Client.countDocuments(filter);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: clients
    });
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};


exports.getClientById = async (req, res) => {
  try {
    const orgId = req.query.orgId;
    
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const client = await Client.findOne({
      _id: req.params.id,
      orgId
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch client" });
  }
};
exports.updateClient = async (req, res) => {
  try {
    const orgId = req.query.orgId || req.body.orgId;
    
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        orgId
      },
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
      },
      { new: true } // return updated client
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update client" });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const orgId = req.query.orgId || req.body.orgId;
    
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      orgId
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete client" });
  }
};

