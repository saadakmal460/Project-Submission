import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <section className="bg-white">
            <div className="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-28">
                <div className="mr-auto place-self-center lg:col-span-7">
                    <h1 className="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-black">
                        Illegal Parking & Vendor Detection System
                    </h1>
                    <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
                        Detect illegal parking and vendor activity using AI-powered systems.
                        Our solution helps authorities monitor and manage urban spaces more effectively.
                    </p>

                    <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">


                        <Link to='/signin'>
                            <button
                                className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-medium text-center text-white bg-blue-600 border border-gray-200 rounded-lg sm:w-auto hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
                    <img
                        src="https://demo.themesberg.com/landwind/images/hero.png"
                        alt="hero image"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </section>
    );
};

export default LandingPage;
