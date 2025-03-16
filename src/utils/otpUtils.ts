import nodemailer from 'nodemailer';
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// export const sendOTP = async (email: string, otp: string) => {
//     console.log(`Sending OTP ${otp} to ${email}`); // Replace with actual email/SMS sending logic
// };

const transporter = nodemailer.createTransport({
    host: 'mail.erohtak.com', // Replace with your SMTP host
    port: 465, // Typically 465 for SSL, or 587 for TLS
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // Your domain email address
        pass: process.env.EMAIL_PASSWORD // Your domain email password
    }
});

export const sendOTP = async (to: any, otp: any) => {
    console.log(`OTP for ${to}: ${otp}`);

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 15 minutes.`,
        html: `
    <!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title></title>
  <style type="text/css">
    @media only screen and (min-width: 620px) {
      .u-row {
        width: 600px !important;
      }
      .u-row .u-col {
        vertical-align: top;
      }
    }

    @media (max-width: 620px) {
      .u-row-container {
        max-width: 100% !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }
      .u-row .u-col {
        min-width: 320px !important;
        max-width: 100% !important;
        display: block !important;
      }
      .u-row {
        width: 100% !important;
      }
      .u-col {
        width: 100% !important;
      }
      .u-col > div {
        margin: 0 auto;
      }
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      background-color: #f9f9f9;
      color: #333333;
      font-family: 'Open Sans', sans-serif;
    }

    table, tr, td {
      vertical-align: top;
      border-collapse: collapse;
    }

    p {
      margin: 0;
    }

    a {
      color: #1a73e8;
      text-decoration: none;
    }

    @media (max-width: 480px) {
      .hide-mobile {
        display: none !important;
      }
    }

    h1 {
      font-family: 'Montserrat', sans-serif;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      color: #333333;
    }

    h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      color: #555555;
      margin-bottom: 24px;
    }

    .u-container {
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      margin: 20px auto;
      max-width: 600px;
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    }

    .u-button {
      display: inline-block;
      background-color: #1a73e8;
      color: #ffffff;
      padding: 10px 30px;
      border-radius: 4px;
      font-size: 16px;
      text-align: center;
      text-decoration: none;
      margin: 20px 0;
    }

    .u-footer {
      text-align: center;
      font-size: 12px;
      color: #999999;
      margin-top: 20px;
    }
  </style>
</head>

<body>
  <div class="u-container">
    <h1>Cyber - Investigation</h1>
    <img src="https://cdn.templates.unlayer.com/assets/1701676201199-password.png" alt="OTP Image" style="width: 100px; display: block; margin: 0 auto 20px auto;">
    <h2>Your one-time code is</h2>
    <div style="text-align: center;">
      <a class="u-button" href="#">${otp}</a>
    </div>
    <p style="text-align: center; margin-top: 20px; line-height: 1.6; color: #666666;">
      Please verify that it's really you by entering this 6-digit code when you sign in.
      Just a heads up, this code will expire in 15 minutes for security reasons.
    </p>
  </div>

  <div class="u-footer">
    <p>If you have any questions, contact our Website Guides.<br>Or, visit our Help Center.</p>
  </div>
</body>
</html>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};
