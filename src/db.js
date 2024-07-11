import * as SQLite from 'expo-sqlite';

export const openDatabase = async () => {
    const db = await SQLite.openDatabaseAsync('patient_registration.db');
    await db.execAsync('PRAGMA journal_mode = WAL');
    return db;
};

export const createTable = async (db) => {
    await db.execAsync(`
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
};

export const insertPatient = async (db, chartCode, name, mobileNumber, gender, dob, age, relationship, notes) => {
    await db.runAsync(
        'INSERT INTO patients (chartCode, name, mobileNumber, gender, dob, age, relationship, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [chartCode, name, mobileNumber, gender, dob, age, relationship, notes]
    );
};
