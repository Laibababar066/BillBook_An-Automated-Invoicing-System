import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured. Please add it in Cloud secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      to,
      subject,
      businessName,
      businessCity,
      businessPhone,
      brandColor,
      invoiceNumber,
      invoiceDate,
      dueDate,
      clientName,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      notes,
      pdfBase64,
      fromEmail,
    } = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build branded HTML email
    const accentColor = brandColor || "#1C1917";
    const itemRows = (items || [])
      .map(
        (item: { description: string; qty: number; unitPrice: number }) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">${item.description}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">${item.qty}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;">Rs. ${item.unitPrice?.toLocaleString()}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;">Rs. ${(item.qty * item.unitPrice)?.toLocaleString()}</td>
          </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="background:${accentColor};padding:28px 32px;">
        <table width="100%"><tr>
          <td><span style="color:#ffffff;font-size:20px;font-weight:700;">${businessName || "BillBook"}</span>
            <br><span style="color:rgba(255,255,255,0.7);font-size:12px;">${businessCity || ""} ${businessPhone ? "• " + businessPhone : ""}</span></td>
          <td style="text-align:right;"><span style="color:#ffffff;font-size:24px;font-weight:700;">INVOICE</span>
            <br><span style="color:rgba(255,255,255,0.7);font-size:12px;">${invoiceNumber}</span></td>
        </tr></table>
      </div>

      <div style="padding:28px 32px;">
        <!-- Meta -->
        <table width="100%" style="margin-bottom:24px;">
          <tr>
            <td>
              <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Bill To</span><br>
              <span style="font-size:15px;font-weight:600;color:#1c1917;">${clientName}</span>
            </td>
            <td style="text-align:right;">
              <span style="color:#888;font-size:12px;">Date: ${invoiceDate}</span><br>
              ${dueDate ? `<span style="color:#888;font-size:12px;">Due: ${dueDate}</span>` : ""}
            </td>
          </tr>
        </table>

        <!-- Items -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#f7f5f2;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;">Description</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;">Price</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <!-- Totals -->
        <table width="100%" style="margin-bottom:24px;">
          <tr><td style="text-align:right;padding:4px 0;font-size:13px;color:#888;">Subtotal</td><td style="text-align:right;padding:4px 0 4px 16px;font-size:13px;width:120px;">Rs. ${subtotal?.toLocaleString()}</td></tr>
          <tr><td style="text-align:right;padding:4px 0;font-size:13px;color:#888;">Tax (${taxRate || 0}%)</td><td style="text-align:right;padding:4px 0 4px 16px;font-size:13px;width:120px;">Rs. ${taxAmount?.toLocaleString()}</td></tr>
          <tr><td style="text-align:right;padding:8px 0 0;font-size:18px;font-weight:700;border-top:2px solid ${accentColor};">Total</td><td style="text-align:right;padding:8px 0 0 16px;font-size:18px;font-weight:700;width:120px;border-top:2px solid ${accentColor};">Rs. ${total?.toLocaleString()}</td></tr>
        </table>

        ${notes ? `<div style="padding:16px;background:#f7f5f2;border-radius:8px;margin-bottom:16px;"><span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Payment Details</span><br><span style="font-size:12px;color:#555;white-space:pre-line;">${notes}</span></div>` : ""}
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:16px 32px;border-top:1px solid #f0f0f0;">
        <span style="font-size:11px;color:#bbb;">Generated by ${businessName || "BillBook"} • billbook.pk</span>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Build attachments array
    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: `${invoiceNumber}-${clientName}.pdf`,
        content: pdfBase64,
      });
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail || `${businessName || "BillBook"} <onboarding@resend.dev>`,
        to: [to],
        subject,
        html,
        attachments,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: resendData.message || "Failed to send email" }),
        { status: resendRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
