import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "Liveaboard Sipadan <noreply@liveaboardsipadan.com>";

interface AuthEmailPayload {
  user: {
    email: string;
    user_metadata?: { full_name?: string };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    verification_url?: string;
  };
  email_action_type:
    | "signup"
    | "magiclink"
    | "recovery"
    | "invite"
    | "email_change";
}

function getSubject(action: string): string {
  switch (action) {
    case "signup":
      return "Confirm your email — Liveaboard Sipadan";
    case "recovery":
      return "Reset your password — Liveaboard Sipadan";
    case "magiclink":
      return "Your login link — Liveaboard Sipadan";
    case "email_change":
      return "Confirm your email change — Liveaboard Sipadan";
    case "invite":
      return "You've been invited — Liveaboard Sipadan";
    default:
      return "Liveaboard Sipadan";
  }
}

function getHtml(action: string, url: string, name?: string): string {
  const greeting = name ? `Hi ${name},` : "Hi,";

  let message = "";
  let buttonText = "";

  switch (action) {
    case "signup":
      message = "Thanks for signing up! Please confirm your email to activate your account.";
      buttonText = "Confirm Email";
      break;
    case "recovery":
      message = "We received a request to reset your password. Click below to set a new one.";
      buttonText = "Reset Password";
      break;
    case "magiclink":
      message = "Click below to log in to your account.";
      buttonText = "Log In";
      break;
    case "email_change":
      message = "Please confirm your new email address.";
      buttonText = "Confirm Email";
      break;
    case "invite":
      message = "You've been invited to join. Click below to accept.";
      buttonText = "Accept Invite";
      break;
    default:
      message = "Click the button below to continue.";
      buttonText = "Continue";
  }

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0077a8; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Liveaboard Sipadan</h1>
        <p style="color: #b3e5fc; margin: 8px 0 0;">MV Celebes Explorer</p>
      </div>
      <div style="padding: 32px; background: #f9f9f9;">
        <p>${greeting}</p>
        <p>${message}</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${url}"
             style="display: inline-block; background: #0077a8; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            ${buttonText}
          </a>
        </div>
        <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div style="background: #333; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">MV Celebes Explorer | Semporna, Sabah, Malaysia</p>
      </div>
    </div>
  `;
}

const headers = { "Content-Type": "application/json" };

Deno.serve(async (req) => {
  try {
    const payload: AuthEmailPayload = await req.json();
    const { user, email_data, email_action_type } = payload;

    const confirmUrl = email_data.verification_url || email_data.redirect_to;
    const name = user.user_metadata?.full_name;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: user.email,
        subject: getSubject(email_action_type),
        html: getHtml(email_action_type, confirmUrl, name),
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error }), { status: 400, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.error("Hook error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers });
  }
});
