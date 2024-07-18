import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, Alert, Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios'; // Import axios for API calls

const App = () => {
    const [patients, setPatients] = useState([]);
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState(''); // Email state
    const [otp, setOtp] = useState(''); // OTP state
    const [otpSent, setOtpSent] = useState(false); // OTP sent status
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState(new Date());
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [age, setAge] = useState('');
    const [relationship, setRelationship] = useState('');
    const [notes, setNotes] = useState('');
    const [useDOB, setUseDOB] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            const storedPatients = await AsyncStorage.getItem('patients');
            if (storedPatients) {
                setPatients(JSON.parse(storedPatients));
            }
        };
        fetchPatients();
    }, []);

    const handleRegister = async () => {
        const chartCode = generateChartCode();
        const formattedDob = dob.toISOString().split('T')[0];
        const newPatient = {
            chartCode,
            name,
            mobileNumber,
            email, // Include email in patient data
            gender,
            dob: formattedDob,
            age,
            relationship,
            notes,
        };

        const updatedPatients = [...patients, newPatient];
        setPatients(updatedPatients);
        await AsyncStorage.setItem('patients', JSON.stringify(updatedPatients));

        Alert.alert('Patient registered successfully!');
        resetForm();
    };

    const resetForm = () => {
        setMobileNumber('');
        setEmail(''); // Reset email
        setOtp(''); // Reset OTP
        setName('');
        setGender('');
        setDob(new Date());
        setAge('');
        setRelationship('');
        setNotes('');
        setOtpSent(false); // Reset OTP sent status
    };

    const generateChartCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const onDobChange = (event, selectedDate) => {
        const currentDate = selectedDate || dob;
        setShowDobPicker(Platform.OS === 'ios');
        setDob(currentDate);
    };

    const handleRequestOtp = async () => {
        if (!email) {
            Alert.alert('Please enter a valid email address.');
            return;
        }
        try {
            console.log('Sending OTP to:', email);
            const response = await axios.post('http://192.168.29.32:3000/send-otp', { email });
            console.log('Response:', response.data);
            if (response.data.success) {
                setOtpSent(true);
                Alert.alert('OTP sent to your email.');
            } else {
                Alert.alert('Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            Alert.alert('An error occurred. Please try again.');
        }
    };
    
    const handleVerifyOtp = async () => {
        try {
            console.log('Verifying OTP for:', email);
            const response = await axios.post('http://192.168.29.32:3000/verify-otp', { email, otp });
            console.log('Response:', response.data);
            if (response.data.success) {
                Alert.alert('OTP verified successfully.');
            } else {
                Alert.alert('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            Alert.alert('An error occurred. Please try again.');
        }
    };
    
    const RadioButton = ({ selected, onPress }) => (
        <Text style={{ marginLeft: 10, marginRight: 10 }} onPress={onPress}>
            {selected ? '◉' : '◯'}
        </Text>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Patient Registration</Text>

            <Text style={styles.label}>Patient Mobile Number</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                maxLength={10}
                value={mobileNumber}
                onChangeText={setMobileNumber}
            />

            <Text style={styles.label}>Patient Email</Text>
            <TextInput
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            {!otpSent && (
                <View style={styles.buttonContainer}>
                    <Button title="Request OTP" onPress={handleRequestOtp} color="#FF6F30" />
                </View>
            )}

            {otpSent && (
                <>
                    <Text style={styles.label}>Enter OTP</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={otp}
                        onChangeText={setOtp}
                    />
                    <View style={styles.buttonContainer}>
                        <Button title="Verify OTP" onPress={handleVerifyOtp} color="#FF6F30" />
                    </View>
                </>
            )}

            <Text style={styles.label}>Patient Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Patient Gender</Text>
            <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
            </Picker>

            <Text style={styles.label}>Date of Birth or Age</Text>
            <View style={styles.radioContainer}>
                <Text onPress={() => setUseDOB(true)}>DOB</Text>
                <RadioButton selected={useDOB} onPress={() => setUseDOB(true)} />
                <Text onPress={() => setUseDOB(false)}>Age</Text>
                <RadioButton selected={!useDOB} onPress={() => setUseDOB(false)} />
            </View>

            {useDOB ? (
                <View>
                    <Text style={styles.label}>Patient DOB</Text>
                    <Button onPress={() => setShowDobPicker(true)} title="Select Date" />
                    {showDobPicker && (
                        <DateTimePicker
                            value={dob}
                            mode="date"
                            display="default"
                            onChange={onDobChange}
                        />
                    )}
                    <Text style={styles.dateText}>{dob.toDateString()}</Text>
                </View>
            ) : (
                <View>
                    <Text style={styles.label}>Patient Age</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        maxLength={3}
                        value={age}
                        onChangeText={setAge}
                    />
                </View>
            )}

            <Text style={styles.label}>Patient Relationship</Text>
            <Picker selectedValue={relationship} onValueChange={setRelationship} style={styles.picker}>
                <Picker.Item label="Father" value="father" />
                <Picker.Item label="Mother" value="mother" />
                <Picker.Item label="Brother" value="brother" />
                <Picker.Item label="Sister" value="sister" />
                <Picker.Item label="Son" value="son" />
                <Picker.Item label="Daughter" value="daughter" />
                <Picker.Item label="Friend" value="friend" />
            </Picker>

            <Text style={styles.label}>Notes</Text>
            <TextInput
                style={styles.input}
                multiline
                value={notes}
                onChangeText={setNotes}
            />

            <View style={styles.buttonContainer}>
                <Button title="Register" onPress={handleRegister} color="#FF6F30" />
            </View>

            <View>
                {patients.map((patient, index) => (
                    <View key={index} style={styles.patientCard}>
                        <Text style={styles.patientText}>Chart Code: {patient.chartCode}</Text>
                        <Text style={styles.patientText}>Name: {patient.name}</Text>
                        <Text style={styles.patientText}>Mobile: {patient.mobileNumber}</Text>
                        <Text style={styles.patientText}>Email: {patient.email}</Text>
                        <Text style={styles.patientText}>Gender: {patient.gender}</Text>
                        <Text style={styles.patientText}>DOB: {patient.dob}</Text>
                        <Text style={styles.patientText}>Age: {patient.age}</Text>
                        <Text style={styles.patientText}>Relationship: {patient.relationship}</Text>
                        <Text style={styles.patientText}>Notes: {patient.notes}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingBottom: 50,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#FAF3E0',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FF6F30',
    },
    label: {
        fontSize: 15,
        marginBottom: 5,
        color: '#333',
        fontWeight: '600',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#FF6F30',
        marginBottom: 20,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    picker: {
        marginBottom: 15,
        borderColor: '#FF6F30',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    radioContainer: {
        flexDirection: 'row',
        marginBottom: 25,
        alignItems: 'center',
    },
    dateText: {
        marginTop: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    patientCard: {
        marginTop: 10,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#FFE4B5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 3,
    },
    patientText: {
        fontSize: 16,
        color: '#333',
    },
});

export default App;
