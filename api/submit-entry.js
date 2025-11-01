// api/submit-entry.js
import { Resend } from 'resend';
import { google } from 'googleapis';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BYD-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

async function logToSheet(name, address, email, phone, code) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: '12feInOxA9KH8V_kS-dSCn4wcLgtDrLWegrBw51iWETk', // ← YOUR SHEET ID
    range: 'Sheet1!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[new Date().toISOString(), name, address, email, phone, code, 'Pending']]
    },
  });
}

function getEmailHtml(name, uniqueCode) {
  const claimUrl = `${process.env.CLAIM_PAGE_URL}?code=${encodeURIComponent(uniqueCode)}`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BYD Exclusive Giveaway</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; padding: 15px 0; }
        .email-container { max-width: 650px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0a2e5c 0%, #1a4d8f 100%); color: white; padding: 25px 20px; text-align: center; position: relative; }
        .logo { font-size: 28px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .logo-icon { font-size: 32px; color: #ffd700; }
        .tagline { font-size: 16px; opacity: 0.9; max-width: 500px; margin: 0 auto; font-weight: 300; }
        .hero { background: linear-gradient(rgba(230, 57, 70, 0.9), rgba(200, 30, 50, 0.95)), url('https://images.unsplash.com/photo-1619266465172-02a857c35a40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80') center/cover no-repeat; color: white; padding: 40px 20px; text-align: center; }
        .hero h1 { font-size: 28px; margin-bottom: 15px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: 800; }
        .hero p { font-size: 17px; max-width: 550px; margin: 0 auto 25px; font-weight: 400; line-height: 1.6; }
        .claim-button { display: inline-block; background: #ffd700; color: #0a2e5c; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 800; font-size: 19px; text-transform: uppercase; letter-spacing: 1.2px; box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4); transition: all 0.3s ease; margin: 15px 0; border: 2px solid #ffd700; width: 90%; max-width: 320px; }
        .claim-button:hover { background: transparent; color: white; transform: translateY(-4px); box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6); }
        .code-section { background: #fff8e1; border: 2px dashed #ffd54f; border-radius: 12px; padding: 25px; margin: 25px 20px; text-align: center; }
        .code-title { color: #e63946; font-weight: 700; margin-bottom: 15px; font-size: 18px; }
        .unique-code { background: #0a2e5c; color: #ffd700; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 22px; letter-spacing: 3px; margin: 15px 0; word-break: break-all; }
        .content { padding: 20px; }
        .section-title { color: #0a2e5c; font-size: 22px; margin: 25px 0 20px; padding-bottom: 10px; border-bottom: 2px solid #e9ecef; font-weight: 700; text-align: center; }
        .intro-text { margin-bottom: 25px; font-size: 16px; line-height: 1.7; text-align: center; padding: 0 10px; }
        .car-gallery { display: flex; flex-wrap: wrap; gap: 15px; margin: 25px 0; }
        .car-card { flex: 1; min-width: 250px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .car-card:hover { transform: translateY(-8px); }
        .car-image { height: 180px; background-size: cover; background-position: center; }
        .car-info { padding: 15px; background: white; text-align: center; }
        .car-info h3 { color: #0a2e5c; margin-bottom: 8px; font-size: 18px; }
        .car-info p { color: #6c757d; font-size: 14px; }
        .prize-section { background: linear-gradient(135deg, #e63946 0%, #d90429 100%); color: white; padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; }
        .prize-section h2 { font-size: 24px; margin-bottom: 15px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .prize-list { text-align: left; max-width: 500px; margin: 20px auto; }
        .prize-list li { margin-bottom: 12px; padding-left: 25px; position: relative; }
        .prize-list li:before { content: "🏆"; position: absolute; left: 0; top: 0; }
        .footer { background: #0a2e5c; color: #cbd5e1; padding: 25px 20px; text-align: center; font-size: 13px; line-height: 1.7; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; color: white; width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); margin: 0 6px; line-height: 36px; text-decoration: none; transition: all 0.3s ease; }
        .social-links a:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-3px); }
        .unsubscribe { margin-top: 20px; color: #94a3b8; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .unsubscribe a { color: #94a3b8; text-decoration: underline; margin: 0 6px; }
        .unsubscribe a:hover { color: #cbd5e1; }
        @media (max-width: 600px) {
            .hero { padding: 30px 15px; }
            .hero h1 { font-size: 24px; }
            .hero p { font-size: 15px; }
            .claim-button { padding: 14px 25px; font-size: 17px; width: 95%; }
            .content { padding: 15px; }
            .car-gallery { flex-direction: column; }
            .section-title { font-size: 20px; }
            .unique-code { font-size: 18px; padding: 12px; }
        }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
        .unique-code { animation: pulse 2s infinite; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <i class="fas fa-car logo-icon"></i>
                <span>B<span style="color:#ffd700">Y</span>D</span>
            </div>
            <p class="tagline">Driving the Future of Electric Mobility</p>
        </div>
        
        <div class="hero">
            <h1>🎉 YOU'VE BEEN SELECTED! 🎉</h1>
            <p>You are among the <strong>100 lucky recipients</strong> chosen for BYD's exclusive car giveaway! This is your chance to win a brand new BYD electric vehicle.</p>
            <a href="${claimUrl}" class="claim-button">Click Here to Claim</a>
            <p style="font-size: 14px; margin-top: 10px; opacity: 0.9;">Hurry! Offer expires in 48 hours</p>
        </div>
        
        <div class="code-section">
            <div class="code-title">YOUR EXCLUSIVE CLAIM CODE</div>
            <div class="unique-code">${uniqueCode}</div>
            <p>Present this code when you claim your prize. This code is unique to you and cannot be transferred.</p>
        </div>
        
        <div class="content">
            <p class="intro-text">Congratulations! You've been randomly selected from millions of subscribers to participate in our exclusive BYD Electric Vehicle Giveaway. Only 100 people worldwide received this email - you are one of them!</p>
            
            <h2 class="section-title">Featured BYD Vehicles</h2>
            <div class="car-gallery">
                <div class="car-card">
                    <div class="car-image" style="background-image: url('https://images.unsplash.com/photo-1617804853118-3a7258a74a4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80');"></div>
                    <div class="car-info">
                        <h3>BYD Han EV</h3>
                        <p>Premium sedan with 600km range</p>
                    </div>
                </div>
                <div class="car-card">
                    <div class="car-image" style="background-image: url('https://images.unsplash.com/photo-1627308595115-0b82c5f8e5d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80');"></div>
                    <div class="car-info">
                        <h3>BYD Tang EV</h3>
                        <p>Luxury 7-seater SUV</p>
                    </div>
                </div>
                <div class="car-card">
                    <div class="car-image" style="background-image: url('https://images.unsplash.com/photo-1626691835330-75e8a8c6a8f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80');"></div>
                    <div class="car-info">
                        <h3>BYD Dolphin</h3>
                        <p>Compact city EV with style</p>
                    </div>
                </div>
            </div>
            
            <div class="prize-section">
                <h2>YOUR PRIZE INCLUDES</h2>
                <ul class="prize-list">
                    <li>Brand new BYD electric vehicle of your choice (Han EV, Tang EV, or Dolphin)</li>
                    <li>Free home charging station installation ($1,500 value)</li>
                    <li>3 years of free maintenance and servicing</li>
                    <li>Complimentary insurance for the first year</li>
                </ul>
                <a href="${claimUrl}" class="claim-button">Claim Your Prize Now</a>
            </div>
            
            <p style="text-align: center; margin: 20px 0; padding: 0 10px; font-weight: 600; color: #e63946;">
                Remember: You must use your unique code <strong>${uniqueCode}</strong> when claiming. This offer expires in 48 hours!
            </p>
        </div>
        
        <div class="footer">
            <p>BYD Auto Co., Ltd.</p>
            <p>Building a Better Tomorrow, Today</p>
            
            <div class="social-links">
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-linkedin-in"></i></a>
                <a href="#"><i class="fab fa-youtube"></i></a>
            </div>
            
            <p>123 Electric Avenue, Shenzhen, Guangdong 518118, China</p>
            <p>+86 755 8988 8888 | info@byd.com</p>
            
            <div class="unsubscribe">
                <p>You received this email because you were randomly selected from our subscriber list.</p>
                <p><a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a> | <a href="#">Terms & Conditions</a></p>
            </div>
        </div>
    </div>
</body>
</html>
  `.replace(/\s+/g, ' ').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, address, email, phone } = req.body;
  if (!name || !address || !email || !phone) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const uniqueCode = generateUniqueCode();

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'BYD Giveaway <onboarding@resend.dev>',
      to: email,
      subject: '🎉 You’ve Been Selected for BYD Exclusive Giveaway!',
      html: getEmailHtml(name, uniqueCode),
    });

    await logToSheet(name, address, email, phone, uniqueCode);

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'BYD System <onboarding@resend.dev>',
      to: process.env.YOUR_EMAIL,
      subject: `New Giveaway Entry: ${name}`,
      text: `Name: ${name}\nAddress: ${address}\nEmail: ${email}\nPhone: ${phone}\nClaim Code: ${uniqueCode}`,
      reply_to: email,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to process entry. Please try again.' });
  }
}
