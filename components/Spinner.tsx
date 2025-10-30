
import React from 'react';

const Spinner: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => {
    const spinner = (
        <div className="w-12 h-12 border-4 border-t-primary border-active-surface rounded-full animate-spin" />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default Spinner;