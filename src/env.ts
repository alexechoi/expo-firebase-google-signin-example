const requireEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(
      `Missing required environment variable "${key}". Did you copy ".env.example" to ".env"?`,
    );
  }

  return value;
};

export const FIREBASE_API_KEY = requireEnv(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  "EXPO_PUBLIC_FIREBASE_API_KEY",
);
export const FIREBASE_AUTH_DOMAIN = requireEnv(
  process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
);
export const FIREBASE_PROJECT_ID = requireEnv(
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
);
export const FIREBASE_STORAGE_BUCKET = requireEnv(
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
);
export const FIREBASE_MESSAGING_SENDER_ID = requireEnv(
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
);
export const FIREBASE_APP_ID = requireEnv(
  process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  "EXPO_PUBLIC_FIREBASE_APP_ID",
);

export const GOOGLE_EXPO_CLIENT_ID = requireEnv(
  process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  "EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID",
);
export const GOOGLE_ANDROID_CLIENT_ID = requireEnv(
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID",
);
export const GOOGLE_IOS_CLIENT_ID = requireEnv(
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
);
export const GOOGLE_WEB_CLIENT_ID = requireEnv(
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
);
