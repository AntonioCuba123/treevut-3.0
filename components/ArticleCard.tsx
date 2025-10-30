import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

interface ArticleCardProps {
    title: string;
    summary: string;
    content: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ title, summary, content, icon: Icon, color }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`bg-surface rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'mb-6' : 'mb-4'}`}>
            <div className={`p-4 ${color} bg-opacity-10`}>
                <div className="flex items-start">
                    <div className={`p-2 rounded-lg ${color} bg-opacity-20 mr-4`}>
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{title}</h3>
                        <p className="text-sm text-on-surface-secondary">{summary}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-sm text-primary font-medium mt-4 hover:underline focus:outline-none"
                >
                    {isExpanded ? (
                        <>
                            Ver menos <ChevronUpIcon className="w-4 h-4 ml-1" />
                        </>
                    ) : (
                        <>
                            Ver más <ChevronDownIcon className="w-4 h-4 ml-1" />
                        </>
                    )}
                </button>
            </div>
            {isExpanded && (
                <div className="p-4 prose prose-sm max-w-none">
                    {content}
                </div>
            )}
        </div>
    );
};

export default ArticleCard;