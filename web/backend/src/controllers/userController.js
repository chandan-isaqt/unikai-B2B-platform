const User = require('../models/User');
const Address = require('../models/Address');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('addresses');
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      user: {
        ...user.toSafeObject(),
        addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, companyName, email, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined && name.trim()) user.name = name.trim();
    if (companyName !== undefined) user.companyName = companyName.trim();
    if (phone !== undefined) user.phone = phone.trim();

    if (email !== undefined && email.trim()) {
      const normalized = email.toLowerCase().trim();
      if (normalized !== user.email) {
        const exists = await User.findOne({ email: normalized, _id: { $ne: user._id } });
        if (exists) {
          return res.status(400).json({
            success: false,
            message: 'Another account is already using this email address.',
          });
        }
        user.email = normalized;
      }
    }

    await user.save();
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        ...user.toSafeObject(),
        addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/addresses
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    return res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/addresses
const addAddress = async (req, res, next) => {
  try {
    const {
      label,
      companyName,
      fullName,
      phone,
      street,
      area,
      city,
      country,
      postalCode,
      notes,
      isDefault,
    } = req.body;

    if (!street || !city) {
      return res.status(400).json({
        success: false,
        message: 'Street address and city are required.',
      });
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const makeDefault = Boolean(isDefault) || existingCount === 0;

    if (makeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      label: label || 'Delivery Address',
      companyName: companyName || req.user.companyName || '',
      fullName: fullName || req.user.name,
      phone: phone || req.user.phone || '',
      street: street.trim(),
      area: area ? area.trim() : '',
      city: city.trim(),
      country: country ? country.trim() : 'Oman',
      postalCode: postalCode ? postalCode.trim() : '',
      notes: notes ? notes.trim() : '',
      isDefault: makeDefault,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { addresses: address._id },
    });

    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      address,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/addresses/:id
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    const {
      label,
      companyName,
      fullName,
      phone,
      street,
      area,
      city,
      country,
      postalCode,
      notes,
      isDefault,
    } = req.body;

    if (label !== undefined) address.label = label.trim();
    if (companyName !== undefined) address.companyName = companyName.trim();
    if (fullName !== undefined) address.fullName = fullName.trim();
    if (phone !== undefined) address.phone = phone.trim();
    if (street !== undefined) address.street = street.trim();
    if (area !== undefined) address.area = area.trim();
    if (city !== undefined) address.city = city.trim();
    if (country !== undefined) address.country = country.trim();
    if (postalCode !== undefined) address.postalCode = postalCode.trim();
    if (notes !== undefined) address.notes = notes.trim();

    if (isDefault === true) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
      address.isDefault = true;
    }

    await address.save();

    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      message: 'Address updated successfully.',
      address,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/addresses/:id
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: address._id },
    });

    if (wasDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      message: 'Address deleted successfully.',
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/addresses/:id/default
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.',
      });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      message: 'Default address updated.',
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
