import type { APIRoute } from 'astro';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, message: 'All fields are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a valid email address.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cloudflare runtime env (works on CF Pages) with fallback to import.meta.env (dev)
    const runtime = (locals as any).runtime;
    const resendApiKey = runtime?.env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured. Check Cloudflare Pages environment variables.');
      return new Response(
        JSON.stringify({ success: false, message: 'Email service is temporarily unavailable. Please email us directly at support@nativefirstapp.com.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send email via Resend
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const { error } = await resend.emails.send({
      from: 'NativeFirst Contact <support@nativefirstapp.com>',
      to: 'support@nativefirstapp.com',
      replyTo: email,
      subject: `[Contact] ${subject} — ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error('Resend API error:', JSON.stringify(error));
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to send message. Please try emailing us directly at support@nativefirstapp.com.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to send message. Please try emailing us directly at support@nativefirstapp.com.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
