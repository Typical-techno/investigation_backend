export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const sendOTP = async (email: string, otp: string) => {
    console.log(`Sending OTP ${otp} to ${email}`); // Replace with actual email/SMS sending logic
};
