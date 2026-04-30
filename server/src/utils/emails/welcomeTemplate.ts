export interface WelcomeEmailProps {
  name: string;
}

export const getWelcomeEmailTemplate = ({ name }: WelcomeEmailProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Radhewears</title>
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
    .nav {
      text-align: center;
      padding-bottom: 20px;
    }
    .nav a {
      color: #1a1a1a;
      text-decoration: none;
      font-size: 12px;
      margin: 0 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .hero {
      text-align: center;
      padding: 20px 40px;
    }
    .hero span {
      background-color: #fce781;
      padding: 0 10px;
      display: inline-block;
      font-size: 40px;
      font-weight: bold;
      letter-spacing: 6px;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    .hero p {
      font-size: 14px;
      color: #555555;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .divider {
      border-top: 1px solid #e0e0e0;
      margin: 0 40px 30px;
    }
    .discount {
      text-align: center;
      padding: 20px 40px;
      font-size: 16px;
    }
    .discount strong {
      display: block;
      margin-top: 5px;
      font-size: 18px;
    }
    .section-title {
      text-align: center;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 2px;
      margin: 40px 0 20px;
      text-transform: uppercase;
    }
    .products {
      padding: 0 20px;
    }
    .product-col {
      width: 50%;
      padding: 10px;
      box-sizing: border-box;
      vertical-align: top;
    }
    .product-card {
      background: #f9f9f9;
      padding-bottom: 15px;
      text-align: center;
    }
    .product-img {
      width: 100%;
      height: 250px;
      background-color: #e0e0e0;
      display: block;
      object-fit: cover;
    }
    .product-title {
      font-size: 14px;
      font-weight: 600;
      margin: 15px 0 5px;
      text-transform: uppercase;
    }
    .product-desc {
      font-size: 12px;
      color: #666;
      margin-bottom: 15px;
      padding: 0 10px;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #1a1a1a;
      color: #ffffff;
      text-decoration: none;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 1px;
      border: 1px solid #1a1a1a;
    }
    .footer {
      background-color: #1a1a1a;
      color: #ffffff;
      text-align: center;
      padding: 40px;
      font-size: 12px;
    }
    .social-icons a {
      color: #ffffff;
      text-decoration: none;
      margin: 0 10px;
      font-size: 14px;
      display: inline-block;
      letter-spacing: 1px;
    }
    .footer p {
      margin-top: 20px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main">
      <tr>
        <td>
          <div class="header">
            <div style="width: 40px; height: 40px; margin: 0 auto 10px; background-color: #1a1a1a; color: #fff; font-size: 24px; font-weight: bold; line-height: 40px; text-align: center; border-radius: 4px;">D</div>
            <h1>RADHEWEARS</h1>
          </div>

          <div class="nav">
            <a href="https://Radhewears.com">Home</a>
            <a href="https://Radhewears.com/products">New Additions</a>
            <a href="https://Radhewears.com/about">About Us</a>
          </div>

          <div class="hero">
            <span>WELCOME</span>
            <br/>
            <div style="font-size: 16px; letter-spacing: 2px; margin-top: 15px; text-transform: uppercase;">TO RADHEWEARS, ${name}</div>
            <div style="margin: 20px auto; color: #aaa;">///</div>
            <p  style="margin: 20px 40px; font-size: 30px; color: #000000;">Get Yourself Premium Stuff</p>
          </div>

          <div class="divider"></div>
          <div class="divider"></div>

          <div class="footer">
            <p>radhewears.com</p>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
};
