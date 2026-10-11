const { formatOMR } = require('../utils/slugify');

/**
 * Generates the official Unikai B2B WhatsApp Order / Enquiry message and wa.me URL
 * using dynamic salesman details from MongoDB.
 * Never outputs OMR 0.000 or fake prices when a product has no sellingPrice.
 */
const buildWhatsAppOrderPayload = ({
  salesmanName = 'Sachin',
  whatsappNumber = '+96891234567',
  items = [],
  customer = {},
  total = null,
  orderNumber = '',
}) => {
  const lines = [];
  lines.push(`Hello ${salesmanName},`);
  lines.push('');
  lines.push(
    orderNumber
      ? `I would like to place an order (Ref: ${orderNumber}).`
      : 'I would like to place an order.'
  );
  lines.push('');
  lines.push('Order Items:');
  lines.push('');

  let computedTotal = 0;
  let hasAnyPricedItem = false;

  items.forEach((item, index) => {
    const rawSelling =
      item.sellingPrice !== undefined && item.sellingPrice !== null
        ? item.sellingPrice
        : item.price;
    const hasSellingPrice =
      rawSelling !== null && rawSelling !== undefined && Number(rawSelling) > 0;
    const hasInvoicePrice =
      item.invoicePrice !== null &&
      item.invoicePrice !== undefined &&
      Number(item.invoicePrice) > 0;

    const unitPrice = hasSellingPrice ? Number(rawSelling) : null;
    const invoicePrice = hasInvoicePrice ? Number(item.invoicePrice) : null;
    const qty = Math.max(1, Number(item.quantity || 1));

    if (unitPrice !== null) {
      computedTotal += unitPrice * qty;
      hasAnyPricedItem = true;
    }

    lines.push(`${index + 1}. ${item.productName || item.name}`);

    if (item.size && String(item.size).trim() !== '') {
      const sizeLabel =
        String(item.size).includes('×') || String(item.size).toLowerCase().includes('pack')
          ? 'Pack'
          : 'Size';
      lines.push(`${sizeLabel}: ${item.size}`);
    }

    lines.push(`Quantity: ${qty}`);

    if (unitPrice !== null) {
      lines.push(`Price: ${formatOMR(unitPrice)}`);
    }
    if (invoicePrice !== null) {
      lines.push(`Invoice Price: ${formatOMR(invoicePrice)}`);
    }
    lines.push('');
  });

  const finalTotal =
    total !== null && total !== undefined && Number(total) > 0
      ? Number(total)
      : hasAnyPricedItem
        ? Number(computedTotal.toFixed(3))
        : null;

  lines.push('Customer:');
  lines.push(`Name: ${customer.name || 'Valued B2B Partner'}`);
  if (customer.companyName) {
    lines.push(`Company: ${customer.companyName}`);
  }
  lines.push(`Phone: ${customer.phone || 'Not provided'}`);
  lines.push(`Address: ${customer.address || 'Muscat, Oman'}`);

  if (finalTotal !== null) {
    lines.push('');
    lines.push(`Total: ${formatOMR(finalTotal)}`);
  }

  lines.push('');
  lines.push('Thank you.');

  const message = lines.join('\n');
  const cleanPhone = String(whatsappNumber || '').replace(/[^\d]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return {
    salesmanName,
    whatsappNumber,
    cleanPhone,
    message,
    whatsappUrl,
    total: finalTotal,
  };
};

module.exports = {
  buildWhatsAppOrderPayload,
};
