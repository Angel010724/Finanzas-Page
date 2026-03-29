import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/goals/:path*",
    "/recurring/:path*",
    "/reports/:path*",
    "/ai-advisor/:path*",
    "/settings/:path*",
  ],
};
