import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handlePasswordShow = () => {
        setShowPassword(!showPassword);
    };

    const validateForm = () => {
        const { username, email, password } = formData;
        return username && email.includes("@") && password.length >= 6;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("https://aibackend-us18nadk.b4a.run/api/signup", formData);
            toast.success("Account created successfully!");
            console.log("Response:", response.data);
        } catch (error) {
            toast.error("Failed to create account. Please try again.");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <section className="flex flex-col items-center pt-6">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Create an account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                                    Your full name
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    id="name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green focus:border-custom-green block w-full p-2.5"
                                    placeholder="Enter name"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green focus:border-custom-green block w-full p-2.5"
                                    placeholder="Enter your email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                    Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    placeholder="Enter password"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-green focus:border-custom-green block w-full p-2.5"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                <button type="button" onClick={handlePasswordShow} className="text-sm text-blue-600">
                                    {showPassword ? "Hide Password" : "Show Password"}
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center text-white hover:bg-hover-green focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 bg-custom-green"
                                disabled={!validateForm() || loading}
                            >
                                {loading ? (
                                    <svg
                                        className="w-5 h-5 text-white animate-spin"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                                        ></path>
                                    </svg>
                                ) : (
                                    "Create an account"
                                )}
                            </button>

                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Signup;
