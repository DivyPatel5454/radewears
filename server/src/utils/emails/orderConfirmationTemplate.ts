export interface OrderConfirmationEmailProps {
  orderId: string;
}

export const getOrderConfirmationEmailTemplate = ({ orderId }: OrderConfirmationEmailProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Radhewears</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #ebe8e4;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #1a1a1a;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #ebe8e4;
      padding-bottom: 60px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-spacing: 0;
      color: #1a1a1a;
    }
    .header {
      padding: 40px 0;
      text-align: center;
    }
    .header h1 {
      font-size: 20px;
      letter-spacing: 2px;
      margin: 0;
      text-transform: uppercase;
      font-weight: 600;
    }
    .hero {
      text-align: center;
      padding: 20px 40px;
    }
    .hero span {
      background-color: #fce781;
      padding: 0 15px;
      display: inline-block;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 4px;
      margin-bottom: 15px;
      line-height: 1.2;
    }
    .hero p {
      font-size: 16px;
      color: #555555;
      line-height: 1.6;
      margin: 20px auto;
      max-width: 400px;
    }
    .divider {
      border-top: 1px solid #e0e0e0;
      margin: 0 40px 30px;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #1a1a1a;
      color: #ffffff;
      text-decoration: none;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 1px;
      margin-top: 20px;
    }
    .footer {
      background-color: #1a1a1a;
      color: #ffffff;
      text-align: center;
      padding: 40px;
      font-size: 12px;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main">
      <tr>
        <td>
          
          <div class="header">
            <div style="width: 40px; height: 40px; margin: 0 auto 10px; background-color: #1a1a1a; color: #fff; font-size: 24px; font-weight: bold; line-height: 40px; text-align: center; border-radius: 4px;">R</div>
            <h1>RADHEWEARS</h1>
          </div>

          <div class="hero">
            <span>ORDER CONFIRMED</span>
            <br/>
            <div style="font-size: 16px; letter-spacing: 2px; margin-top: 15px; text-transform: uppercase;">Thank you for your purchase</div>
            <div style="margin: 20px auto; color: #aaa;">///</div>
            <p>We've successfully received your order <strong>#${orderId}</strong> and are getting it ready.</p>
            <a href="https://radhewears.com/account/orders" class="btn" style="color: #ffffff;">View Order Status</a>
            <button onclick="window.location.href='mailto:deitywere@gmail.com'" class="btn" style="color: #ffffff; cursor: pointer;">Contact Us</button>
          </div>

          <div class="divider"></div>

          <div class="footer">
            <p style="margin: 0; color: #fff;">Stay Premium.</p>
            <p style="margin-top: 15px; color: #999999;">radhewears.com</p>
          </div>

        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
};
