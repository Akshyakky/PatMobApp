import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, Alert, Platform } from 'react-native';
import { openDatabase, createTable, insertPatient } from './src/db';  // Ensure the path is correct
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const App = () => {
    const [db, setDb] = useState(null);
    const [mobileNumber, setMobileNumber] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState(new Date());
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [age, setAge] = useState('');
    const [relationship, setRelationship] = useState('');
    const [notes, setNotes] = useState('');
    const [useDOB, setUseDOB] = useState(true);

    useEffect(() => {
        async function initializeDb() {
            const dbInstance = await openDatabase();
            await createTable(dbInstance);
            setDb(dbInstance);
        }
        initializeDb();
    }, []);

    const handleRegister = async () => {
        const chartCode = generateChartCode();
        const formattedDob = dob.toISOString().split('T')[0]; // Format DOB to YYYY-MM-DD
        await insertPatient(db, chartCode, name, mobileNumber, gender, formattedDob, age, relationship, notes);
        Alert.alert('Patient registered successfully!');
    };

    const generateChartCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const onDobChange = (event, selectedDate) => {
        const currentDate = selectedDate || dob;
        setShowDobPicker(Platform.OS === 'ios');
        setDob(currentDate);
    };

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text>Patient Mobile Number</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 15 }}
                keyboardType="numeric"
                maxLength={10}
                value={mobileNumber}
                onChangeText={setMobileNumber}
            />

            <Text>Patient Name</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 15 }}
                value={name}
                onChangeText={setName}
            />

            <Text>Patient Gender</Text>
            <Picker selectedValue={gender} onValueChange={setGender} style={{ marginBottom: 15 }}>
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Either" value="either" />
            </Picker>

            <Text>Date of Birth or Age</Text>
            <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'center' }}>
                <Text onPress={() => setUseDOB(true)}>DOB</Text>
                <RadioButton selected={useDOB} onPress={() => setUseDOB(true)} />
                <Text onPress={() => setUseDOB(false)}>Age</Text>
                <RadioButton selected={!useDOB} onPress={() => setUseDOB(false)} />
            </View>

            {useDOB ? (
                <View>
                    <Text>Patient DOB</Text>
                    <Button onPress={() => setShowDobPicker(true)} title="Select Date" />
                    {showDobPicker && (
                        <DateTimePicker
                            value={dob}
                            mode="date"
                            display="default"
                            onChange={onDobChange}
                        />
                    )}
                    <Text style={{ marginTop: 15 }}>{dob.toDateString()}</Text>
                </View>
            ) : (
                <View>
                    <Text>Patient Age</Text>
                    <TextInput
                        style={{ borderBottomWidth: 1, marginBottom: 15 }}
                        keyboardType="numeric"
                        maxLength={3}
                        value={age}
                        onChangeText={setAge}
                    />
                </View>
            )}

            <Text>Patient Relationship</Text>
            <Picker selectedValue={relationship} onValueChange={setRelationship} style={{ marginBottom: 15 }}>
                <Picker.Item label="Father" value="father" />
                <Picker.Item label="Mother" value="mother" />
                <Picker.Item label="Brother" value="brother" />
                <Picker.Item label="Sister" value="sister" />
                <Picker.Item label="Son" value="son" />
                <Picker.Item label="Daughter" value="daughter" />
                <Picker.Item label="Friend" value="friend" />
            </Picker>   

            <Text>Notes</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 15 }}
                multiline
                value={notes}
                onChangeText={setNotes}
            />

            <Button title="Register" onPress={handleRegister} />
        </ScrollView>
    );
};

const RadioButton = ({ selected, onPress }) => (
    <Text style={{ marginLeft: 10, marginRight: 10 }} onPress={onPress}>
        {selected ? '◉' : '◯'}
    </Text>
);

export default App;
