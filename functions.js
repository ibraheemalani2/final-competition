const { db, storage } = require('./firebase-config.js');
const { collection, getDocs, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } = require('firebase/firestore');
const { ref, uploadString, getDownloadURL, deleteObject } = require('firebase/storage');

// =============================================
// QUESTIONS
// =============================================

// 1. Function to get questions (Initial Load)
export const getQuestions = async () => {
    const querySnapshot = await getDocs(collection(db, "questions"));
    let questions = [];
    querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() });
    });
    return questions;
}

// 2. Function to listen for real-time updates (Syncing)
export const onQuestionsUpdate = (callback) => {
    const unsub = onSnapshot(collection(db, "questions"), (snapshot) => {
        let questions = [];
        snapshot.forEach((doc) => {
            questions.push({ id: doc.id, ...doc.data() });
        });
        callback(questions);
    });
    return unsub;
}

// 3. Function to add a question
export const addQuestion = async (question) => {
    try {
        const docRef = await addDoc(collection(db, "questions"), question);
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// 4. Function to update a question
export const updateQuestion = async (id, updatedData) => {
    try {
        const questionRef = doc(db, "questions", id);
        await updateDoc(questionRef, updatedData);
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

// 5. Function to delete a question
export const deleteQuestion = async (id) => {
    try {
        await deleteDoc(doc(db, "questions", id));
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
}

// =============================================
// PASSWORDS
// =============================================

export const checkAdminPassword = async (passwordInput) => {
    try {
        const q = query(collection(db, "passwords"), where("password", "==", passwordInput));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking password:", error);
        return false;
    }
}

export const changeAdminPassword = async (newPassword) => {
    try {
        const querySnapshot = await getDocs(collection(db, "passwords"));
        if (querySnapshot.empty) {
            await addDoc(collection(db, "passwords"), { password: newPassword });
        } else {
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

// =============================================
// FIREBASE STORAGE - IMAGE UPLOAD/DELETE
// =============================================

/**
 * Upload a base64 data URL image to Firebase Storage.
 * @param {string} path - Storage path, e.g. "images/bg/background.png"
 * @param {string} base64Data - The full data URL string (data:image/...;base64,...)
 * @returns {string} The download URL of the uploaded image
 */
export const uploadImage = async (path, base64Data) => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadString(storageRef, base64Data, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("Image uploaded to:", path, "URL:", downloadURL);
        return downloadURL;
    } catch (e) {
        console.error("Error uploading image:", e);
        throw e;
    }
}

/**
 * Delete an image from Firebase Storage.
 * @param {string} path - Storage path to delete
 */
export const deleteImage = async (path) => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        console.log("Image deleted from:", path);
    } catch (e) {
        // Ignore "object-not-found" errors gracefully
        if (e.code === 'storage/object-not-found') {
            console.log("Image already deleted or not found:", path);
        } else {
            console.error("Error deleting image:", e);
        }
    }
}

// =============================================
// APP CONFIG (Firestore document: appConfig/settings)
// =============================================

/**
 * Save appConfig to Firestore. Strips out large base64 images
 * (those should use Storage URLs instead).
 * Uses merge to allow partial updates.
 */
export const saveAppConfig = async (configData) => {
    try {
        const configRef = doc(db, "appConfig", "settings");
        await setDoc(configRef, configData, { merge: true });
        console.log("AppConfig saved to Firestore");
    } catch (e) {
        console.error("Error saving appConfig:", e);
    }
}

/**
 * Load appConfig from Firestore.
 * @returns {Object|null} The config data or null if not found
 */
export const getAppConfig = async () => {
    try {
        const configRef = doc(db, "appConfig", "settings");
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (e) {
        console.error("Error loading appConfig:", e);
        return null;
    }
}

/**
 * Real-time listener for appConfig changes.
 */
export const onAppConfigUpdate = (callback) => {
    const configRef = doc(db, "appConfig", "settings");
    const unsub = onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        }
    });
    return unsub;
}

// =============================================
// SECTIONS (Firestore collection: sections)
// =============================================

export const getSections = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "sections"));
        let sections = [];
        querySnapshot.forEach((d) => {
            sections.push({ id: d.id, ...d.data() });
        });
        return sections;
    } catch (e) {
        console.error("Error loading sections:", e);
        return [];
    }
}

