import React from 'react'
import { useFetchAllUserData } from '../components/fetch-data.jsx';

export default function Setting() {
    const { data, loading, error } = useFetchAllUserData();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Business Information</h2>
                {data ? (
                    <div>
                        <p><strong>Business Name:</strong> {data.businessName}</p>
                        <p><strong>Industry:</strong> {data.industry}</p>
                        <p><strong>Address:</strong> {data.address}</p>
                        <p><strong>Contact:</strong> {data.contact}</p>
                    </div>
                ) : (
                    <p>No business information available.</p>
                )}
            </div>

        </div>
    )
}
