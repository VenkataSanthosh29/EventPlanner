package com.edutech.services;

import java.util.Properties;

import javax.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private JavaMailSender getMailSender() {

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("smtp.gmail.com");
        sender.setPort(587);
        sender.setUsername("ajaymajor159@gmail.com");
        sender.setPassword("uqml ntaa pzek hwbe");
        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        return sender;
    }

    /**
     * Purpose values expected: "REGISTER" or "RESET_PASSWORD"
     */
    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        try {
            JavaMailSender mailSender = getMailSender();
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            String subject = buildSubject(purpose);
            String body = buildBody(otp, purpose);

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, false);

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    // ✅ Backward compatible method (if any old code still calls 2 params)
    public void sendOtpEmail(String toEmail, String otp) {
        sendOtpEmail(toEmail, otp, "REGISTER");
    }

    private String buildSubject(String purpose) {
        if ("RESET_PASSWORD".equalsIgnoreCase(purpose)) {
            return "Password Reset OTP - Event Planner";
        }
        // default: REGISTER
        return "Email Verification OTP - Event Planner";
    }

    private String buildBody(String otp, String purpose) {
        if ("RESET_PASSWORD".equalsIgnoreCase(purpose)) {
            return "Hello,\n\n"
                 + "You requested to reset your password.\n"
                 + "Your OTP is: " + otp + "\n"
                 + "This OTP is valid for 5 minutes.\n\n"
                 + "If you did not request a password reset, please ignore this email.\n\n"
                 + "Thanks,\n"
                 + "Event Planner Team";
        }

        // default: REGISTER
        return "Hello,\n\n"
             + "Thank you for registering.\n"
             + "Your OTP for email verification is: " + otp + "\n"
             + "This OTP is valid for 5 minutes.\n\n"
             + "Thanks,\n"
             + "Event Planner Team";
    }
}