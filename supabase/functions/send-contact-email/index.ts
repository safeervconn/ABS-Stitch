import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  formType: 'quote' | 'general';
  fullName: string;
  email: string;
  phone: string;
  apparelType?: string;
  customWidth?: string;
  customHeight?: string;
  designInstructions?: string;
  message?: string;
  fileAttachment?: {
    name: string;
    content: string;
    mimeType: string;
  };
}

function generateUniqueNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${timestamp}${random}`;
}

function createEmailBody(data: EmailRequest, uniqueNumber: string): string {
  const formTypeLabel = data.formType === 'quote' ? 'Quote Request' : 'General Enquiry';
  
  let emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #1f2937; }
    .value { color: #4b5563; margin-top: 5px; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${formTypeLabel} #${uniqueNumber}</h1>
    </div>
    <div class="content">
      <h2>Contact Information</h2>
      <div class="field">
        <div class="label">Full Name:</div>
        <div class="value">${data.fullName}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">${data.email}</div>
      </div>
      <div class="field">
        <div class="label">Phone:</div>
        <div class="value">${data.phone}</div>
      </div>
  `;

  if (data.formType === 'quote') {
    emailBody += `
      <h2 style="margin-top: 30px;">Design Details</h2>
    `;
    
    if (data.apparelType) {
      emailBody += `
      <div class="field">
        <div class="label">Apparel Type:</div>
        <div class="value">${data.apparelType}</div>
      </div>
      `;
    }
    
    if (data.customWidth || data.customHeight) {
      emailBody += `
      <div class="field">
        <div class="label">Dimensions:</div>
        <div class="value">${data.customWidth ? data.customWidth + ' inches (W)' : ''} ${data.customHeight ? data.customHeight + ' inches (H)' : ''}</div>
      </div>
      `;
    }
    
    if (data.designInstructions) {
      emailBody += `
      <div class="field">
        <div class="label">Design Instructions:</div>
        <div class="value" style="white-space: pre-wrap;">${data.designInstructions}</div>
      </div>
      `;
    }
  } else {
    if (data.message) {
      emailBody += `
      <h2 style="margin-top: 30px;">Message</h2>
      <div class="field">
        <div class="value" style="white-space: pre-wrap;">${data.message}</div>
      </div>
      `;
    }
  }

  emailBody += `
    </div>
    <div class="footer">
      <p>This email was sent from the ABS Stitch contact form.</p>
      <p>Submission Time: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;

  return emailBody;
}

function createEmailWithAttachment(boundary: string, from: string, to: string, subject: string, htmlBody: string, attachment?: { name: string; content: string; mimeType: string }): string {
  let email = `From: ${from}\r\n`;
  email += `To: ${to}\r\n`;
  email += `Subject: ${subject}\r\n`;
  email += `MIME-Version: 1.0\r\n`;
  email += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
  
  email += `--${boundary}\r\n`;
  email += `Content-Type: text/html; charset=utf-8\r\n`;
  email += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
  email += `${htmlBody}\r\n\r\n`;
  
  if (attachment) {
    email += `--${boundary}\r\n`;
    email += `Content-Type: ${attachment.mimeType}; name="${attachment.name}"\r\n`;
    email += `Content-Transfer-Encoding: base64\r\n`;
    email += `Content-Disposition: attachment; filename="${attachment.name}"\r\n\r\n`;
    email += `${attachment.content}\r\n\r\n`;
  }
  
  email += `--${boundary}--`;
  
  return email;
}

async function sendEmail(emailData: EmailRequest): Promise<void> {
  const uniqueNumber = generateUniqueNumber();
  const subject = emailData.formType === 'quote' 
    ? `Quote Request - ${uniqueNumber}`
    : `General Enquiry - ${uniqueNumber}`;
  
  const htmlBody = createEmailBody(emailData, uniqueNumber);
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const emailMessage = createEmailWithAttachment(
    boundary,
    'no-reply@absstitch.com',
    'order@absstitch.com',
    subject,
    htmlBody,
    emailData.fileAttachment
  );
  
  const auth = btoa('no-reply@absstitch.com:drGpfTh29KM{-@-J');
  
  const smtpUrl = 'mail.absstitch.com';
  const smtpPort = 465;
  
  try {
    const conn = await Deno.connect({
      hostname: smtpUrl,
      port: smtpPort,
      transport: 'tcp',
    });

    const tlsConn = await Deno.startTls(conn, { hostname: smtpUrl });
    
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    async function readResponse(): Promise<string> {
      const buffer = new Uint8Array(1024);
      const n = await tlsConn.read(buffer);
      if (n === null) throw new Error('Connection closed');
      return decoder.decode(buffer.subarray(0, n));
    }
    
    async function sendCommand(command: string): Promise<string> {
      await tlsConn.write(encoder.encode(command + '\r\n'));
      return await readResponse();
    }
    
    await readResponse();
    
    await sendCommand('EHLO absstitch.com');
    await sendCommand('AUTH LOGIN');
    await sendCommand(btoa('no-reply@absstitch.com'));
    await sendCommand(btoa('drGpfTh29KM{-@-J'));
    await sendCommand('MAIL FROM:<no-reply@absstitch.com>');
    await sendCommand('RCPT TO:<order@absstitch.com>');
    await sendCommand('DATA');
    await tlsConn.write(encoder.encode(emailMessage + '\r\n.\r\n'));
    await readResponse();
    await sendCommand('QUIT');
    
    tlsConn.close();
  } catch (error) {
    console.error('SMTP Error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    const emailData: EmailRequest = await req.json();
    
    if (!emailData.fullName || !emailData.email || !emailData.phone) {
      throw new Error("Missing required fields");
    }

    await sendEmail(emailData);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email" 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});