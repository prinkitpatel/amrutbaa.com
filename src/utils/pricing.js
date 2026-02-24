export function getPricing(quantity, paymentMethod) {
    const safeQty = Math.min(10, Math.max(1, Number(quantity) || 1));
    const unitPrice = 499;
    const baseTotal = safeQty * unitPrice;
    let discountPercent = 0;
    if (paymentMethod === 'Prepaid') {
        if (safeQty >= 3) discountPercent = 10;
        else if (safeQty >= 2) discountPercent = 5;
    }
    const discount = Math.round((baseTotal * discountPercent) / 100);
    const total = baseTotal - discount;
    return { qty: safeQty, unitPrice, baseTotal, discount, total };
}
