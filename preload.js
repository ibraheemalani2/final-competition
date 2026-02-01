const { contextBridge } = require('electron');
const { db } = require('./firebase-config.js');
const { collection, getDocs, onSnapshot, query, where } = require('firebase/firestore');

contextBridge.exposeInMainWorld('api', {
    // 1. Function to get questions (Initial Load)
    getQuestions: async () => {
        const querySnapshot = await getDocs(collection(db, "questions"));
        let questions = [];
        querySnapshot.forEach((doc) => {
            questions.push({ id: doc.id, ...doc.data() });
        });
        return questions;
    },

    // 2. Function to listen for real-time updates (Syncing)
    onQuestionsUpdate: (callback) => {
        const unsub = onSnapshot(collection(db, "questions"), (snapshot) => {
            let questions = [];
            snapshot.forEach((doc) => {
                questions.push({ id: doc.id, ...doc.data() });
            });
            callback(questions);
        });
    },

    // 3. Function to check admin password
    checkAdminPassword: async (passwordInput) => {
        try {
            const q = query(collection(db, "passwords"), where("password", "==", passwordInput));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking password:", error);
            return false;
        }
    }
});