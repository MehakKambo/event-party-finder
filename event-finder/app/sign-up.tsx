import { router, Link } from "expo-router";
import { Text, TextInput, View, Pressable, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useSession } from "@/context";
import Icon from "react-native-vector-icons/Ionicons";
import { db, auth } from '@/lib/firebase-config';
import { setDoc, doc } from 'firebase/firestore';

export default function SignUp() {
    // ============================================================================
    // Hooks & State
    // ============================================================================

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false); 
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const { signUp } = useSession();

    /// ============================================================================
    // Handlers
    // =============================================================================

    
    const validatePassword = (password: string) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return passwordRegex.test(password);
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            Alert.alert("Error", "All fields are required.");
            return null;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return null;
        }
        if (!validatePassword(password)) {
            Alert.alert(
                "Error",
                "Password must be at least 6 characters long and include one uppercase letter, one lowercase letter, one number, and one special character."
            );
            return null;
        }
        const name = `${firstName} ${lastName}`;
        try {
            return await signUp(email, password, name);
        } catch (err) {
            console.log("[handleRegister] ==>", err);
            return null;
        }
    };

    const saveUserToFirestore = async (uid: string) => {
        try {
            const userDocRef = doc(db, "users", uid); // Use uid as document ID
            await setDoc(userDocRef, {
                firstName,
                lastName,
                email,
                createdAt: new Date().toISOString(),
            });
            console.log("User saved to Firestore successfully");
        } catch (err) {
            console.error("Error saving user to Firestore:", err);
            Alert.alert("Error", "Unable to save user data.");
        }
    };

    const handleSignUpPress = async () => {
        const response = await handleRegister();
        if (response) {
            const uid = auth.currentUser?.uid;
            if (uid) {
                await saveUserToFirestore(uid); // Save user to Firestore
                router.replace("/location");
            } else {
                Alert.alert("Error", "User ID not found after signup.");
            }
        }
    };

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <View style={styles.container}>
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Create Your {process.env.EXPO_PUBLIC_APP_NAME} Account</Text>
                <Text style={styles.subText}>Sign up to get started</Text>
            </View>
            <View style={styles.formSection}>
                <View>
                    <Text style={styles.labelText}>First Name*</Text>
                    <TextInput
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        style={styles.input}
                    />
                </View>
                <View>
                    <Text style={styles.labelText}>Last Name*</Text>
                    <TextInput
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        style={styles.input}
                    />
                </View>
                <View>
                    <Text style={styles.labelText}>Email*</Text>
                    <TextInput
                        placeholder="name@mail.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                    />
                </View>
                <View>
                    <Text style={styles.labelText}>Password*</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!passwordVisible}
                            style={styles.textInput}
                        />
                        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconContainer}>
                            <Icon
                                name={passwordVisible ? "eye-off" : "eye"}
                                size={20}
                                color="#888"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <Text style={styles.labelText}>Confirm Password*</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!confirmPasswordVisible}
                            style={[styles.textInput]}
                        />
                        <TouchableOpacity
                            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        >
                            <Icon
                                name={confirmPasswordVisible ? "eye-off" : "eye"}
                                size={20}
                                color="#888"
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <Text style={styles.labelText}>* Required</Text>
                </View>
            </View>
            <Pressable onPress={handleSignUpPress} style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
            </Pressable>
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
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        maxWidth: 300,
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        marginBottom: 16,
    },
    textInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    iconContainer: {
        padding: 12,
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
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        padding: 8,
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
