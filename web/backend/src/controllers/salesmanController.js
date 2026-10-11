const Salesman = require('../models/Salesman');

const getOrInitSalesman = async () => {
  let salesman = await Salesman.findOne();
  if (!salesman) {
    salesman = await Salesman.create({
      name: process.env.SALESMAN_NAME || 'Sachin',
      title: 'Senior B2B Sales Executive - Oman & GCC',
      phone: process.env.SALESMAN_PHONE || process.env.WHATSAPP_NUMBER || '+96891234567',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '+96891234567',
      email: process.env.SALESMAN_EMAIL || 'sachin.sales@unikai.local',
      region: 'Muscat, Sultanate of Oman & GCC Region',
      workingHours: 'Sun - Thu: 7:30 AM - 6:30 PM (Oman Time)',
      isActive: true,
    });
  }
  return salesman;
};

// GET /api/salesman
const getSalesman = async (req, res, next) => {
  try {
    const salesman = await getOrInitSalesman();
    return res.json({
      success: true,
      salesman,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/salesman (Admin)
const updateSalesman = async (req, res, next) => {
  try {
    const salesman = await getOrInitSalesman();
    const { name, title, phone, whatsappNumber, email, region, workingHours, isActive } = req.body;

    if (name !== undefined) salesman.name = name.trim();
    if (title !== undefined) salesman.title = title.trim();
    if (phone !== undefined) salesman.phone = phone.trim();
    if (whatsappNumber !== undefined) salesman.whatsappNumber = whatsappNumber.trim();
    if (email !== undefined) salesman.email = email.trim();
    if (region !== undefined) salesman.region = region.trim();
    if (workingHours !== undefined) salesman.workingHours = workingHours.trim();
    if (isActive !== undefined) salesman.isActive = Boolean(isActive);

    await salesman.save();

    return res.json({
      success: true,
      message: 'Salesman settings updated successfully.',
      salesman,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesman,
  updateSalesman,
};
