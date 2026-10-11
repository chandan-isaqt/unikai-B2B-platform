const Setting = require('../models/Setting');
const Salesman = require('../models/Salesman');

const getOrInitSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({
      companyName: 'Unikai Foods PJSC - B2B Division',
      currency: 'OMR',
      currencySymbol: 'OMR',
      currencyDecimals: 3,
      minOrderAmount: 0,
      supportEmail: 'b2b.oman@unikai.com',
      supportPhone: '+968 2450 1234',
      headOfficeAddress: 'Ghala Industrial Estate, Muscat, Sultanate of Oman',
      whatsappOrderEnabled: true,
    });
  }
  return settings;
};

// GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    const [settings, salesman] = await Promise.all([getOrInitSettings(), Salesman.findOne()]);
    return res.json({
      success: true,
      settings,
      salesman,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings (Admin)
const updateSettings = async (req, res, next) => {
  try {
    const settings = await getOrInitSettings();
    const {
      companyName,
      currency,
      currencySymbol,
      currencyDecimals,
      minOrderAmount,
      supportEmail,
      supportPhone,
      headOfficeAddress,
      whatsappOrderEnabled,
      salesman: salesmanData,
    } = req.body;

    if (companyName !== undefined) settings.companyName = companyName.trim();
    if (currency !== undefined) settings.currency = currency.trim();
    if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol.trim();
    if (currencyDecimals !== undefined) settings.currencyDecimals = Number(currencyDecimals);
    if (minOrderAmount !== undefined) settings.minOrderAmount = Number(minOrderAmount);
    if (supportEmail !== undefined) settings.supportEmail = supportEmail.trim();
    if (supportPhone !== undefined) settings.supportPhone = supportPhone.trim();
    if (headOfficeAddress !== undefined) settings.headOfficeAddress = headOfficeAddress.trim();
    if (whatsappOrderEnabled !== undefined)
      settings.whatsappOrderEnabled = Boolean(whatsappOrderEnabled);

    await settings.save();

    let salesman = await Salesman.findOne();
    if (salesmanData && salesman) {
      if (salesmanData.name !== undefined) salesman.name = salesmanData.name.trim();
      if (salesmanData.title !== undefined) salesman.title = salesmanData.title.trim();
      if (salesmanData.phone !== undefined) salesman.phone = salesmanData.phone.trim();
      if (salesmanData.whatsappNumber !== undefined)
        salesman.whatsappNumber = salesmanData.whatsappNumber.trim();
      if (salesmanData.email !== undefined) salesman.email = salesmanData.email.trim();
      if (salesmanData.region !== undefined) salesman.region = salesmanData.region.trim();
      if (salesmanData.workingHours !== undefined)
        salesman.workingHours = salesmanData.workingHours.trim();
      if (salesmanData.isActive !== undefined) salesman.isActive = Boolean(salesmanData.isActive);
      await salesman.save();
    }

    return res.json({
      success: true,
      message: 'Settings updated successfully.',
      settings,
      salesman,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
