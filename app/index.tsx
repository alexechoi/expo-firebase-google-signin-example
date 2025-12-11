import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth";

import { auth } from "@/src/firebase";
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_EXPO_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from "@/src/env";

WebBrowser.maybeCompleteAuthSession();

const googleClientIds = {
  expoClientId: GOOGLE_EXPO_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  webClientId: GOOGLE_WEB_CLIENT_ID,
};

const fallbackClientId =
  googleClientIds.expoClientId ||
  googleClientIds.webClientId ||
  googleClientIds.iosClientId ||
  googleClientIds.androidClientId;

if (!fallbackClientId) {
  throw new Error(
    "Google Sign-In client IDs are missing. Check your EXPO_PUBLIC_GOOGLE_* values.",
  );
}

type StatusState = {
  kind: "error" | "info";
  message: string;
} | null;

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [status, setStatus] = useState<StatusState>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const isExpoGo = Constants.appOwnership === "expo";
  const androidClientId = isExpoGo
    ? googleClientIds.expoClientId
    : googleClientIds.androidClientId;
  const iosClientId = isExpoGo
    ? googleClientIds.expoClientId
    : googleClientIds.iosClientId;

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: fallbackClientId,
    androidClientId,
    iosClientId,
    webClientId: googleClientIds.webClientId,
  });

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setStatus(null);

      if (!request) {
        setStatus({
          kind: "info",
          message: "Still preparing the Google auth request, try again.",
        });
        return;
      }

      const result = await promptAsync();

      if (result.type !== "success") {
        if (result.type !== "dismiss") {
          setStatus({
            kind: "info",
            message: "Google sign-in was cancelled.",
          });
        }
        return;
      }

      const idToken = result.params?.id_token;
      const accessToken = result.authentication?.accessToken;

      if (!idToken) {
        setStatus({
          kind: "error",
          message: "Could not read the ID token from Google.",
        });
        return;
      }

      const credential = GoogleAuthProvider.credential(
        idToken,
        accessToken ?? undefined,
      );

      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error(error);
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to sign in with Google.",
      });
    }
  }, [promptAsync, request]);

  const handleSignOut = useCallback(async () => {
    setStatus(null);

    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
      setStatus({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to sign out of Firebase.",
      });
    }
  }, []);

  const displayName = useMemo(
    () => user?.displayName ?? user?.email ?? "Authenticated user",
    [user],
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Firebase Google Sign-In</Text>
        <Text style={styles.subtitle}>
          This example uses Firebase JS SDK + expo-auth-session. Auth state is
          persisted with AsyncStorage so reloads keep the user signed in.
        </Text>

        {initializing ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingLabel}>Restoring session...</Text>
          </View>
        ) : user ? (
          <View style={styles.userSection}>
            {user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : null}
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleSignOut}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={[styles.buttonLabel, styles.secondaryButtonLabel]}>
                Sign out
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={!request}
              onPress={handleGoogleSignIn}
              style={[
                styles.button,
                styles.googleButton,
                !request && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonLabel}>Continue with Google</Text>
            </Pressable>
          </View>
        )}

        {status ? (
          <Text
            style={[
              styles.status,
              status.kind === "error" ? styles.statusError : styles.statusInfo,
            ]}
          >
            {status.message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F6F8FB",
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  loadingLabel: {
    fontSize: 14,
    color: "#0F172A",
    marginLeft: 8,
  },
  actions: {
    alignItems: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#0B57D0",
    shadowColor: "#0B57D0",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonLabel: {
    color: "#ffffff",
    fontWeight: "600",
  },
  userSection: {
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonLabel: {
    color: "#0B57D0",
  },
  status: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
  },
  statusError: {
    color: "#B3261E",
  },
  statusInfo: {
    color: "#475569",
  },
});
