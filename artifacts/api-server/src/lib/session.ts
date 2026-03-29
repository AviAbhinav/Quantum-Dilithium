declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    publicKey: string;
  }
}

export {};
