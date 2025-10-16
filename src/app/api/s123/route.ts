export async function GET() {
  return Response.json({
    HOST_CATALOG: process.env.HOST_CATALOG,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    HOST_TOKEN: process.env.HOST_TOKEN,
  });
}
