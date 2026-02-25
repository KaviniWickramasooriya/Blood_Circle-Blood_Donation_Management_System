const { BloodRequest, Blood } = require('../config/db').models;
const sendEmail = require('../utils/sendEmails');


// // Create new blood request
// exports.createBloodRequest = async (req, res) => {
//   const { blood_id, quantity, name, contactNumber, email } = req.body;

//   try {
//     // 1. Check if blood type exists
//     const blood = await BloodRequest.findByPk(blood_id);
//     if (!blood) {
//       return res.status(404).json({ error: 'Blood type not found' });
//     }

//     // 2. Check stock availability
//     if (blood.quantity < quantity) {
//       return res.status(400).json({ error: 'Not enough blood units available' });
//     }

//     // 3. Create blood request
//     const bloodRequest = await BloodRequest.create({
//       blood_id,
//       quantity,
//       name,
//       contactNumber,
//       email
//     });

//     // 4. Deduct stock
//     blood.quantity = quantity;
//     await blood.save();

//     res.status(201).json({
//       message: 'Blood request created successfully',
//       request: bloodRequest
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

exports.createBloodRequest = async (req, res) => {
  const { blood_id, quantity, name, contactNumber, email } = req.body;

  try {
    // 1. Check if blood type exists in the Blood table
    const blood = await Blood.findByPk(blood_id);
    if (!blood) {
      return res.status(404).json({ error: 'Blood type not found' });
    }

    // 2. (Optional) Check stock availability
    if (Number(blood.quantity) < Number(quantity)) {
      return res.status(400).json({ error: 'Not enough blood units available' });
    }

    // 3. Create blood request
    const bloodRequest = await BloodRequest.create({
      blood_id,
      quantity,
      name,
      contactNumber,
      email
    });

    res.status(201).json({
      message: 'Blood request created successfully',
      request: bloodRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


/* exports.getAllBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.findAll({
      include: [
        {
          model: Blood,
          as: 'blood', // must match the alias in BloodRequest.associate
          required: false // Use left join to include requests even if blood type is missing
        },
      ],
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    res.status(500).json({ error: error.message });
  }
}; */

exports.getAllBloodRequests = async (req, res) => {
  try {
    // Fetch all BloodRequest records without joining Blood
    const requests = await BloodRequest.findAll();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    res.status(500).json({ error: error.message });
  }
};


// Get single blood request by ID
exports.getBloodRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id, {
      include: { association: 'blood' }
    });
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
   
  }
};

// Update blood request
exports.updateBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    await request.update(req.body);
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete blood request
exports.deleteBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    await request.destroy();
    res.json({ message: 'Blood request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update blood request status (Admin only)
exports.updateBloodRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'pending', 'approved', 'declined'

  try {
    // Validate status
    if (!['pending', 'approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find request
    const request = await BloodRequest.findByPk(id, { include: { association: 'blood' } });
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // If approved → reduce blood stock
    if (status === 'approved') {
      const blood = request.blood;
      if (blood.quantity < request.quantity) {
        return res.status(400).json({ error: 'Not enough stock to approve this request' });
      }
      blood.quantity -= request.quantity;
      await blood.save();
    }

    // Update status
    request.status = status;
    await request.save();

    // Send email notification
    let subject, message;

    if (status === 'approved') {
      subject = 'Your Blood Request Has Been Approved';
      message = `Dear ${request.name},

Your blood request for ${request.quantity} unit(s) of ${request.blood.bloodType} has been approved.

You can collect it at your registered hospital.

Thank you,
Blood Donation Service`;
    } else if (status === 'declined') {
      subject = 'Your Blood Request Has Been Declined';
      message = `Dear ${request.name},

We’re sorry to inform you that your blood request for ${request.quantity} unit(s) of ${request.blood.bloodType} has been declined.

Please contact us for more details.

Best regards,
Blood Donation Service`;
    } else {
      subject = 'Your Blood Request Is Pending';
      message = `Dear ${request.name},

Your blood request for ${request.quantity} unit(s) of ${request.blood.bloodType} is currently pending review.

We’ll update you soon.

Best regards,
Blood Donation Service`;
    }

    await sendEmail(request.email, subject, message);

    // ✅ Response to client
    res.json({
      message: `Blood request ${status} successfully.`,
      request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};



/*const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const offset = (page - 1) * limit;

const requests = await BloodRequest.findAndCountAll({ limit, offset });
res.json({
  data: requests.rows,
  total: requests.count,
  page,
  totalPages: Math.ceil(requests.count / limit)
});
*/