export const saveSectionToFirebase = async (section) => {
    try {
        const sectionId = String(section.id);
        const sectionRef = doc(db, "sections", sectionId);
        await setDoc(sectionRef, { title: section.title, icon: section.icon || 'Star', color: section.color, originalId: section.id }, { merge: true });
        console.log("Section saved:", sectionId);
    } catch (e) {
        console.error("Error saving section:", e);
    }
}

export const deleteSectionFromFirebase = async (id) => {
    try {
        await deleteDoc(doc(db, "sections", String(id)));
        console.log("Section deleted:", id);
    } catch (e) {
        console.error("Error deleting section:", e);
    }
}

export const onSectionsUpdate = (callback) => {
    const unsub = onSnapshot(collection(db, "sections"), (snapshot) => {
        let sections = [];
        snapshot.forEach((d) => {
            sections.push({ id: d.id, ...d.data() });
        });
        callback(sections);
    });
    return unsub;
}

// =============================================
// PRIZES (Firestore collection: prizes)
// =============================================

export const getPrizes = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "prizes"));
        let prizes = [];
        querySnapshot.forEach((d) => {
            prizes.push({ id: d.id, ...d.data() });
        });
        return prizes;
    } catch (e) {
        console.error("Error loading prizes:", e);
        return [];
    }
}

export const savePrizeToFirebase = async (prize) => {
    try {
        const prizeId = String(prize.id);
        const prizeRef = doc(db, "prizes", prizeId);
        await setDoc(prizeRef, { name: prize.name, image: prize.image || '', isTaken: prize.isTaken || false, originalId: prize.id }, { merge: true });
        console.log("Prize saved:", prizeId);
    } catch (e) {
        console.error("Error saving prize:", e);
    }
}

export const deletePrizeFromFirebase = async (id) => {
    try {
        await deleteDoc(doc(db, "prizes", String(id)));
        console.log("Prize deleted:", id);
    } catch (e) {
        console.error("Error deleting prize:", e);
    }
}

export const onPrizesUpdate = (callback) => {
    const unsub = onSnapshot(collection(db, "prizes"), (snapshot) => {
        let prizes = [];
        snapshot.forEach((d) => {
            prizes.push({ id: d.id, ...d.data() });
        });
        callback(prizes);
    });
    return unsub;
}

// =============================================
// SPONSORS (Firestore collection: sponsors)
// =============================================

export const getSponsors = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "sponsors"));
        let sponsors = [];
        querySnapshot.forEach((d) => {
            sponsors.push({ id: d.id, ...d.data() });
        });
        return sponsors;
    } catch (e) {
        console.error("Error loading sponsors:", e);
        return [];
    }
}

export const saveSponsorToFirebase = async (sponsor) => {
    try {
        const sponsorId = String(sponsor.id);
        const sponsorRef = doc(db, "sponsors", sponsorId);
        await setDoc(sponsorRef, { name: sponsor.name, logo: sponsor.logo || '', originalId: sponsor.id }, { merge: true });
        console.log("Sponsor saved:", sponsorId);
    } catch (e) {
        console.error("Error saving sponsor:", e);
    }
}

export const deleteSponsorFromFirebase = async (id) => {
    try {
        await deleteDoc(doc(db, "sponsors", String(id)));
        console.log("Sponsor deleted:", id);
    } catch (e) {
        console.error("Error deleting sponsor:", e);
    }
}

export const onSponsorsUpdate = (callback) => {
    const unsub = onSnapshot(collection(db, "sponsors"), (snapshot) => {
        let sponsors = [];
        snapshot.forEach((d) => {
            sponsors.push({ id: d.id, ...d.data() });
        });
        callback(sponsors);
    });
    return unsub;
}
