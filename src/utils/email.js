import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Correct the typo here
    auth: {
      user: "mhmwdbhjt307@gmail.com",
      pass: "vanmixnmuoqqltow", // Make sure this is the correct app-specific password
    },
  });

  await transporter.sendMail({
    to,
    from: "'<ecommerce>' ma2372190@gmail.com", // Fix the email format here
    subject,
    html,
  });
};
