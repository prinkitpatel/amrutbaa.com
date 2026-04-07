export function getPricing(quantity, paymentMethod, easterEggCode = null) {
    const safeQty = Math.min(10, Math.max(1, Number(quantity) || 1));
    
    // Easter Egg Special Pricing Logic
    let unitPrice = 499;
    if (easterEggCode === 'JADOOI_7') {
        unitPrice = 299;
    }

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
