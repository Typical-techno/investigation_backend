import sendEmail from './otpUtils';

export const TestSendingOTP = () => {
    try {
        sendEmail('shubhamjangrartk@gmail.com', '298762');
    } catch (error: any) {
        console.log(error?.message);
    }
};
