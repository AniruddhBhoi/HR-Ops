const Holiday = require('../model/holiday');

// Get all holidays
exports.getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get holidays by year
exports.getHolidaysByYear = async (req, res) => {
  try {
    const holidays = await Holiday.find({ year: req.params.year }).sort({ date: 1 });
    res.json(holidays);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add holiday
// exports.addHoliday = async (req, res) => {
//   try {
//     const { name, date, type } = req.body;
//     const year = new Date(date).getFullYear();

//     const holiday = await new Holiday({ name, date, type, year }).save();
//     res.status(201).json({ message: 'Holiday added successfully', holiday });
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Update holiday
// exports.updateHoliday = async (req, res) => {
//   try {
//     const { name, date, type } = req.body;
//     const year = new Date(date).getFullYear();

//     const holiday = await Holiday.findByIdAndUpdate(req.params.id, { name, date, type, year }, { new: true });
//     if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

//     res.json({ message: 'Holiday updated successfully', holiday });
//   } catch {
//     res.status(500).json({ message: 'Server error' });
//   }
// };


exports.addHoliday = async (req, res) => {
  try {

    console.log("function called");

    let { name, fromDate, toDate, type } = req.body;

    console.log(req.body);


    if (!name || !fromDate || !toDate || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start.getTime() > end.getTime()) {
      return res.status(400).json({ message: "From date cannot be after To date" });
    }

    const year = start.getFullYear();

    // Check if an existing holiday overlaps the same day(s)
    const existing = await Holiday.findOne({
      $or: [
        {
          fromDate: { $lte: end },
          toDate: { $gte: start },
        },
      ],
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Holiday already exists in this date range" });
    }

    // ✅ Create and save
    const holiday = new Holiday({
      name,
      fromDate: start,
      toDate: end,
      type,
      year,
    });

    await holiday.save();

    // NOTIFICATION: Notify all users about the new holiday
    const { createNotification } = require('../controller/notificationController');
    const User = require('../model/userModel');
    const users = await User.find({});
    console.log(`[Holiday] Found ${users.length} users to notify.`);

    for (const user of users) {
      console.log(`[Holiday] Notifying user: ${user.name} (${user._id})`);
      const isSingleDay = holiday.fromDate.toDateString() === holiday.toDate.toDateString();
      const message = isSingleDay
        ? `New Holiday: ${holiday.name} on ${holiday.fromDate.toDateString()}.`
        : `New Holiday: ${holiday.name} from ${holiday.fromDate.toDateString()} to ${holiday.toDate.toDateString()}.`;

      await createNotification(
        user._id,
        'Holiday',
        message,
        holiday._id,
        req.user.userId
      );
    }

    res.status(201).json({
      message:
        start.getTime() === end.getTime()
          ? "Single-day holiday added successfully"
          : "Holiday added successfully",
      holiday,
    });
  } catch (error) {
    console.error("Error adding holiday:", error);
    res.status(500).json({ message: "Server error while adding holiday" });
  }
};


// Update holiday
exports.updateHoliday = async (req, res) => {
  try {
    const { name, fromDate, toDate, type } = req.body;
    const year = new Date(fromDate).getFullYear();

    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { name, fromDate, toDate, type, year },
      { new: true }
    );

    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    res.json({ message: "Holiday updated successfully", holiday });
  } catch (err) {
    console.error("Update Holiday Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

    res.json({ message: 'Holiday deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
