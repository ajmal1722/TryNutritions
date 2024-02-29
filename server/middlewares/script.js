exports.calculateDiscount = (mrp, sellingPrice) => {
    return ((mrp - sellingPrice) / mrp) * 100;
}