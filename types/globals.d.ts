export {};

declare global {
  interface ClerkAuthorization {
    userId: string;
    sessionClaims: {
      metadata: {
        role: "admin" | "member" | "guest";
      };
    };
  }
}
