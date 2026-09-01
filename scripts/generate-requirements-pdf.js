const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'docs', 'IntaSend_Requirements_Guide.pdf');
const doc = new PDFDocument({ margin: 40, size: 'A4' });

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// ── Colors ──
const navy = '#0A192F';
const blue = '#0058BC';
const cyan = '#00D1FF';
const darkGray = '#1E293B';
const textGray = '#475569';
const lightBg = '#F8FAFC';
const borderCol = '#E2E8F0';

// ── Header Banner ──
doc.rect(0, 0, doc.page.width, 90).fill(navy);

doc.fillColor(cyan).fontSize(20).font('Helvetica-Bold')
   .text('Bite Tech Ltd (Kenya)', 40, 25);

doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica')
   .text('IntaSend Payment Gateway Integration & KYC Verification Guide', 40, 52);

doc.y = 110;

// ── Section 1: Testing & Sandbox ──
doc.fillColor(blue).fontSize(14).font('Helvetica-Bold')
   .text('1. Testing & Sandbox Mode (Ready for Immediate Use)', 40, doc.y);
doc.moveDown(0.4);

doc.fillColor(textGray).fontSize(9.5).font('Helvetica')
   .text('In Sandbox mode, you do NOT need any business registration or KYC approval. Full checkout flow with M-Pesa STK simulation works immediately with developer credentials.');
doc.moveDown(0.6);

// Card Box for Sandbox
const sbBoxTop = doc.y;
doc.rect(40, sbBoxTop, doc.page.width - 80, 75).fillAndStroke(lightBg, borderCol);

doc.fillColor(darkGray).fontSize(9).font('Helvetica-Bold')
   .text('Sandbox Setup Checklist:', 50, sbBoxTop + 10);
doc.font('Helvetica').fillColor(textGray)
   .text('• Account: Free developer account at https://intasend.com', 50, sbBoxTop + 24)
   .text('• API Keys: Publishable Key & Secret Key from Settings → API Keys', 50, sbBoxTop + 36)
   .text('• Environment Setting: INTASEND_IS_LIVE=false in your .env file', 50, sbBoxTop + 48)
   .text('• Test M-Pesa Number: 254708374149 (Test OTP: 12345)', 50, sbBoxTop + 60);

doc.y = sbBoxTop + 90;

// ── Section 2: KYC & Going Live ──
doc.fillColor(blue).fontSize(14).font('Helvetica-Bold')
   .text('2. Live / Production Environment (KYC Verification Requirements)', 40, doc.y);
doc.moveDown(0.4);

doc.fillColor(textGray).fontSize(9.5).font('Helvetica')
   .text('To accept real customer money via M-Pesa STK Push and Credit/Debit Cards, IntaSend requires KYC verification under either an Individual or Business tier:');
doc.moveDown(0.6);

// Table: Individual
doc.fillColor(navy).fontSize(11).font('Helvetica-Bold')
   .text('Option A: Individual / Freelancer / Sole Proprietor (Fastest)');
doc.moveDown(0.3);

const indTop = doc.y;
doc.rect(40, indTop, doc.page.width - 80, 80).fillAndStroke('#FFFFFF', borderCol);
doc.rect(40, indTop, doc.page.width - 80, 20).fill(lightBg);

doc.fillColor(navy).fontSize(9).font('Helvetica-Bold')
   .text('Required Document', 50, indTop + 6)
   .text('Specification / Details', 220, indTop + 6);

doc.fillColor(textGray).fontSize(8.5).font('Helvetica')
   .text('Kenyan National ID / Passport', 50, indTop + 26)
   .text('Clear color copy of ID (both sides) or valid Kenyan Passport', 220, indTop + 26)
   
   .text('Personal KRA PIN Certificate', 50, indTop + 39)
   .text('Official personal KRA PIN Certificate from KRA iTax', 220, indTop + 39)
   
   .text('Settlement Account Details', 50, indTop + 52)
   .text('M-Pesa registered number or personal Kenyan bank account', 220, indTop + 52)

   .text('Contact & Address Proof', 50, indTop + 65)
   .text('Active email address, phone number, and residential location', 220, indTop + 65);

doc.y = indTop + 95;

// Table: Business
doc.fillColor(navy).fontSize(11).font('Helvetica-Bold')
   .text('Option B: Registered Business / Limited Company Entity');
doc.moveDown(0.3);

const bizTop = doc.y;
doc.rect(40, bizTop, doc.page.width - 80, 95).fillAndStroke('#FFFFFF', borderCol);
doc.rect(40, bizTop, doc.page.width - 80, 20).fill(lightBg);

doc.fillColor(navy).fontSize(9).font('Helvetica-Bold')
   .text('Required Document', 50, bizTop + 6)
   .text('Specification / Details', 220, bizTop + 6);

doc.fillColor(textGray).fontSize(8.5).font('Helvetica')
   .text('Certificate of Registration', 50, bizTop + 26)
   .text('Certificate of Incorporation or Business Name (BRS / eCitizen)', 220, bizTop + 26)
   
   .text('Company KRA PIN Certificate', 50, bizTop + 39)
   .text('KRA PIN registered under the business entity name', 220, bizTop + 39)
   
   .text('CR12 Document (Directors)', 50, bizTop + 52)
   .text('CR12 issued within last 3–6 months listing directors & shareholding', 220, bizTop + 52)

   .text("Directors' National IDs & PINs", 50, bizTop + 65)
   .text('Copies of ID cards and KRA PIN certificates for all major directors', 220, bizTop + 65)

   .text('Corporate Settlement Details', 50, bizTop + 78)
   .text('Corporate bank account details or M-Pesa Paybill / Buy Goods Till', 220, bizTop + 78);

doc.y = bizTop + 110;

// ── Section 3: Technical Going Live ──
doc.fillColor(blue).fontSize(14).font('Helvetica-Bold')
   .text('3. Technical Activation Steps', 40, doc.y);
doc.moveDown(0.4);

doc.fillColor(textGray).fontSize(9).font('Helvetica')
   .text('1. Switch toggle in IntaSend dashboard from Sandbox to Live.')
   .text('2. Copy Live Publishable Key (ISPubKey_live_...) & Live Secret Key.')
   .text('3. Set INTASEND_IS_LIVE=true in your production deployment (e.g. Vercel dashboard).');

doc.moveDown(0.6);

// Code Box
const codeTop = doc.y;
doc.rect(40, codeTop, doc.page.width - 80, 45).fill('#0F172A');
doc.fillColor('#38BDF8').fontSize(8.5).font('Courier')
   .text('INTASEND_PUBLISHABLE_KEY=ISPubKey_live_xxxxxxxxxxxxxxxxxxxx', 50, codeTop + 10)
   .text('INTASEND_SECRET_KEY=ISSecretKey_live_xxxxxxxxxxxxxxxxxxxx', 50, codeTop + 22)
   .text('INTASEND_IS_LIVE=true', 50, codeTop + 34);

// Footer
doc.rect(0, doc.page.height - 35, doc.page.width, 35).fill(lightBg);
doc.fillColor(textGray).fontSize(8).font('Helvetica')
   .text('Bite Tech Ltd • Official IntaSend Integration Guide • https://developers.intasend.com', 40, doc.page.height - 22, { align: 'center', width: doc.page.width - 80 });

doc.end();

stream.on('finish', () => {
    console.log('PDF successfully generated at:', outputPath);
});
