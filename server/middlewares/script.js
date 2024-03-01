exports.calculateDiscount = (mrp, sellingPrice) => {
    return ((mrp - sellingPrice) / mrp) * 100;
}

exports.calculateTotalBill = (items) => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
};