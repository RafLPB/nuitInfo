import React, { useState } from 'react';
import { UserCircle2, GitHub, Wave, Sun, Moon } from 'lucide-react';

// Sample contributor data - replace with actual team members
const contributors = [
    {
        name: "Alice Dupont",
        role: "Lead Developer",
        github: "alice-dupont",
        avatar: "/api/placeholder/100/100",
        contributions: [
            "Interactive Ocean Anatomy Mapping",
            "Frontend Architecture",
            "Podcast Integration"
        ]
    },
    {
        name: "Bob Martin",
        role: "UX Designer",
        github: "bob-martin",
        avatar: "/api/placeholder/100/100",
        contributions: [
            "User Interface Design",
            "Mobile Responsiveness",
            "Interaction Flows"
        ]
    },
    {
        name: "Claire Océane",
        role: "Data Visualization Specialist",
        github: "claire-oceane",
        avatar: "/api/placeholder/100/100",
        contributions: [
            "Ocean-Body Parallels Visualization",
            "Interactive Infographics",
            "Climate Data Integration"
        ]
    }
];

const ContributorCard = ({ contributor }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 m-2 transition-all duration-300 
        ${expanded ? 'scale-105' : 'scale-100'} 
        hover:shadow-xl cursor-pointer`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-center">
                <img
                    src={contributor.avatar}
                    alt={`${contributor.name}'s avatar`}
                    className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {contributor.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{contributor.role}</p>
                    <a
                        href={`https://github.com/${contributor.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-500 hover:text-blue-600"
                    >
                        <GitHub className="mr-2" size={16} /> {contributor.github}
                    </a>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 border-t pt-2">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">Key Contributions:</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                        {contributor.contributions.map((contrib, index) => (
                            <li key={index}>{contrib}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ContributorsPage = () => {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-blue-50'} 
      transition-colors duration-300 p-4 md:p-8`}>
            <div className="container mx-auto max-w-4xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-800 dark:text-blue-300 mb-4">
                        Race for Water Project Contributors
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Collaborative effort to create an interactive ocean-human body metaphor application
                    </p>

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700
              rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-600
              transition-colors duration-300"
                    >
                        {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
                    </button>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contributors.map((contributor, index) => (
                        <ContributorCard key={index} contributor={contributor} />
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-4">
                            Project Context
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            This project was developed for the Nuit de l'Info 2024, focusing on creating
                            an educational application that explores the parallels between the human body
                            and the ocean ecosystem.
                        </p>
                        <div className="flex justify-center items-center mt-4">
                            <Wave className="text-blue-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-200">
                Protecting Our Oceans, Understanding Our World
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributorsPage;