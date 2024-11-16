import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { useSession } from "@/context";

/**
 * SignIn component handles user authentication through email and password
 * @returns {JSX.Element} Sign-in form component
 */
export default function SignIn() {
    // ============================================================================
    // Hooks & State
    // ============================================================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signIn } = useSession();

    // ============================================================================
    // Handlers
    // ============================================================================

    /**
     * Handles the sign-in process
     * @returns {Promise<Models.User<Models.Preferences> | null>}
     */
    const handleLogin = async () => {
        try {
            return await signIn(email, password);
        } catch (err) {
            return null;
        }
    };

    /**
     * Handles the sign-in button press
     */
    const handleSignInPress = async () => {
        const resp = await handleLogin();
        if (resp == null) {
            // Alert the user that the sign-in failed
            Alert.alert("Sign In Failed", "Please check your credentials and try again.");
            return;
        }
        router.replace({ pathname: "/(tabs)/home" }); 
    };

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <View style={styles.container}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.subText}>Please sign in to continue</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
                <View>
                    <Text style={styles.labelText}>Email</Text>
                    <TextInput
                        placeholder="name@mail.com"
                        value={email}
                        onChangeText={setEmail}
                        textContentType="emailAddress"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                    />
                </View>

                <View>
                    <Text style={styles.labelText}>Password</Text>
                    <TextInput
                        placeholder="Your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        textContentType="password"
                        style={styles.input}
                    />
                </View>
            </View>

            {/* Sign In Button */}
            <Pressable onPress={handleSignInPress} style={styles.signInButton}>
                <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>

            {/* Sign Up Link */}
            <View style={styles.signUpLinkContainer}>
                <Text style={styles.signUpText}>Don't have an account?</Text>
                <Link href="/sign-up" asChild>
                    <Pressable style={styles.signUpPressable}>
                        <Text style={styles.signUpLinkText}>Sign Up</Text>
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    welcomeSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4a4a4a',
        marginBottom: 8,
    },
    subText: {
        fontSize: 14,
        color: '#a0a0a0',
    },
    formSection: {
        width: '100%',
        maxWidth: 300,
        marginBottom: 32,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4a4a4a',
        marginBottom: 4,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#ffffff',
        marginBottom: 16,
    },
    signInButton: {
        backgroundColor: '#1e90ff',
        width: '100%',
        maxWidth: 300,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    signInButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    signUpLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    signUpText: {
        color: '#606060',
    },
    signUpPressable: {
        marginLeft: 8,
    },
    signUpLinkText: {
        color: '#1e90ff',
        fontWeight: '600',
    },
});
