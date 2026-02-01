const { contextBridge } = require('electron');
const { db } = require('./firebase-config.js');
const { collection, getDocs, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } = require('firebase/firestore');

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

    // 3. Function to add a question
    addQuestion: async (question) => {
        try {
            const docRef = await addDoc(collection(db, "questions"), question);
            console.log("Document written with ID: ", docRef.id);
            return docRef.id;
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    },

    // 4. Function to update a question
    updateQuestion: async (id, updatedData) => {
        try {
            const questionRef = doc(db, "questions", id);
            await updateDoc(questionRef, updatedData);
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    },

    // 5. Function to delete a question
    deleteQuestion: async (id) => {
        try {
            await deleteDoc(doc(db, "questions", id));
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    },

    checkAdminPassword: async (passwordInput) => {
        try {
            const q = query(collection(db, "passwords"), where("password", "==", passwordInput));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking password:", error);
            return false;
        }
    },

    // 7. Function to change admin password
    changeAdminPassword: async (newPassword) => {
        try {
            const querySnapshot = await getDocs(collection(db, "passwords"));
            if (querySnapshot.empty) {
                // If no password exists, create one
                await addDoc(collection(db, "passwords"), { password: newPassword });
            } else {
                // Update the first found password document
                // If there are multiple, this updates one of them (usually sufficient for single-user apps)
                const docId = querySnapshot.docs[0].id;
                const passwordRef = doc(db, "passwords", docId);
                await updateDoc(passwordRef, { password: newPassword });
            }
            return true;
        } catch (error) {
            console.error("Error changing password:", error);
            return false;
        }
    }
});