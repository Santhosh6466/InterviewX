package com.interviewx.backend.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String toEmail, String otp) {

        String htmlContent =
                "<div style=\"background-color:#0B0B0C;padding:40px 0;font-family:Arial,Helvetica,sans-serif;\">" +
                        "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">" +
                        "<tr><td align=\"center\">" +
                        "<table role=\"presentation\" width=\"480\" cellpadding=\"0\" cellspacing=\"0\" " +
                        "style=\"background-color:#111111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;\">" +
                        "<tr><td style=\"padding:32px 40px 0 40px;\">" +
                        "<span style=\"color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;\">" +
                        "&lt;X&gt;&nbsp; InterviewX" +
                        "</span>" +
                        "</td></tr>" +
                        "<tr><td style=\"padding:32px 40px 8px 40px;\">" +
                        "<p style=\"color:#ffffff;font-size:22px;font-weight:bold;margin:0 0 12px 0;\">Verify your login</p>" +
                        "<p style=\"color:#a0a0a0;font-size:14px;line-height:1.6;margin:0;\">" +
                        "Use the code below to complete your sign-in to InterviewX." +
                        "</p>" +
                        "</td></tr>" +
                        "<tr><td style=\"padding:24px 40px;\">" +
                        "<div style=\"background-color:#000000;border:1px solid #2a2a2a;border-radius:8px;" +
                        "padding:20px;text-align:center;\">" +
                        "<span style=\"color:#ffffff;font-size:32px;font-weight:bold;letter-spacing:8px;\">" +
                        otp +
                        "</span>" +
                        "</div>" +
                        "</td></tr>" +
                        "<tr><td style=\"padding:0 40px 32px 40px;\">" +
                        "<p style=\"color:#808080;font-size:13px;line-height:1.6;margin:0;\">" +
                        "This OTP is valid for 5 minutes.<br>" +
                        "Do not share it with anyone." +
                        "</p>" +
                        "</td></tr>" +
                        "<tr><td style=\"padding:20px 40px;border-top:1px solid #2a2a2a;\">" +
                        "<p style=\"color:#606060;font-size:12px;margin:0;\">" +
                        "&copy; InterviewX &middot; This is an automated message, please do not reply." +
                        "</p>" +
                        "</td></tr>" +
                        "</table>" +
                        "</td></tr>" +
                        "</table>" +
                        "</div>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("InterviewX - Email Verification OTP");
            helper.setText(htmlContent, true); // true = isHtml

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}
