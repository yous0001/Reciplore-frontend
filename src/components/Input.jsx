import React from 'react';

const Input = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative mb-5">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none z-10">
          <Icon className="w-5 h-5 text-orange-400" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${
          Icon ? 'pl-11' : 'pl-4'
        } pr-4 py-2.5 bg-stone-900/75 rounded-xl border border-stone-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 text-white placeholder-stone-400 text-sm transition duration-200 focus:outline-none [color-scheme:dark]`}
      />
    </div>
  );
};

export default Input;
