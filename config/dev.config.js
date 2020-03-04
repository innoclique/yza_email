module.exports = {
    env: "dev",
    database: "mongodb://localhost:27017/youzatesting",
    smtp: {
        host: 'smtp.zoho.com',
        port: 587,
        secureConnection: true, // use SSL
        auth: {
            user: 'noreply@yovza.com',
            pass: 'Yovza@#99'
        },
        tls: {
            secureProtocol: "TLSv1_method"
        }
    },
    defaultMailOptions: {
        from: "noreply@yovza.com",
        to: "madantfc@gmail.com",
        subject: "Promo Signup Request Submission"
    },
    trailDays:90



};