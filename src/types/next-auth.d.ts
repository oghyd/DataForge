import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: string;
      organizationId: string | null;
      organizationName: string | null;
      orgRole: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    organizationId: string | null;
    organizationName: string | null;
    orgRole: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    organizationId: string | null;
    organizationName: string | null;
    orgRole: string | null;
  }
}
