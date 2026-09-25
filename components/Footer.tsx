import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-950/50 border-t border-gray-800 mt-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div>
                    <div className="flex items-center gap-2">
                        <svg className="h-8 w-8 text-indigo-400" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><line x1="3" y1="6" x2="3" y2="19" /><line x1="12" y1="6" x2="12" y2="19" /><line x1="21" y1="6" x2="21" y2="19" /></svg>
                        <h2 className="text-xl font-bold text-white">Smart Curriculum</h2>
                    </div>
                    <p className="mt-4 text-gray-400 text-sm max-w-xs">
                        An intelligent dashboard for modern education, enhancing online classes and student engagement.
                    </p>
                </div>
                <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} 🐞Debugging Dynamos ✨. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
