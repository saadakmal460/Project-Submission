const IllegalParking = require('../Models/Detection');

// Add an illegal parking detection
const addDetection = async (req, res) => {
  try {
    const { title, location, time, status } = req.body;

    // Validate input
    if (!title || !location || !time) {
      return res.status(400).json({ message: 'Title, location, and time are required.' });
    }

    // Create a new illegal parking record
    const newDetection = new IllegalParking({
      title,
      location,
      time,
      status: status || 'Unconfirmed', // Default to 'Pending' if no status provided
    });

    await newDetection.save(); // Save to database

    return res.status(201).json({ 
      message: 'Illegal parking detection added successfully.', 
      data: newDetection 
    });
  } catch (error) {
    console.error('Error adding illegal parking detection:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};


// Confirm Detection API
const confirmDetection = async (req, res) => {
  try {
    const { id } = req.params;

    // Find detection by ID and update status to 'Confirm'
    const updatedDetection = await IllegalParking.findByIdAndUpdate(
      id,
      { status: 'Confirm' },
      { new: true }
    );

    if (!updatedDetection) {
      return res.status(404).json({ message: 'Detection not found.' });
    }

    return res.status(200).json({ 
      message: 'Detection confirmed successfully.', 
      data: updatedDetection 
    });
  } catch (error) {
    console.error('Error confirming detection:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

//Get Pending Detections API
const getPendingDetections = async (req, res) => {
  try {
    const pendingDetections = await IllegalParking.find({ status: 'Confirm' });

    return res.status(200).json({ 
      message: 'Pending detections fetched successfully.', 
      data: pendingDetections 
    });
  } catch (error) {
    console.error('Error fetching pending detections:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};


// Resolve Detection API
const resolveDetection = async (req, res) => {
  try {
    const { id } = req.params;
    const {user_id} = req.body

    // Find detection by ID and update status to 'Resolved'
    const resolvedDetection = await IllegalParking.findByIdAndUpdate(
      id,
      { status: 'Resolved' , resolvedBy:user_id },
      { new: true }
    );

    if (!resolvedDetection) {
      return res.status(404).json({ message: 'Detection not found.' });
    }

    return res.status(200).json({ 
      message: 'Detection resolved successfully.', 
      data: resolvedDetection 
    });
  } catch (error) {
    console.error('Error resolving detection:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

// Mark Detection as Sent
const markAsSent = async (req, res) => {
  try {
    const { id } = req.params;

    const sentDetection = await IllegalParking.findByIdAndUpdate(
      id,
      { status: 'Sent' },
      { new: true }
    );

    if (!sentDetection) {
      return res.status(404).json({ message: 'Detection not found.' });
    }

    return res.status(200).json({ 
      message: 'Detection marked as sent successfully.', 
      data: sentDetection 
    });
  } catch (error) {
    console.error('Error marking detection as sent:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

// Mark Detection as Unconfirmed
const markAsUnconfirmed = async (req, res) => {
  try {
    const { id } = req.params;

    const unconfirmedDetection = await IllegalParking.findByIdAndUpdate(
      id,
      { status: 'Unconfirmed' },
      { new: true }
    );

    if (!unconfirmedDetection) {
      return res.status(404).json({ message: 'Detection not found.' });
    }

    return res.status(200).json({ 
      message: 'Detection marked as unconfirmed successfully.', 
      data: unconfirmedDetection 
    });
  } catch (error) {
    console.error('Error marking detection as unconfirmed:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};


const deleteDetection = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    // Use findByIdAndDelete to find and delete the document
    const detection = await IllegalParking.findByIdAndDelete(id);

    if (!detection) {
      return res.status(404).json({ message: 'Detection not found' });
    }

    res.status(200).json({ message: 'Detection deleted successfully' });
  } catch (error) {
    console.error('Error deleting detection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const getAllDetections = async (req, res) => {
  try {
    const detections = await IllegalParking.find()
      .populate('resolvedBy', 'username')  // Populate only the 'name' field from the User model
      .exec();  // Execute the query

    res.status(200).json(detections);  // Send the detections as JSON response
  } catch (err) {
    res.status(500).json({ message: 'Error fetching detections', error: err.message });
  }
};



module.exports = { addDetection, confirmDetection, getPendingDetections, resolveDetection, markAsSent, markAsUnconfirmed,getAllDetections,deleteDetection };
