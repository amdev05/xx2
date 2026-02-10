const getTipeHari = (date) => {
    const day = date.getDay(); // 0 Minggu, 6 Sabtu
    return (day === 0 || day === 6) ? 'WEEKEND' : 'WEEKDAY';
};

module.exports = { getTipeHari };
