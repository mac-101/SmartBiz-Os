import { ref, onValue } from "firebase/database";
import { db } from "../../firebase.config";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase.config";

export function useFetchAllUserData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, authLoading, authError] = useAuthState(auth);

    useEffect(() => {
        // Wait for auth to be ready
        if (authLoading) return;

        if (authError) {
            setError(authError instanceof Error ? authError : new Error(String(authError)));
            setLoading(false);
            return;
        }

        if (!user) {
            setError(new Error("No authenticated user"));
            setLoading(false);
            return;
        }

        const dataRef = ref(db, `businessData/${user.uid}`);
        const unsubscribe = onValue(
            dataRef,
            (snapshot) => {
                if (snapshot.exists()) setData(snapshot.val());
                else setData(null);
                setLoading(false);
            },
            (err) => {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, authLoading, authError]);

    return { data, loading, error };
}