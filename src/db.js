import * as SQLite from 'expo-sqlite';

export const openDatabase = () => {
    const db = SQLite.openDatabase('patient_registration.db');
    return db;
};

export const createTable = async (db) => {
    await db.transaction(tx => {
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chartCode TEXT,
                name TEXT,
                mobileNumber TEXT,
                gender TEXT,
                dob TEXT,
                age INTEGER,
                relationship TEXT,
                notes TEXT
            );
        `);
    });
};

export const insertPatient = async (db, chartCode, name, mobileNumber, gender, dob, age, relationship, notes) => {
    await db.transaction(tx => {
        tx.executeSql(
            'INSERT INTO patients (chartCode, name, mobileNumber, gender, dob, age, relationship, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [chartCode, name, mobileNumber, gender, dob, age, relationship, notes]
        );
    });
};

export const getPatients = async (db) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM patients',
                [],
                (_, {
                    rows: {
                        _array
                    }
                }) => resolve(_array),
                (_, error) => reject(error)
            );
        });
    });
};