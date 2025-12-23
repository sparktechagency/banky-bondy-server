const resetPasswordEmailBody = (name: string, resetCode: number) => `
  <html lang="en">
    <head>
      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #e6f0ff;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #2d8cff;
          padding: 30px 0;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          color: #ffffff;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .content {
          padding: 30px;
          color: #333333;
        }
        .content h2 {
          font-size: 24px;
          color: #1f3e7a;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .content p {
          font-size: 16px;
          color: #444444;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        .reset-code {
          font-size: 28px;
          color: #2d8cff;
          font-weight: 700;
          text-align: center;
          margin-bottom: 25px;
          background-color: #f0f4ff;
          padding: 15px;
          border-radius: 8px;
        }
        .footer {
          padding: 20px;
          font-size: 14px;
          color: #666666;
          text-align: center;
          background-color: #e6f0ff;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }
        .footer a {
          color: #2d8cff;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello, ${name}</h2>
          <p>We received a request to reset your password. Please use the code below to proceed:</p>
          <div class="reset-code">${resetCode || 'XXXXXX'}</div>
          <p>Enter this code on the reset page within the next 5 minutes. If you didn’t request this, just ignore the email.</p>
          <p>Need help? Contact us at <a href="mailto:bankybondyar@gmail.com">bankybondyar@gmail.com</a>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Banky Bondy. All rights reserved.</p>
          <p><a href="https://bankybondy.com/en/privacy">Privacy Policy</a> | <a href="https://bankybondy.com/en/privacy">Contact Us</a></p>
        </div>
      </div>
    </body>
  </html>
`;

export default resetPasswordEmailBody;
