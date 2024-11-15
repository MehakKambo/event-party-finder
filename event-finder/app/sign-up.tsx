import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useSession } from "@/context";

/**
 * SignUp component handles new user registration
 * @returns {JSX.Element} Sign-up form component
 */
export default function SignUp() {
    // ============================================================================
    // Hooks & State
    // ============================================================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const { signUp } = useSession();

    // ============================================================================
    // Handlers
    // ============================================================================

    /**
     * Handles the registration process
     * @returns {Promise<Models.User<Models.Preferences> | null>}
     */
    const handleRegister = async () => {
        try {
            return await signUp(email, password, name);
        } catch (err) {
            console.log("[handleRegister] ==>", err);
            return null;
        }
    };

    /**
     * Handles the sign-up button press
     */
    const handleSignUpPress = async () => {
        const response = await handleRegister();
        if (response) {
            router.replace({ pathname: "/(tabs)/home" });
            
        }
    };

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <View style={styles.container}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.subText}>Sign up to get started</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
                <View>
                    <Text style={styles.labelText}>Name</Text>
                    <TextInput
                        placeholder="Your full name"
                        value={name}
                        onChangeText={setName}
                        textContentType="name"
                        autoCapitalize="words"
                        style={styles.input}
                    />
                </View>

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
                        placeholder="Create a password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        textContentType="newPassword"
                        style={styles.input}
                    />
                </View>
            </View>

            {/* Sign Up Button */}
            <Pressable onPress={handleSignUpPress} style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
            </Pressable>

            {/* Sign In Link */}
            <View style={styles.signInLinkContainer}>
                <Text style={styles.signInText}>Already have an account?</Text>
                <Link href=".." asChild>
                    <Pressable style={styles.signInPressable}>
                        <Text style={styles.signInLinkText}>Sign In</Text>
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
    signUpButton: {
        backgroundColor: '#1e90ff',
        width: '100%',
        maxWidth: 300,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    signUpButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    signInLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    signInText: {
        color: '#606060',
    },
    signInPressable: {
        marginLeft: 8,
    },
    signInLinkText: {
        color: '#1e90ff',
        fontWeight: '600',
    },
});
