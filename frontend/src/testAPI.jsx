import axios from "axios";
import API_URL from "./config/api";
import { useEffect } from "react";

export default function TestAPI() {
    useEffect(() => {
        axios.get(`${API_URL}/health`)
            .then((res) => {
                console.log("Backend Response:", res.data);
            })
            .catch((err) => {
                console.log("Error:", err);
            });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <h1 className="text-2xl font-bold text-blue-600">
                Lingora API Test Page
            </h1>
        </div>
    );
}