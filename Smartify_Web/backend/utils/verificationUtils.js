/**
 * Rastgele doğrulama kodu oluşturur
 * @param {number} length - Kod uzunluğu
 * @returns {string} - Oluşturulan kod
 */
const generateVerificationCode = (length = 6) => {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
};

/**
 * Doğrulama kodu için son kullanma tarihi oluşturur
 * @param {number} minutes - Dakika cinsinden geçerlilik süresi
 * @returns {Date} - Son kullanma tarihi
 */
const generateExpiryTime = (minutes = 15) => {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + minutes);
    return expiryTime;
};

module.exports = {
    generateVerificationCode,
    generateExpiryTime
}; 