const nodemailer = require('nodemailer');

// E-posta göndermek için transporter oluştur
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'smartify.destek@gmail.com',
        pass: 'bhlg atcw layf zexz'
    }
});

/**
 * Doğrulama kodu gönderen fonksiyon
 * @param {string} email - Alıcı e-posta adresi
 * @param {string} verificationCode - Doğrulama kodu
 * @param {string} name - Kullanıcının adı
 * @returns {Promise<boolean>} - İşlem başarılı mı?
 */
const sendVerificationEmail = async (email, verificationCode, name) => {
    try {
        const mailOptions = {
            from: 'Smartify <smartify.destek@gmail.com>',
            to: email,
            subject: 'E-posta Adresinizi Doğrulayın',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #2962ff;">Smartify</h1>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
                        <h2>Merhaba ${name || 'Değerli Üyemiz'},</h2>
                        <p>Smartify'a hoş geldiniz! Hesabınızı aktifleştirmek için lütfen aşağıdaki doğrulama kodunu kullanın:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <div style="display: inline-block; padding: 10px 20px; background-color: #f5f5f5; border: 1px dashed #ccc; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                                ${verificationCode}
                            </div>
                        </div>
                        <p>Bu kod 15 dakika süreyle geçerlidir.</p>
                        <p>Eğer siz kayıt olmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
                        <p style="margin-top: 30px;">Saygılarımızla,<br>Smartify Ekibi</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} Smartify. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('E-posta gönderim hatası:', error);
        return false;
    }
};

module.exports = {
    sendVerificationEmail
}; 