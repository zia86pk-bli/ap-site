export default async (req) => {
  const headers = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false }), { status: 405, headers });
  }

  const teacherPassword = process.env.TEACHER_PASSWORD;
  if (!teacherPassword) {
    return new Response(JSON.stringify({ ok: false, error: "TEACHER_PASSWORD not set in Netlify environment variables." }), { status: 500, headers });
  }

  try {
    const { password } = await req.json();
    const ok = password === teacherPassword;
    return new Response(JSON.stringify({ ok }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers });
  }
};

export const config = { path: "/api/auth" };
