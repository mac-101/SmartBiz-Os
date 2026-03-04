import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth'; // Import this
import { db, auth } from '../../firebase.config';
import InviteStaff from '../forms/addStaff';

export default function ViewStaff() {
    const [staffList, setStaffList] = useState([]);
    const [addStaffOpen, setAddStaffOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for Auth state so we don't try to fetch with a null UID
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const staffRef = ref(db, `businessData/${user.uid}/staff`);
                
                // Keep the listener active
                const unsubscribeData = onValue(staffRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setStaffList(Object.values(data));
                    } else {
                        setStaffList([]);
                    }
                    setLoading(false);
                });

                return () => unsubscribeData();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    if (loading) return <div className="p-6 text-center text-gray-500">Loading Team...</div>;

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm">
            {!addStaffOpen ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Your Team</h2>
                        <button
                            onClick={() => setAddStaffOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            + Add Staff
                        </button>
                    </div>

                    {staffList.length > 0 ? (
                        <div className="space-y-3">
                            {staffList.map((s, i) => (
                                <div key={i} className="flex justify-between p-4 border border-gray-100 rounded-xl items-center hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-bold text-gray-700">{s.name}</p>
                                        <p className="text-xs text-gray-500">{s.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            {s.role}
                                        </span>
                                        <p className="text-[9px] text-gray-400 mt-1">Joined {new Date(s.joinedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <p className="text-gray-400 text-sm">No staff members added yet.</p>
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <button 
                        onClick={() => setAddStaffOpen(false)}
                        className="mb-4 text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
                    >
                        ← Back to List
                    </button>
                    <InviteStaff />
                </div>
            )}
        </div>
    );
}