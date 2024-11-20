import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import { router } from "expo-router";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handlePasswordReset = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                "Success",
                "Password reset email sent. Please check your inbox. It may take 2-4 minutes to arrive.",
                [
                    {
                        text: "OK",
                        onPress: () => console.log("Password reset email sent."),
                    },
                ]
            );
            router.replace({ pathname: "/sign-in" });
        } catch (error) {
            console.log("Error sending password reset email:", error);
            Alert.alert(
                "Error",
                "Failed to send password reset email. Please ensure the email is correct or try again later."
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password?</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
                <Text style={styles.resetButtonText}>Send Reset Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.replace({ pathname: "/sign-in" })}
                style={{ marginTop: 20 }}
            >
                <Text style={{ color: "#007AFF" }}>Back to Sign In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        maxWidth: 300,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    resetButton: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        maxWidth: 300,
    },
    resetButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
